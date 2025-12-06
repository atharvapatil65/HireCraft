import { db } from "@/drizzle/db"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"
import { and, count, eq, isNotNull } from "drizzle-orm"

export async function canCreateInterview() {
  // Check for Pro plan (10 interviews) or Free plan (1 interview)
  return await Promise.any([
    // Check for unlimited interviews
    hasPermission("unlimited_interviews").then(
      bool => bool || Promise.reject()
    ),
    // Check for Pro plan with 10 interviews
    Promise.all([hasPermission("10_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 10) return true
        return Promise.reject()
      }
    ),
    // Check for Free plan with 1 interview
    Promise.all([hasPermission("1_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 1) return true
        return Promise.reject()
      }
    ),
  ]).catch(() => false)
}

async function getUserInterviewCount() {
  const { userId } = await getCurrentUser()
  if (userId == null) return 0

  return getInterviewCount(userId)
}

async function getInterviewCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId))
    )

  return c
}
