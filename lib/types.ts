export interface Member {
  id: string
  name: string
  role: string
  compensationType: "hourly" | "monthly"
  hourlyRate?: number
  monthlySalary?: number
  hoursPerWeek: number
  availableHours: number
}

export interface WorkDay {
  date: string // ISO date string (YYYY-MM-DD)
  hours: number
  enabled: boolean // Whether the member works on this day
}

export interface ProjectMember {
  memberId: string
  assignmentType: "daily" | "fixed"
  hoursPerDay?: number // Optional now, used for daily assignments
  totalHours?: number // New field for fixed hour assignments
  actualHours?: number // New field to track actual hours spent
  startDate: string
  endDate: string
  workDays?: WorkDay[] // New field to track specific work days
}

export interface Project {
  id: string
  title: string
  startDate: string
  endDate: string
  originalEndDate: string
  estimatedHours: number
  actualHours: number
  budget: number
  description: string
  members: ProjectMember[]
}

export interface CalendarDay {
  date: Date
  projects: {
    projectId: string
    projectTitle: string
    hours: number
  }[]
}

export interface MemberStats {
  memberId: string
  memberName: string
  totalHours: number
  availableHours: number
  utilizationRate: number
  stressLevel: number
}

export interface ProjectStats {
  projectId: string
  projectTitle: string
  estimatedHours: number
  actualHours: number
  budget: number
  cost: number
  profitability: number
}
