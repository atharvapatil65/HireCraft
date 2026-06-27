"use client"

import { useState, useEffect } from "react"
import { supabase, type Job } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2Icon, MapPinIcon, BuildingIcon, BriefcaseIcon, DollarSignIcon, EditIcon, TrashIcon, MailIcon, RocketIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { PostJob } from "./PostJob"
import { PrepareModal } from "./PrepareModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface JobBoardProps {
  user: User | null
  viewMode: "browse" | "manage"
  onApply?: (job: Job) => void
}

export function JobBoard({ user, viewMode, onApply }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [prepareJob, setPrepareJob] = useState<Job | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      let query = supabase.from("job").select("*").order("created_at", { ascending: false })

      if (viewMode === "manage" && user) {
        query = query.eq("recruiter_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setJobs(data || [])
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, user])

  const handleDelete = async () => {
    if (!deleteJobId || !user) return

    try {
      const { error } = await supabase
        .from("job")
        .delete()
        .eq("id", deleteJobId)
        .eq("recruiter_id", user.id)

      if (error) throw error

      toast.success("Job deleted successfully!")
      setJobs(jobs.filter((job) => job.id !== deleteJobId))
      setDeleteJobId(null)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete job")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {viewMode === "manage"
            ? "You haven't posted any jobs yet."
            : "No jobs available at the moment."}
        </p>
        {viewMode === "manage" && user && (
          <div className="mt-4">
            <PostJob user={user} onJobPosted={fetchJobs} />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <BuildingIcon className="h-4 w-4" />
                    {job.company}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseIcon className="h-4 w-4" />
                {job.type}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSignIcon className="h-4 w-4" />
                {job.salary}
              </div>
              <p className="text-sm line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.split("\n").slice(0, 2).map((req, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {req.substring(0, 30)}
                    {req.length > 30 ? "..." : ""}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {viewMode === "manage" && user?.id === job.recruiter_id ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditJob(job)}
                  >
                    <EditIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteJobId(job.id)}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setPrepareJob(job)}
                  >
                    <RocketIcon className="h-4 w-4 mr-1" />
                    Prepare
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => onApply?.(job)}
                  >
                    <MailIcon className="h-4 w-4 mr-1" />
                    Apply Now
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Job Dialog */}
      {editJob && user && (
        <PostJob
          user={user}
          editJob={editJob}
          onJobPosted={() => {
            fetchJobs()
            setEditJob(null)
          }}
          isOpen={!!editJob}
          onOpenChange={(open) => {
            if (!open) setEditJob(null)
          }}
        />
      )}

      {/* Prepare Modal */}
      {prepareJob && (
        <PrepareModal
          job={prepareJob}
          open={!!prepareJob}
          onClose={() => setPrepareJob(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your job posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
