"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Calendar, Clock, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { calculateMemberStats, calculateProjectStats, formatCurrency } from "@/lib/utils"
import type { MemberStats, ProjectStats } from "@/lib/types"

export default function Dashboard() {
  const router = useRouter()
  const { projects, members } = useStore()
  const [memberStats, setMemberStats] = useState<MemberStats[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (members.length > 0 && projects.length > 0) {
      const memberStatsData = members.map((member) => calculateMemberStats(member, projects))

      const projectStatsData = projects.map((project) => calculateProjectStats(project, members))

      setMemberStats(memberStatsData)
      setProjectStats(projectStatsData)
    }

    setLoading(false)
  }, [members, projects])

  const totalProjects = projects.length
  const totalMembers = members.length
  const activeProjects = projects.filter((p) => new Date(p.endDate) >= new Date()).length

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
  const totalCost = projectStats.reduce((sum, stats) => sum + stats.cost, 0)
  const overallProfitability = totalBudget > 0 ? ((totalBudget - totalCost) / totalBudget) * 100 : 0

  const highStressMembers = memberStats.filter((stats) => stats.stressLevel > 50)

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your projects and team</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <h3 className="text-2xl font-bold">{totalProjects}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{activeProjects} active projects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <h3 className="text-2xl font-bold">{totalMembers}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{highStressMembers.length} members with high stress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalBudget)}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{formatCurrency(totalCost)} spent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profitability</p>
                <h3 className="text-2xl font-bold">{overallProfitability.toFixed(2)}%</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary-dark" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-muted rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    overallProfitability < 0
                      ? "bg-red-500"
                      : overallProfitability < 15
                        ? "bg-yellow-500"
                        : overallProfitability < 30
                          ? "bg-green-500"
                          : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, overallProfitability))}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recent projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects yet</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                        {project.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {new Date(project.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(project.budget)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Current workload of team members</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground">No team members yet</p>
            ) : (
              <div className="space-y-4">
                {memberStats.slice(0, 5).map((stats) => (
                  <div key={stats.memberId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/team/${stats.memberId}`} className="font-medium hover:underline">
                        {stats.memberName}
                      </Link>
                      <span className="text-sm font-medium">{stats.utilizationRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          stats.utilizationRate < 50
                            ? "bg-blue-500"
                            : stats.utilizationRate < 80
                              ? "bg-green-500"
                              : stats.utilizationRate < 100
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, stats.utilizationRate)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Projects ending soon</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects yet</p>
            ) : (
              <div className="space-y-4">
                {projects
                  .filter((p) => new Date(p.endDate) >= new Date())
                  .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                  .slice(0, 5)
                  .map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div>
                        <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                          {project.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {Math.ceil(
                          (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )}{" "}
                        days left
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => navigateTo("/projects/new")}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <BarChart3 className="h-6 w-6 mb-2 text-primary-dark" />
                <span className="text-sm font-medium">New Project</span>
              </div>
              <div
                onClick={() => navigateTo("/team/new")}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Users className="h-6 w-6 mb-2 text-primary-dark" />
                <span className="text-sm font-medium">Add Team Member</span>
              </div>
              <div
                onClick={() => navigateTo("/calendar")}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Calendar className="h-6 w-6 mb-2 text-primary-dark" />
                <span className="text-sm font-medium">View Calendar</span>
              </div>
              <div
                onClick={() => navigateTo("/reports")}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <DollarSign className="h-6 w-6 mb-2 text-primary-dark" />
                <span className="text-sm font-medium">Financial Reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
