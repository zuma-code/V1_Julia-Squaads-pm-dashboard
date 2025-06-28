import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MemberStats, ProjectStats, Member, Project, WorkDay } from "./types"
import { APP_CONFIG, STRESS_LEVELS, UTILIZATION_THRESHOLDS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString(APP_CONFIG.LOCALE)
  } catch {
    return 'Invalid Date'
  }
}

export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
      style: "currency",
      currency: APP_CONFIG.CURRENCY,
    }).format(amount)
  } catch {
    return `€${amount.toFixed(2)}`
  }
}

// Memoized date calculations
const dateCache = new Map<string, Date[]>()

export function getDatesBetween(startDate: string, endDate: string): Date[] {
  const cacheKey = `${startDate}-${endDate}`
  
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: Date[] = []

  if (start > end) {
    return dates
  }

  const currentDate = new Date(start)
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  dateCache.set(cacheKey, dates)
  return dates
}

// Generate work days for a date range with default hours per day
export function generateWorkDays(startDate: string, endDate: string, hoursPerDay: number): WorkDay[] {
  if (!startDate || !endDate || hoursPerDay < 0) {
    return []
  }

  const dates = getDatesBetween(startDate, endDate)
  
  return dates.map(date => {
    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    return {
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      hours: Math.min(hoursPerDay, APP_CONFIG.MAX_HOURS_PER_DAY),
      enabled: !isWeekend, // Disable weekends by default
    }
  })
}

// Calculate the effective hourly rate for a member, considering their compensation type
export function getEffectiveHourlyRate(member: Member): number {
  if (member.compensationType === "hourly") {
    return member.hourlyRate || 0
  } else {
    // For monthly salary, calculate an approximate hourly rate
    const monthlyWorkHours = member.hoursPerWeek * APP_CONFIG.WEEKS_PER_MONTH
    return monthlyWorkHours > 0 ? (member.monthlySalary || 0) / monthlyWorkHours : 0
  }
}

// Optimized member stats calculation with better error handling
export function calculateMemberStats(member: Member, projects: Project[]): MemberStats {
  if (!member || !Array.isArray(projects)) {
    return {
      memberId: member?.id || '',
      memberName: member?.name || 'Unknown',
      totalHours: 0,
      availableHours: member?.availableHours || 0,
      utilizationRate: 0,
      stressLevel: 0,
    }
  }

  const memberProjects = projects.filter((project) => 
    project.members?.some((m) => m.memberId === member.id)
  )

  let totalHours = 0

  for (const project of memberProjects) {
    const memberInProject = project.members.find((m) => m.memberId === member.id)
    if (!memberInProject) continue

    try {
      if (memberInProject.assignmentType === "fixed") {
        totalHours += memberInProject.totalHours || 0
      } else if (memberInProject.workDays?.length) {
        totalHours += memberInProject.workDays
          .filter((day) => day.enabled)
          .reduce((sum, day) => sum + (day.hours || 0), 0)
      } else {
        // Fallback calculation for daily assignments without workDays
        const startDate = new Date(memberInProject.startDate)
        const endDate = new Date(memberInProject.endDate)
        
        if (startDate <= endDate) {
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          totalHours += days * (memberInProject.hoursPerDay || 0)
        }
      }
    } catch (error) {
      console.warn(`Error calculating hours for member ${member.id} in project ${project.id}:`, error)
    }
  }

  const utilizationRate = member.availableHours > 0 ? (totalHours / member.availableHours) * 100 : 0

  // Improved stress level calculation
  let stressLevel = 0
  if (utilizationRate > UTILIZATION_THRESHOLDS.HIGH) {
    stressLevel = Math.min(100, 50 + (utilizationRate - UTILIZATION_THRESHOLDS.HIGH) * 2)
  } else if (utilizationRate > UTILIZATION_THRESHOLDS.OPTIMAL) {
    stressLevel = (utilizationRate - UTILIZATION_THRESHOLDS.OPTIMAL) * 2.5
  }

  return {
    memberId: member.id,
    memberName: member.name,
    totalHours: Math.round(totalHours * 10) / 10,
    availableHours: member.availableHours,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
    stressLevel: Math.round(stressLevel * 10) / 10,
  }
}

// Optimized project stats calculation
export function calculateProjectStats(project: Project, members: Member[]): ProjectStats {
  if (!project || !Array.isArray(members)) {
    return {
      projectId: project?.id || '',
      projectTitle: project?.title || 'Unknown',
      estimatedHours: project?.estimatedHours || 0,
      actualHours: project?.actualHours || 0,
      budget: project?.budget || 0,
      cost: 0,
      profitability: 0,
    }
  }

  let cost = 0

  for (const projectMember of project.members || []) {
    const member = members.find((m) => m.id === projectMember.memberId)
    if (!member) continue

    try {
      let hours = 0

      if (projectMember.assignmentType === "fixed") {
        hours = projectMember.actualHours ?? projectMember.totalHours ?? 0
      } else if (projectMember.workDays?.length) {
        hours = projectMember.workDays
          .filter((day) => day.enabled)
          .reduce((sum, day) => sum + (day.hours || 0), 0)
      } else {
        // Fallback calculation
        const startDate = new Date(projectMember.startDate)
        const endDate = new Date(projectMember.endDate)
        
        if (startDate <= endDate) {
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          hours = days * (projectMember.hoursPerDay || 0)
        }
      }

      const effectiveHourlyRate = getEffectiveHourlyRate(member)
      cost += hours * effectiveHourlyRate
    } catch (error) {
      console.warn(`Error calculating cost for member ${projectMember.memberId} in project ${project.id}:`, error)
    }
  }

  const profitability = project.budget > 0 ? ((project.budget - cost) / project.budget) * 100 : 0

  return {
    projectId: project.id,
    projectTitle: project.title,
    estimatedHours: project.estimatedHours,
    actualHours: project.actualHours,
    budget: project.budget,
    cost: Math.round(cost * 100) / 100,
    profitability: Math.round(profitability * 10) / 10,
  }
}

export function getMonthDays(year: number, month: number): Date[] {
  try {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    return getDatesBetween(startDate.toISOString(), endDate.toISOString())
  } catch {
    return []
  }
}

// Utility functions for color coding
export function getStressLevelColor(level: number): string {
  if (level < STRESS_LEVELS.LOW) return "bg-green-500"
  if (level < STRESS_LEVELS.MEDIUM) return "bg-yellow-500"
  return "bg-red-500"
}

export function getUtilizationColor(rate: number): string {
  if (rate < UTILIZATION_THRESHOLDS.LOW) return "bg-blue-500"
  if (rate < UTILIZATION_THRESHOLDS.OPTIMAL) return "bg-green-500"
  if (rate < UTILIZATION_THRESHOLDS.HIGH) return "bg-yellow-500"
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
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  } catch {
    return 'Invalid'
  }
}

// Check if a date is a weekend
export function isWeekend(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
  } catch {
    return false
  }
}

// Debounce utility for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Format duration in a human-readable way
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  }
  
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  
  if (minutes === 0) {
    return `${wholeHours}h`
  }
  
  return `${wholeHours}h ${minutes}m`
}

// Validate date range
export function isValidDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime())
  } catch {
    return false
  }
}