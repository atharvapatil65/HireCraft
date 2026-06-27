"use client"

import { useState } from "react"
import { RecruiterAuth } from "@/components/job-board/RecruiterAuth"
import { JobBoard } from "@/components/job-board/JobBoard"
import { Applications } from "@/components/job-board/Applications"
import { PostJob } from "@/components/job-board/PostJob"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { BriefcaseIcon, UsersIcon, LogOutIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RecruiterPage() {
  const [user, setUser] = useState<User | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success("Signed out successfully")
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Recruiter Portal</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to manage your job postings and view applications
            </p>
          </div>
          <RecruiterAuth onAuthChange={setUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <PostJob user={user} onJobPosted={() => setRefreshKey((prev) => prev + 1)} />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4" />
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Job Postings</CardTitle>
                <CardDescription>
                  Manage all your active job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobBoard key={refreshKey} user={user} viewMode="manage" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Applications</CardTitle>
                <CardDescription>
                  View and manage applications from candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Applications user={user} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
