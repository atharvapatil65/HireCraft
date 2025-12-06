"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  MapPinIcon, 
  BuildingIcon, 
  BriefcaseIcon, 
  DollarSignIcon, 
  MailIcon,
  RocketIcon,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from "lucide-react"
import type { Job } from "@/lib/supabase/client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface JobMatch {
  jobId: string
  matchScore: number
  matchReason: string
  matchedSkills: string[]
  missingSkills: string[]
}

interface MatchedJobCardProps {
  job: Job
  match: JobMatch
  onApply: (job: Job) => void
  onPrepare?: (job: Job) => void
}

export function MatchedJobCard({ job, match, onApply, onPrepare }: MatchedJobCardProps) {
  const getMatchColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-orange-600"
  }

  const getMatchLabel = (score: number) => {
    if (score >= 70) return "Strong Match"
    if (score >= 50) return "Moderate Match"
    return "Potential Match"
  }

  const getMatchBadgeVariant = (score: number): "default" | "secondary" | "outline" => {
    if (score >= 70) return "default"
    if (score >= 50) return "secondary"
    return "outline"
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <Badge variant={getMatchBadgeVariant(match.matchScore)} className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                {match.matchScore}% Match
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <BuildingIcon className="h-4 w-4" />
              {job.company}
            </CardDescription>
          </div>
        </div>

        {/* Match Score Progress */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${getMatchColor(match.matchScore)}`}>
              {getMatchLabel(match.matchScore)}
            </span>
          </div>
          <Progress value={match.matchScore} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Job Details */}
        <div className="space-y-2">
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
        </div>

        {/* Match Reason */}
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground italic">&quot;{match.matchReason}&quot;</p>
        </div>

        {/* Job Description */}
        <p className="text-sm line-clamp-2">{job.description}</p>

        {/* Matched & Missing Skills Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="skills">
            <AccordionTrigger className="text-sm font-medium">
              View Skills Analysis
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {/* Matched Skills */}
                {match.matchedSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-green-600 mb-2">
                      <CheckCircle2 className="h-3 w-3" />
                      Your Matching Skills ({match.matchedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills.map((skill, idx) => (
                        <Badge key={idx} variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {match.missingSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-600 mb-2">
                      <AlertCircle className="h-3 w-3" />
                      Skills to Develop ({match.missingSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingSkills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onPrepare?.(job)}
        >
          <RocketIcon className="h-4 w-4 mr-1" />
          Prepare
        </Button>
        <Button
          className="flex-1"
          size="sm"
          onClick={() => onApply(job)}
        >
          <MailIcon className="h-4 w-4 mr-1" />
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  )
}
