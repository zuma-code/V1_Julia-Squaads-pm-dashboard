import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MemberStats, ProjectStats, Member, Project, WorkDay } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

// Generate work days for a date range with default hours per day
export function generateWorkDays(startDate: string, endDate: string, hoursPerDay: number): WorkDay[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const workDays: WorkDay[] = []

  const currentDate = new Date(start)
  while (currentDate <= end) {
    // By default, enable work days (Monday-Friday) and disable weekends
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    workDays.push({
      date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD format
      hours: hoursPerDay,
      enabled: !isWeekend, // Disable weekends by default
    })

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return workDays
}

// Calculate the effective hourly rate for a member, considering their compensation type
export function getEffectiveHourlyRate(member: Member): number {
  if (member.compensationType === "hourly") {
    return member.hourlyRate || 0
  } else {
    // For monthly salary, calculate an approximate hourly rate
    // Assuming 4.33 weeks per month on average
    const monthlyWorkHours = member.hoursPerWeek * 4.33
    return monthlyWorkHours > 0 ? (member.monthlySalary || 0) / monthlyWorkHours : 0
  }
}

export function calculateMemberStats(member: Member, projects: Project[]): MemberStats {
  const memberProjects = projects.filter((project) => project.members.some((m) => m.memberId === member.id))

  let totalHours = 0

  memberProjects.forEach((project) => {
    const memberInProject = project.members.find((m) => m.memberId === member.id)
    if (memberInProject) {
      if (memberInProject.assignmentType === "fixed") {
        // For fixed assignments, use the totalHours directly
        totalHours += memberInProject.totalHours || 0
      } else if (memberInProject.workDays) {
        // If workDays is defined, sum up the hours for enabled days
        totalHours += memberInProject.workDays.filter((day) => day.enabled).reduce((sum, day) => sum + day.hours, 0)
      } else {
        // For daily assignments without workDays, calculate based on days and hours per day
        const startDate = new Date(memberInProject.startDate)
        const endDate = new Date(memberInProject.endDate)
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        totalHours += days * (memberInProject.hoursPerDay || 0)
      }
    }
  })

  const utilizationRate = member.availableHours > 0 ? (totalHours / member.availableHours) * 100 : 0

  // Stress level is higher when utilization is over 80%
  const stressLevel = utilizationRate > 100 ? 100 : utilizationRate > 80 ? (utilizationRate - 80) * 5 : 0

  return {
    memberId: member.id,
    memberName: member.name,
    totalHours,
    availableHours: member.availableHours,
    utilizationRate,
    stressLevel,
  }
}

export function calculateProjectStats(project: Project, members: Member[]): ProjectStats {
  let cost = 0

  project.members.forEach((projectMember) => {
    const member = members.find((m) => m.id === projectMember.memberId)
    if (member) {
      let hours = 0

      if (projectMember.assignmentType === "fixed") {
        // For fixed assignments, use the actual hours if available, otherwise use estimated total hours
        hours = projectMember.actualHours !== undefined ? projectMember.actualHours : projectMember.totalHours || 0
      } else if (projectMember.workDays) {
        // If workDays is defined, sum up the hours for enabled days
        hours = projectMember.workDays.filter((day) => day.enabled).reduce((sum, day) => sum + day.hours, 0)
      } else {
        // For daily assignments without workDays, calculate based on days and hours per day
        const startDate = new Date(projectMember.startDate)
        const endDate = new Date(projectMember.endDate)
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        hours = days * (projectMember.hoursPerDay || 0)
      }

      // Use the effective hourly rate for cost calculation
      const effectiveHourlyRate = getEffectiveHourlyRate(member)
      cost += hours * effectiveHourlyRate
    }
  })

  const profitability = project.budget > 0 ? ((project.budget - cost) / project.budget) * 100 : 0

  return {
    projectId: project.id,
    projectTitle: project.title,
    estimatedHours: project.estimatedHours,
    actualHours: project.actualHours,
    budget: project.budget,
    cost,
    profitability,
  }
}

export function getDatesBetween(startDate: string, endDate: string): Date[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []

  const currentDate = new Date(start)
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

export function getMonthDays(year: number, month: number): Date[] {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  return getDatesBetween(startDate.toISOString(), endDate.toISOString())
}

export function getStressLevelColor(level: number): string {
  if (level < 30) return "bg-green-500"
  if (level < 70) return "bg-yellow-500"
  return "bg-red-500"
}

export function getUtilizationColor(rate: number): string {
  if (rate < 50) return "bg-blue-500"
  if (rate < 80) return "bg-green-500"
  if (rate < 100) return "bg-yellow-500"
  return "bg-red-500"
}

export function getProfitabilityColor(rate: number): string {
  if (rate < 0) return "bg-red-500"
  if (rate < 15) return "bg-yellow-500"
  if (rate < 30) return "bg-green-500"
  return "bg-blue-500"
}

// Format date to display day of week
export function formatDayOfWeek(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { weekday: "short" })
}

// Check if a date is a weekend
export function isWeekend(dateString: string): boolean {
  const date = new Date(dateString)
  const day = date.getDay()
  return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}
