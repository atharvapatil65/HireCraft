import { auth } from "@clerk/nextjs/server"
import { DEMO_MODE } from "@/data/env/demo"

type Permission =
  | "unlimited_resume_analysis"
  | "unlimited_interviews"
  | "unlimited_questions"
  | "10_interview"
  | "1_interview"
  | "5_questions"

/**
 * Check if the current user has a specific permission/feature.
 * 
 * FOR PRO USERS: This function automatically grants ALL features if the user
 * has ANY Pro plan feature, bypassing individual feature key checks.
 * This ensures Pro subscribers can access all features even if Clerk
 * feature keys are not perfectly configured.
 */
export async function hasPermission(permission: Permission) {
  if (DEMO_MODE) return true

  const { has } = await auth()
  
  // First check if user has the specific permission
  const hasSpecificPermission = await has({ feature: permission })
  if (hasSpecificPermission) {
    return true
  }
  
  // BYPASS: If user has ANY Pro plan feature, grant ALL Pro features
  // This ensures Pro subscribers always have full access
  const proFeatures = [
    "unlimited_resume_analysis",
    "unlimited_interviews", 
    "unlimited_questions",
    "10_interview"
  ]
  
  // Check if this is a Pro feature being requested
  if (proFeatures.includes(permission)) {
    // Check if user has ANY Pro feature (indicating they're a Pro subscriber)
    for (const proFeature of proFeatures) {
      const hasProFeature = await has({ feature: proFeature })
      if (hasProFeature) {
        // User has at least one Pro feature, grant access to all Pro features
        return true
      }
    }
  }
  
  // Default: no permission
  return false
}
