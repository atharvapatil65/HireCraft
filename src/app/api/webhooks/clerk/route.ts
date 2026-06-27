import { deleteUser, upsertUser } from "@/features/users/db"
import { Webhook } from "svix"
import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!secret) {
    console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET")
    return new Response("Server configuration error", { status: 500 })
  }

  // Get request body as text
  const payload = await request.text()
  const headersList = await headers()
  
  const svixId = headersList.get("svix-id")
  const svixTimestamp = headersList.get("svix-timestamp")
  const svixSignature = headersList.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing svix headers")
    return new Response("Missing webhook headers", { status: 400 })
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    const wh = new Webhook(secret)
    const verified = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> }
    event = verified
  } catch (error) {
    console.error("Webhook verification failed:", error)
    return new Response("Invalid webhook signature", { status: 400 })
  }

  try {
    console.log("Webhook received:", event.type)

    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data as Record<string, unknown>
        const emailAddresses = clerkData.email_addresses as Array<{ id: string; email_address: string }>
        const primaryEmailId = clerkData.primary_email_address_id as string
        const email = emailAddresses.find(
          (e) => e.id === primaryEmailId
        )?.email_address
        if (email == null) {
          console.error("No primary email found")
          return new Response("No primary email found", { status: 400 })
        }

        console.log("Attempting to upsert user:", clerkData.id)
        await upsertUser({
          id: clerkData.id as string,
          email,
          name: `${clerkData.first_name ?? ""} ${clerkData.last_name ?? ""}`.trim(),
          imageUrl: clerkData.image_url as string,
          createdAt: new Date(clerkData.created_at as string),
          updatedAt: new Date(clerkData.updated_at as string),
        })
        console.log("User upserted successfully")

        break
      case "user.deleted":
        const deletedId = (event.data as { id?: string }).id
        if (deletedId == null) {
          return new Response("No user ID found", { status: 400 })
        }

        await deleteUser(deletedId)
        console.log("User deleted:", event.data.id)
        break
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return new Response(
      `Webhook error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    )
  }

  return new Response("Webhook received", { status: 200 })
}