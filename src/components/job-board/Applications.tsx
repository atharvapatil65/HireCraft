"use client"

import { useState, useEffect } from "react"
import { supabase, type Job, type Application } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2Icon, MailIcon, UserIcon, CalendarIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ApplicationsProps {
  user: User | null
}

export function Applications({ user }: ApplicationsProps) {
  const [applications, setApplications] = useState<
    (Application & { job: Job | null })[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchApplications = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get all jobs posted by the recruiter
      const { data: jobs, error: jobsError } = await supabase
        .from("job")
        .select("id")
        .eq("recruiter_id", user.id)

      if (jobsError) throw jobsError

      const jobIds = jobs?.map((job) => job.id) || []

      if (jobIds.length === 0) {
        setApplications([])
        setLoading(false)
        return
      }

      // Get all applications for those jobs
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })

      if (appsError) throw appsError

      // Fetch job details for each application
      const appsWithJobs = await Promise.all(
        (apps || []).map(async (app) => {
          const { data: job } = await supabase
            .from("job")
            .select("*")
            .eq("id", app.job_id)
            .single()

          return { ...app, job }
        })
      )

      setApplications(appsWithJobs)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No applications received yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {app.applicant_name || app.name || "Anonymous"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MailIcon className="h-4 w-4" />
                  {app.applicant_email || app.email || "No email provided"}
                </CardDescription>
              </div>
              <Badge variant="outline">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {new Date(app.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {app.job && (
              <div className="text-sm">
                <strong>Applied for:</strong> {app.job.title} at {app.job.company}
              </div>
            )}
            <div className="text-sm">
              <strong>Message:</strong>
              <p className="mt-1 text-muted-foreground">{app.message || "No message provided"}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ApplyFormProps {
  job: Job
  open: boolean
  onClose: () => void
}

export function ApplyForm({ job, open, onClose }: ApplyFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Include both field naming conventions to ensure compatibility
      const { error } = await supabase.from("applications").insert([
        {
          job_id: job.id,
          applicant_name: formData.applicant_name,
          applicant_email: formData.applicant_email,
          message: formData.message,
          name: formData.applicant_name, // Alternative field name
          email: formData.applicant_email, // Alternative field name
        },
      ])

      if (error) throw error

      toast.success("Application submitted successfully!")
      setFormData({
        applicant_name: "",
        applicant_email: "",
        message: "",
      })
      onClose()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application")
      console.error("Application submission error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            at {job.company} • {job.location}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="text-sm">
                <strong>Job Description:</strong>
                <p className="mt-1 text-muted-foreground">{job.description}</p>
              </div>
              <div className="text-sm">
                <strong>Requirements:</strong>
                <p className="mt-1 text-muted-foreground whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
              <div className="text-sm">
                <strong>Salary:</strong> {job.salary}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicant_name">Full Name *</Label>
                <Input
                  id="applicant_name"
                  name="applicant_name"
                  placeholder="John Doe"
                  value={formData.applicant_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant_email">Email *</Label>
                <Input
                  id="applicant_email"
                  name="applicant_email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.applicant_email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Cover Letter / Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us why you're a great fit for this role..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={6}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
