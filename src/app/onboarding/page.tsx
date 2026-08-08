import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { upsertUser } from "@/features/users/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  const { userId, user } = await getCurrentUser({ allData: true })

  if (userId == null) return redirect("/")
  if (user != null) return redirect("/app")

  const clerkUser = await currentUser()
  if (clerkUser == null) return redirect("/")

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0]
  if (primaryEmail == null) return redirect("/")

  const name =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    primaryEmail.emailAddress.split("@")[0]

  await upsertUser({
    id: clerkUser.id,
    email: primaryEmail.emailAddress,
    name,
    imageUrl: clerkUser.imageUrl,
  })

  return redirect("/app")
}
