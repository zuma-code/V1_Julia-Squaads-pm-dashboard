// Input validation schemas using Zod
import { z } from 'zod'

export const memberSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.string().min(1, 'Role is required'),
  compensationType: z.enum(['hourly', 'monthly']),
  hourlyRate: z.number().min(0).optional(),
  monthlySalary: z.number().min(0).optional(),
  hoursPerWeek: z.number().min(1).max(168, 'Invalid hours per week'),
  availableHours: z.number().min(1, 'Available hours must be positive'),
}).refine((data) => {
  if (data.compensationType === 'hourly' && !data.hourlyRate) {
    return false
  }
  if (data.compensationType === 'monthly' && !data.monthlySalary) {
    return false
  }
  return true
}, {
  message: 'Compensation rate is required based on compensation type'
})

export const projectSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive'),
  budget: z.number().min(0, 'Budget must be positive'),
}).refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate)
}, {
  message: 'End date must be after start date'
})

export const workDaySchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  hours: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  enabled: z.boolean(),
})

export const projectMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  assignmentType: z.enum(['daily', 'fixed']),
  hoursPerDay: z.number().min(0).max(24).optional(),
  totalHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  workDays: z.array(workDaySchema).optional(),
}).refine((data) => {
  if (data.assignmentType === 'daily' && !data.hoursPerDay) {
    return false
  }
  if (data.assignmentType === 'fixed' && !data.totalHours) {
    return false
  }
  return new Date(data.endDate) >= new Date(data.startDate)
}, {
  message: 'Invalid assignment configuration or date range'
})