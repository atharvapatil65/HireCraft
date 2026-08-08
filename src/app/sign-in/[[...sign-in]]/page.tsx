import { SignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { DEMO_MODE } from "@/data/env/demo"

export default function SignInPage() {
  if (DEMO_MODE) redirect("/")

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
