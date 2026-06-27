"use client"

import { useState, useEffect } from "react"
import { supabase, type Job } from "@/lib/supabase/client"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2Icon, PlusIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface PostJobProps {
  user: User
  onJobPosted?: () => void
  editJob?: Job | null
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PostJob({ user, onJobPosted, editJob, trigger, isOpen: controlledOpen, onOpenChange: controlledOnOpenChange }: PostJobProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: "",
    contact: user.email || "",
  })

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen

  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title,
        company: editJob.company,
        location: editJob.location,
        type: editJob.type,
        salary: editJob.salary,
        description: editJob.description,
        requirements: editJob.requirements,
        contact: editJob.contact,
      })
    }
  }, [editJob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editJob) {
        // Update existing job
        const { error } = await supabase
          .from("job")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editJob.id)
          .eq("recruiter_id", user.id)

        if (error) throw error
        toast.success("Job updated successfully!")
      } else {
        // Create new job
        const { error } = await supabase.from("job").insert([
          {
            ...formData,
            recruiter_id: user.id,
          },
        ])

        if (error) throw error
        toast.success("Job posted successfully!")
      }

      setOpen(false)
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        requirements: "",
        contact: user.email || "",
      })
      onJobPosted?.()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to post job")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? "Edit Job" : "Post New Job"}</DialogTitle>
          <DialogDescription>
            {editJob
              ? "Update your job posting"
              : "Fill in the details to create a new job posting"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Product Manager"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                name="company"
                placeholder="Horizon Labs"
                value={formData.company}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Mumbai"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Input
                id="type"
                name="type"
                placeholder="Full-time"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="salary">Salary Range *</Label>
              <Input
                id="salary"
                name="salary"
                placeholder="12 - 14 lakhs"
                value={formData.salary}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contact">Contact Email *</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                placeholder="recruiter@example.com"
                value={formData.contact}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Define product strategy and work with cross-functional teams to deliver features. Analyze metrics and prioritize the roadmap."
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="4+ years of product management experience&#10;Strong communication and analytical skills&#10;Familiarity with Agile methodologies"
              value={formData.requirements}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {editJob ? "Updating..." : "Posting..."}
                </>
              ) : (
                <>{editJob ? "Update Job" : "Post Job"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
