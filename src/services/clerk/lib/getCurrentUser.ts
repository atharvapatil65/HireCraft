import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/dbCache"
import { DEMO_MODE, DEMO_USER } from "@/data/env/demo"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

type RedirectToSignIn = Awaited<ReturnType<typeof auth>>["redirectToSignIn"]

type GetCurrentUserResult = {
  userId: string | null
  redirectToSignIn: RedirectToSignIn
  user: typeof UserTable.$inferSelect | undefined
}

export async function getCurrentUser({
  allData = false,
}: {
  allData?: boolean
} = {}): Promise<GetCurrentUserResult> {
  if (DEMO_MODE) {
    let user: typeof UserTable.$inferSelect | undefined

    if (allData) {
      user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, DEMO_USER.id),
      })
      if (user == null) {
        await db.insert(UserTable).values(DEMO_USER).onConflictDoNothing()
        user =
          (await db.query.UserTable.findFirst({
            where: eq(UserTable.id, DEMO_USER.id),
          })) ?? undefined
      }
    }

    return {
      userId: DEMO_USER.id,
      redirectToSignIn: () => {
        throw new Error("redirectToSignIn is not available in demo mode")
      },
      user,
    }
  }

  const { userId, redirectToSignIn } = await auth()

  return {
    userId,
    redirectToSignIn,
    user: allData && userId != null ? await getUser(userId) : undefined,
  }
}

async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}
