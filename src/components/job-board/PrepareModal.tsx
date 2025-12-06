"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { experienceLevels } from "@/drizzle/schema/jobInfo"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import { createJobInfo } from "@/features/jobInfos/actions"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import type { Job } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PrepareModalProps {
  job: Job
  open: boolean
  onClose: () => void
}

export function PrepareModal({ job, open, onClose }: PrepareModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: `${job.title} at ${job.company}`,
    title: job.title,
    description: `${job.description}\n\nRequirements:\n${job.requirements}\n\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary}`,
    experienceLevel: "mid-level" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await createJobInfo({
        ...formData,
        title: formData.title || null,
      })

      if (res.error) {
        toast.error(res.message)
      } else {
        toast.success("Job information saved! Redirecting to interview preparation...")
        onClose()
        // Redirect to the app page after successful creation
        setTimeout(() => {
          router.push("/app")
        }, 500)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save job information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Welcome to HireCraft</DialogTitle>
          <DialogDescription className="text-base pt-2">
            To get started, enter information about the type of job you are wanting
            to apply for. This can be specific information copied directly from a
            job listing or general information such as the tech stack you want to
            work in. The more specific you are in the description the closer the
            test interviews will be to the real thing.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This name is displayed in the UI for easy identification.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional. Only enter if there is a specific job title you are applying for.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatExperienceLevel(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={10}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Be as specific as possible. The more information you provide, the better the interviews will be.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Job Information"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
