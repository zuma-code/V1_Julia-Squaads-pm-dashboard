"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, DollarSign, Edit, Trash2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import { calculateMemberStats, formatCurrency, formatDate } from "@/lib/utils"
import type { MemberStats } from "@/lib/types"

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { members, projects, deleteMember } = useStore()

  const [member, setMember] = useState(members.find((m) => m.id === params.id))
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null)

  useEffect(() => {
    const currentMember = members.find((m) => m.id === params.id)
    if (!currentMember) {
      router.push("/team")
      return
    }

    setMember(currentMember)

    const stats = calculateMemberStats(currentMember, projects)
    setMemberStats(stats)
  }, [params.id, members, projects, router])

  if (!member) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading member details...</p>
        </div>
      </div>
    )
  }

  const memberProjects = projects.filter((project) => project.members.some((m) => m.memberId === member.id))

  const handleDeleteMember = () => {
    deleteMember(member.id)
    toast({
      title: "Success",
      description: "Team member deleted successfully",
    })
    router.push("/team")
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary-dark">{member.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/team/${member.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Member
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Team Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this team member? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteMember}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                  <p className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    {member.role}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Compensation</h3>
                  <p className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    {member.compensationType === "hourly"
                      ? `${formatCurrency(member.hourlyRate || 0)} per hour`
                      : `${formatCurrency(member.monthlySalary || 0)} per month`}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Hours Per Week</h3>
                  <p className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {member.hoursPerWeek} hours
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Available Hours</h3>
                  <p className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {member.availableHours} hours per month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {memberProjects.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No projects assigned to this team member yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberProjects.map((project) => {
                    const memberInProject = project.members.find((m) => m.memberId === member.id)
                    if (!memberInProject) return null

                    return (
                      <div key={project.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                            {project.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(memberInProject.startDate)} - {formatDate(memberInProject.endDate)}
                          </p>
                          <p className="text-sm">
                            {memberInProject.assignmentType === "daily"
                              ? `${memberInProject.hoursPerDay} hours per day`
                              : `${memberInProject.totalHours} total hours (${
                                  memberInProject.actualHours || 0
                                } actual hours)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Project
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              {memberStats && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Hours</h3>
                    <div className="flex items-center justify-between">
                      <span>Assigned</span>
                      <span className="font-medium">{memberStats.totalHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Available</span>
                      <span className="font-medium">{memberStats.availableHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Remaining</span>
                      <span
                        className={`font-medium ${
                          memberStats.availableHours - memberStats.totalHours < 0
                            ? "text-destructive"
                            : "text-secondary-green"
                        }`}
                      >
                        {memberStats.availableHours - memberStats.totalHours}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Utilization Rate</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span>Rate</span>
                      <span
                        className={`font-medium ${
                          memberStats.utilizationRate > 100
                            ? "text-destructive"
                            : memberStats.utilizationRate > 80
                              ? "text-secondary-orange"
                              : "text-secondary-green"
                        }`}
                      >
                        {memberStats.utilizationRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          memberStats.utilizationRate < 50
                            ? "bg-blue-500"
                            : memberStats.utilizationRate < 80
                              ? "bg-green-500"
                              : memberStats.utilizationRate < 100
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, memberStats.utilizationRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Stress Level</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span>Level</span>
                      <span
                        className={`font-medium ${
                          memberStats.stressLevel < 30
                            ? "text-secondary-green"
                            : memberStats.stressLevel < 70
                              ? "text-secondary-orange"
                              : "text-destructive"
                        }`}
                      >
                        {memberStats.stressLevel.toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          memberStats.stressLevel < 30
                            ? "bg-green-500"
                            : memberStats.stressLevel < 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, memberStats.stressLevel)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Projects</span>
                  <span className="font-medium">{memberProjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Projects</span>
                  <span className="font-medium">
                    {memberProjects.filter((p) => new Date(p.endDate) >= new Date()).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed Projects</span>
                  <span className="font-medium">
                    {memberProjects.filter((p) => new Date(p.endDate) < new Date()).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
