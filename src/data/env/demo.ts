export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true"

export const DEMO_USER_ID = "demo-user"

export const DEMO_USER = {
  id: DEMO_USER_ID,
  name: "Demo User",
  email: "demo@hirecraft.app",
  imageUrl: "",
} as const
