"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, DollarSign, Edit, Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"
import { calculateProjectStats, formatCurrency, formatDate, generateWorkDays } from "@/lib/utils"
import { WorkDaysEditor } from "@/components/work-days-editor"
import type { ProjectStats, WorkDay } from "@/lib/types"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    projects,
    members,
    deleteProject,
    assignMemberToProject,
    removeMemberFromProject,
    updateMemberInProject,
    updateProjectEndDate,
    updateActualHours,
  } = useStore()

  const [project, setProject] = useState(projects.find((p) => p.id === params.id))
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [newEndDate, setNewEndDate] = useState("")
  const [actualHours, setActualHours] = useState(0)

  // Member assignment form state
  const [assignForm, setAssignForm] = useState({
    memberId: "",
    assignmentType: "daily",
    hoursPerDay: 4,
    totalHours: 0,
    actualHours: 0,
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const currentProject = projects.find((p) => p.id === params.id)
    if (!currentProject) {
      router.push("/projects")
      return
    }

    setProject(currentProject)
    setNewEndDate(currentProject.endDate)
    setActualHours(currentProject.actualHours)

    const stats = calculateProjectStats(currentProject, members)
    setProjectStats(stats)

    // Initialize assignment form with project dates
    setAssignForm((prev) => ({
      ...prev,
      startDate: currentProject.startDate,
      endDate: currentProject.endDate,
    }))
  }, [params.id, projects, members, router])

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  const availableMembers = members.filter((member) => !project.members.some((pm) => pm.memberId === member.id))

  const assignedMembers = project.members.map((pm) => {
    const member = members.find((m) => m.id === pm.memberId)
    return {
      ...pm,
      name: member?.name || "Unknown",
      role: member?.role || "Unknown",
    }
  })

  const handleDeleteProject = () => {
    deleteProject(project.id)
    toast({
      title: "Success",
      description: "Project deleted successfully",
    })
    router.push("/projects")
  }

  const handleAssignMember = () => {
    if (!assignForm.memberId) {
      toast({
        title: "Error",
        description: "Please select a team member",
        variant: "destructive",
      })
      return
    }

    if (new Date(assignForm.endDate) < new Date(assignForm.startDate)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      })
      return
    }

    if (assignForm.assignmentType === "fixed" && assignForm.totalHours <= 0) {
      toast({
        title: "Error",
        description: "Total hours must be greater than zero",
        variant: "destructive",
      })
      return
    }

    if (assignForm.assignmentType === "daily" && assignForm.hoursPerDay <= 0) {
      toast({
        title: "Error",
        description: "Hours per day must be greater than zero",
        variant: "destructive",
      })
      return
    }

    // Generate work days if assignment type is daily
    const workDays =
      assignForm.assignmentType === "daily"
        ? generateWorkDays(assignForm.startDate, assignForm.endDate, assignForm.hoursPerDay)
        : undefined

    const projectMember = {
      memberId: assignForm.memberId,
      assignmentType: assignForm.assignmentType as "daily" | "fixed",
      ...(assignForm.assignmentType === "daily" ? { hoursPerDay: assignForm.hoursPerDay } : {}),
      ...(assignForm.assignmentType === "fixed"
        ? {
            totalHours: assignForm.totalHours,
            actualHours: 0, // Initialize actual hours to 0
          }
        : {}),
      startDate: assignForm.startDate,
      endDate: assignForm.endDate,
      workDays, // Add the work days array
    }

    assignMemberToProject(project.id, projectMember)

    toast({
      title: "Success",
      description: "Member assigned to project",
    })

    // Reset form
    setAssignForm({
      memberId: "",
      assignmentType: "daily",
      hoursPerDay: 4,
      totalHours: 0,
      actualHours: 0,
      startDate: project.startDate,
      endDate: project.endDate,
    })
  }

  const handleRemoveMember = (memberId: string) => {
    removeMemberFromProject(project.id, memberId)
    toast({
      title: "Success",
      description: "Member removed from project",
    })
  }

  const handleUpdateMemberHours = (memberId: string, hoursPerDay: number) => {
    const member = project.members.find((m) => m.memberId === memberId)
    if (member && member.assignmentType === "daily") {
      // Update the hours per day and regenerate work days if they don't exist
      const updatedMember = {
        ...member,
        hoursPerDay,
        workDays: member.workDays
          ? member.workDays.map((day) => ({ ...day, hours: hoursPerDay }))
          : generateWorkDays(member.startDate, member.endDate, hoursPerDay),
      }

      updateMemberInProject(project.id, updatedMember)

      toast({
        title: "Success",
        description: "Member hours updated",
      })
    }
  }

  const handleUpdateMemberWorkDays = (memberId: string, workDays: WorkDay[]) => {
    const member = project.members.find((m) => m.memberId === memberId)
    if (member) {
      updateMemberInProject(project.id, {
        ...member,
        workDays,
      })

      toast({
        title: "Success",
        description: "Member work days updated",
      })
    }
  }

  const handleUpdateMemberTotalHours = (memberId: string, totalHours: number, actualHours: number) => {
    const member = project.members.find((m) => m.memberId === memberId)
    if (member && member.assignmentType === "fixed") {
      updateMemberInProject(project.id, {
        ...member,
        totalHours,
        actualHours,
      })

      toast({
        title: "Success",
        description: "Member hours updated",
      })
    }
  }

  const handleUpdateEndDate = () => {
    if (new Date(newEndDate) < new Date(project.startDate)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      })
      return
    }

    updateProjectEndDate(project.id, newEndDate)

    toast({
      title: "Success",
      description: "Project end date updated",
    })
  }

  const handleUpdateActualHours = () => {
    updateActualHours(project.id, actualHours)

    toast({
      title: "Success",
      description: "Actual hours updated",
    })
  }

  // Calculate total hours for a member based on their work days
  const calculateMemberTotalHours = (memberId: string) => {
    const member = project.members.find((m) => m.memberId === memberId)
    if (!member) return 0

    if (member.assignmentType === "fixed") {
      return member.totalHours || 0
    }

    if (member.workDays) {
      return member.workDays.filter((day) => day.enabled).reduce((sum, day) => sum + day.hours, 0)
    }

    // Fallback to calculation based on days and hours per day
    const startDate = new Date(member.startDate)
    const endDate = new Date(member.endDate)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * (member.hoursPerDay || 0)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary-dark">{project.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject}>
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
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Start Date</h3>
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDate(project.startDate)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">End Date</h3>
                  <div className="flex items-center gap-2">
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(project.endDate)}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update End Date</DialogTitle>
                          <DialogDescription>
                            Change the project end date. The original end date will be preserved for reference.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newEndDate">New End Date</Label>
                            <Input
                              id="newEndDate"
                              type="date"
                              value={newEndDate}
                              onChange={(e) => setNewEndDate(e.target.value)}
                            />
                          </div>
                          {project.originalEndDate && project.originalEndDate !== project.endDate && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Original end date: {formatDate(project.originalEndDate)}
                              </p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateEndDate}>Update</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated Hours</h3>
                  <p className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {project.estimatedHours} hours
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Actual Hours</h3>
                  <div className="flex items-center gap-2">
                    <p className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {project.actualHours} hours
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Actual Hours</DialogTitle>
                          <DialogDescription>Update the actual hours spent on this project.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="actualHours">Actual Hours</Label>
                            <Input
                              id="actualHours"
                              type="number"
                              min="0"
                              step="0.5"
                              value={actualHours}
                              onChange={(e) => setActualHours(Number.parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateActualHours}>Update</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Budget</h3>
                  <p className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatCurrency(project.budget)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Team Members</h3>
                  <p className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {assignedMembers.length} members
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-sm">{project.description || "No description provided."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Assign Team Member</DialogTitle>
                    <DialogDescription>Assign a team member to this project and set their hours.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberId">Team Member</Label>
                      <Select
                        value={assignForm.memberId}
                        onValueChange={(value) => setAssignForm((prev) => ({ ...prev, memberId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No available members
                            </SelectItem>
                          ) : (
                            availableMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} ({member.role})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Assignment Type</Label>
                      <RadioGroup
                        value={assignForm.assignmentType}
                        onValueChange={(value) => setAssignForm((prev) => ({ ...prev, assignmentType: value }))}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="daily" />
                          <Label htmlFor="daily" className="cursor-pointer">
                            Hours per day
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed" className="cursor-pointer">
                            Fixed total hours
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {assignForm.assignmentType === "daily" ? (
                      <div className="space-y-2">
                        <Label htmlFor="hoursPerDay">Hours Per Day</Label>
                        <Input
                          id="hoursPerDay"
                          type="number"
                          min="0.5"
                          max="24"
                          step="0.5"
                          value={assignForm.hoursPerDay}
                          onChange={(e) =>
                            setAssignForm((prev) => ({
                              ...prev,
                              hoursPerDay: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="totalHours">Total Estimated Hours</Label>
                        <Input
                          id="totalHours"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={assignForm.totalHours}
                          onChange={(e) =>
                            setAssignForm((prev) => ({
                              ...prev,
                              totalHours: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={assignForm.startDate}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={assignForm.endDate}
                          onChange={(e) => setAssignForm((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button onClick={handleAssignMember}>Assign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {assignedMembers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No team members assigned to this project yet.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>{/* Same content as above */}</DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedMembers.map((member) => {
                    const memberData = members.find((m) => m.id === member.memberId)
                    const totalHours = calculateMemberTotalHours(member.memberId)

                    return (
                      <div key={member.memberId} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <p className="text-sm">
                              {formatDate(member.startDate)} - {formatDate(member.endDate)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.memberId)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {member.assignmentType === "daily" ? (
                          <div className="mt-2 space-y-3">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`hours-${member.memberId}`} className="text-sm">
                                Hours/day:
                              </Label>
                              <Input
                                id={`hours-${member.memberId}`}
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={member.hoursPerDay}
                                onChange={(e) =>
                                  handleUpdateMemberHours(member.memberId, Number.parseFloat(e.target.value) || 0)
                                }
                                className="w-20 h-8"
                              />

                              <div className="ml-auto text-sm text-muted-foreground">Total: {totalHours} hours</div>
                            </div>

                            <div className="flex items-center">
                              {/* Add Work Days Editor with more prominence */}
                              <WorkDaysEditor
                                workDays={
                                  member.workDays ||
                                  generateWorkDays(member.startDate, member.endDate, member.hoursPerDay || 0)
                                }
                                onSave={(workDays) => handleUpdateMemberWorkDays(member.memberId, workDays)}
                              />
                              <span className="ml-2 text-xs text-muted-foreground">
                                Customize which days this member works on the project
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`total-${member.memberId}`} className="text-sm">
                                Estimated hours:
                              </Label>
                              <Input
                                id={`total-${member.memberId}`}
                                type="number"
                                min="0"
                                step="0.5"
                                value={member.totalHours}
                                onChange={(e) =>
                                  handleUpdateMemberTotalHours(
                                    member.memberId,
                                    Number.parseFloat(e.target.value) || 0,
                                    member.actualHours || 0,
                                  )
                                }
                                className="w-24 h-8"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`actual-${member.memberId}`} className="text-sm">
                                Actual hours:
                              </Label>
                              <Input
                                id={`actual-${member.memberId}`}
                                type="number"
                                min="0"
                                step="0.5"
                                value={member.actualHours || 0}
                                onChange={(e) =>
                                  handleUpdateMemberTotalHours(
                                    member.memberId,
                                    member.totalHours || 0,
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-24 h-8"
                              />
                            </div>
                          </div>
                        )}
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
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {projectStats && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Hours</h3>
                    <div className="flex items-center justify-between">
                      <span>Estimated</span>
                      <span className="font-medium">{projectStats.estimatedHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Actual</span>
                      <span className="font-medium">{projectStats.actualHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Difference</span>
                      <span
                        className={`font-medium ${
                          projectStats.actualHours > projectStats.estimatedHours
                            ? "text-destructive"
                            : "text-secondary-green"
                        }`}
                      >
                        {projectStats.actualHours - projectStats.estimatedHours}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Financials</h3>
                    <div className="flex items-center justify-between">
                      <span>Budget</span>
                      <span className="font-medium">{formatCurrency(projectStats.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cost</span>
                      <span className="font-medium">{formatCurrency(projectStats.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Profit</span>
                      <span
                        className={`font-medium ${
                          projectStats.budget - projectStats.cost < 0 ? "text-destructive" : "text-secondary-green"
                        }`}
                      >
                        {formatCurrency(projectStats.budget - projectStats.cost)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Profitability</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span>Rate</span>
                      <span
                        className={`font-medium ${
                          projectStats.profitability < 0
                            ? "text-destructive"
                            : projectStats.profitability < 15
                              ? "text-secondary-orange"
                              : "text-secondary-green"
                        }`}
                      >
                        {projectStats.profitability.toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          projectStats.profitability < 0
                            ? "bg-red-500"
                            : projectStats.profitability < 15
                              ? "bg-yellow-500"
                              : projectStats.profitability < 30
                                ? "bg-green-500"
                                : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, projectStats.profitability))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Start Date</span>
                  <span className="font-medium">{formatDate(project.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>End Date</span>
                  <span className="font-medium">{formatDate(project.endDate)}</span>
                </div>
                {project.originalEndDate && project.originalEndDate !== project.endDate && (
                  <div className="flex items-center justify-between">
                    <span>Original End Date</span>
                    <span className="font-medium text-muted-foreground">{formatDate(project.originalEndDate)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span
                    className={`font-medium ${
                      new Date(project.endDate) < new Date() ? "text-muted-foreground" : "text-secondary-green"
                    }`}
                  >
                    {new Date(project.endDate) < new Date() ? "Completed" : "Active"}
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
