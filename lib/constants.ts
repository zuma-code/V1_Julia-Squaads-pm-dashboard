// Application constants
export const APP_CONFIG = {
  MAX_PROJECTS_PER_PAGE: 20,
  MAX_MEMBERS_PER_PAGE: 20,
  DEFAULT_HOURS_PER_DAY: 8,
  MAX_HOURS_PER_DAY: 24,
  WORK_DAYS_PER_WEEK: 5,
  WEEKS_PER_MONTH: 4.33,
  CURRENCY: 'EUR',
  LOCALE: 'es-ES',
} as const

export const STRESS_LEVELS = {
  LOW: 30,
  MEDIUM: 70,
  HIGH: 100,
} as const

export const UTILIZATION_THRESHOLDS = {
  LOW: 50,
  OPTIMAL: 80,
  HIGH: 100,
} as const

export const PROFITABILITY_THRESHOLDS = {
  POOR: 0,
  LOW: 15,
  GOOD: 30,
} as const

export const ROLES = [
  'Developer',
  'Designer', 
  'Project Manager',
  'QA Engineer',
  'DevOps Engineer',
  'Product Owner',
  'Other'
] as const

export const CHART_COLORS = [
  '#0088FE',
  '#00C49F', 
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FF6B6B',
  '#6B66FF'
] as const