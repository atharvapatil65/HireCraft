import { ThemeToggle } from "@/components/ThemeToggle"
import { BrainCircuitIcon } from "lucide-react"
import Link from "next/link"

export default function BrowseJobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="h-header border-b">
        <div className="container flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuitIcon className="size-8 text-primary" />
            <span className="text-xl font-bold">HireCraft</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      {children}
    </>
  )
}
