import { google } from "@/services/ai/models/google"
import { generateObject } from "ai"
import { NextRequest } from "next/server"
import { z } from "zod"
import type { Job } from "@/lib/supabase/client"

const matchResultSchema = z.object({
  jobMatches: z.array(
    z.object({
      jobId: z.string().describe("The ID of the job"),
      matchScore: z.number().min(0).max(100).describe("Match score from 0-100"),
      matchReason: z.string().describe("Brief explanation of why this job matches"),
      matchedSkills: z.array(z.string()).describe("Skills from resume that match job requirements"),
      missingSkills: z.array(z.string()).describe("Important skills the candidate lacks for this job"),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const resume = formData.get("resume") as File
    const jobsData = formData.get("jobs") as string

    if (!resume) {
      return new Response("Resume file is required", { status: 400 })
    }

    if (!jobsData) {
      return new Response("Jobs data is required", { status: 400 })
    }

    const jobs = JSON.parse(jobsData)

    // Extract resume text
    const resumeText = await resume.text()

    // Create a detailed prompt for job matching
    const prompt = `You are an expert career advisor and recruiter. Analyze the candidate's resume and match it against the provided job listings.

CANDIDATE'S RESUME:
${resumeText}

JOB LISTINGS:
${jobs.map((job: Job, idx: number) => `
Job ${idx + 1}:
ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Salary: ${job.salary}
Description: ${job.description}
Requirements: ${job.requirements}
`).join('\n---\n')}

For each job, provide:
1. A match score (0-100) based on:
   - Skills alignment (40%)
   - Experience relevance (30%)
   - Education/qualifications (20%)
   - Location/preferences (10%)

2. A clear explanation of why this job matches or doesn't match

3. List of matched skills from the resume

4. List of important missing skills

Be honest and realistic in your assessments. A score of 70+ indicates a strong match, 50-69 moderate match, below 50 weak match.`

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: matchResultSchema,
      prompt,
    })

    // Sort jobs by match score
    const sortedMatches = object.jobMatches.sort((a, b) => b.matchScore - a.matchScore)

    return Response.json({
      success: true,
      matches: sortedMatches,
    })
  } catch (error: unknown) {
    console.error("Error matching jobs:", error)
    const message = error instanceof Error ? error.message : "Failed to match jobs"
    return new Response(message, {
      status: 500,
    })
  }
}
