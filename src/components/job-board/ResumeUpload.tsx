"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Job } from "@/lib/supabase/client"

interface JobMatch {
  jobId: string
  matchScore: number
  matchReason: string
  matchedSkills: string[]
  missingSkills: string[]
}

interface ResumeUploadProps {
  jobs: Job[]
  onMatchComplete: (matches: JobMatch[]) => void
  onClear: () => void
}

export function ResumeUpload({ jobs, onMatchComplete, onClear }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".txt")) {
        toast.error("Please upload a valid resume file (PDF, DOC, DOCX, or TXT)")
        return
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setFile(selectedFile)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload your resume first")
      return
    }

    if (jobs.length === 0) {
      toast.error("No jobs available to match")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jobs", JSON.stringify(jobs))

      const response = await fetch("/api/ai/jobs/match", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to analyze resume")
      }

      const data = await response.json()
      
      if (data.success && data.matches) {
        toast.success(`Found ${data.matches.length} job matches!`)
        onMatchComplete(data.matches)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error: unknown) {
      console.error("Error analyzing resume:", error)
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume")
    } finally {
      setLoading(false)
    }
  }

  const handleClearResume = () => {
    setFile(null)
    onClear()
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI-Powered Job Matching</CardTitle>
          </div>
          {file && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearResume}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <CardDescription>
          Upload your resume to get personalized job recommendations based on your skills and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Your Resume</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze & Match
                  </>
                )}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: PDF, DOC, DOCX, TXT</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Your resume is analyzed securely and not stored</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
