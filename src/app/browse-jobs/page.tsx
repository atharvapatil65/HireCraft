"use client"

import { useState, useEffect } from "react"
import { JobBoard } from "@/components/job-board/JobBoard"
import { ApplyForm } from "@/components/job-board/Applications"
import { ResumeUpload } from "@/components/job-board/ResumeUpload"
import { MatchedJobCard } from "@/components/job-board/MatchedJobCard"
import { PrepareModal } from "@/components/job-board/PrepareModal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, Loader2Icon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, type Job } from "@/lib/supabase/client"
import { toast } from "sonner"

interface JobMatch {
  jobId: string
  matchScore: number
  matchReason: string
  matchedSkills: string[]
  missingSkills: string[]
}

export default function BrowseJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [prepareJob, setPrepareJob] = useState<Job | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [isPersonalized, setIsPersonalized] = useState(false)

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("job")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleMatchComplete = (jobMatches: JobMatch[]) => {
    setMatches(jobMatches)
    setIsPersonalized(true)
  }

  const handleClearPersonalization = () => {
    setMatches([])
    setIsPersonalized(false)
  }

  // Get matched jobs sorted by score
  const getMatchedJobs = () => {
    if (!isPersonalized || matches.length === 0) return []
    
    return matches
      .map(match => {
        const job = jobs.find(j => j.id === match.jobId)
        return job ? { job, match } : null
      })
      .filter((item): item is { job: Job; match: JobMatch } => item !== null)
  }

  const matchedJobs = getMatchedJobs()

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Browse Jobs</h1>
              <p className="text-muted-foreground">
                {isPersonalized 
                  ? "Personalized job recommendations based on your resume"
                  : "Discover exciting career opportunities"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Resume Upload for Personalized Matching */}
        {!loading && jobs.length > 0 && (
          <ResumeUpload
            jobs={jobs}
            onMatchComplete={handleMatchComplete}
            onClear={handleClearPersonalization}
          />
        )}

        {/* Personalized Job Matches */}
        {isPersonalized && matchedJobs.length > 0 && (
          <div className="mb-6">
            <Alert className="mb-4 border-primary/20 bg-primary/5">
              <AlertDescription>
                Showing {matchedJobs.length} personalized job matches ranked by compatibility with your resume.
                Jobs with 70+ match score are highly recommended!
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Personalized Matches</CardTitle>
                <CardDescription>
                  Jobs ranked by how well they match your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedJobs.map(({ job, match }) => (
                    <MatchedJobCard
                      key={job.id}
                      job={job}
                      match={match}
                      onApply={(job) => setSelectedJob(job)}
                      onPrepare={(job) => setPrepareJob(job)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Jobs (default view or when no personalization) */}
        {!isPersonalized && (
          <Card>
            <CardHeader>
              <CardTitle>Available Positions</CardTitle>
              <CardDescription>
                Click &quot;Apply Now&quot; to submit your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <JobBoard
                  user={null}
                  viewMode="browse"
                  onApply={(job) => setSelectedJob(job)}
                />
              )}
            </CardContent>
          </Card>
        )}

        {selectedJob && (
          <ApplyForm
            job={selectedJob}
            open={!!selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}

        {prepareJob && (
          <PrepareModal
            job={prepareJob}
            open={!!prepareJob}
            onClose={() => setPrepareJob(null)}
          />
        )}
      </div>
    </div>
  )
}
