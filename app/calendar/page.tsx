"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { getMonthDays } from "@/lib/utils"

export default function CalendarPage() {
  const { projects, members } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMember, setSelectedMember] = useState<string>("all")

  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const getProjectsForDay = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]

    return projects.filter((project) => {
      const projectStartDate = new Date(project.startDate)
      const projectEndDate = new Date(project.endDate)

      // Check if the date is within the project timeframe
      if (date >= projectStartDate && date <= projectEndDate) {
        // If a member is selected, check if they're assigned to this project
        if (selectedMember !== "all") {
          const memberInProject = project.members.find((m) => m.memberId === selectedMember)

          if (memberInProject) {
            // If workDays is defined, check if this specific day is enabled
            if (memberInProject.workDays) {
              const workDay = memberInProject.workDays.find((day) => day.date === dateString)
              return workDay && workDay.enabled
            }

            // Otherwise check if the date is within the member's assignment timeframe
            const memberStartDate = new Date(memberInProject.startDate)
            const memberEndDate = new Date(memberInProject.endDate)
            return date >= memberStartDate && date <= memberEndDate
          }

          return false
        }

        return true
      }

      return false
    })
  }

  const getMemberHoursForDay = (date: Date, memberId: string) => {
    const dateString = date.toISOString().split("T")[0]
    let totalHours = 0

    projects.forEach((project) => {
      const projectStartDate = new Date(project.startDate)
      const projectEndDate = new Date(project.endDate)

      // Check if the date is within the project timeframe
      if (date >= projectStartDate && date <= projectEndDate) {
        const memberInProject = project.members.find((m) => m.memberId === memberId)

        if (memberInProject) {
          // If workDays is defined, check if this specific day is enabled
          if (memberInProject.workDays) {
            const workDay = memberInProject.workDays.find((day) => day.date === dateString)
            if (workDay && workDay.enabled) {
              totalHours += workDay.hours
            }
            return
          }

          // Otherwise use the traditional calculation
          const memberStartDate = new Date(memberInProject.startDate)
          const memberEndDate = new Date(memberInProject.endDate)

          // Check if the date is within the member's assignment timeframe
          if (date >= memberStartDate && date <= memberEndDate) {
            if (memberInProject.assignmentType === "daily") {
              // For daily assignments, use hours per day
              totalHours += memberInProject.hoursPerDay || 0
            } else if (memberInProject.assignmentType === "fixed") {
              // For fixed assignments, distribute hours evenly across the assignment period
              const totalDays = Math.ceil((memberEndDate.getTime() - memberStartDate.getTime()) / (1000 * 60 * 60 * 24))
              if (totalDays > 0) {
                totalHours += (memberInProject.totalHours || 0) / totalDays
              }
            }
          }
        }
      }
    })

    return Math.round(totalHours * 10) / 10 // Round to 1 decimal place
  }

  const getProjectColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
    ]

    return colors[index % colors.length]
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">Calendar</h1>
        <p className="text-muted-foreground">View project assignments by date</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Project Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border">
            {weekdays.map((day) => (
              <div key={day} className="bg-card p-2 text-center font-medium">
                {day}
              </div>
            ))}

            {Array.from({ length: monthDays[0].getDay() }).map((_, index) => (
              <div key={`empty-start-${index}`} className="bg-card"></div>
            ))}

            {monthDays.map((day) => {
              const dayProjects = getProjectsForDay(day)
              const isToday = new Date().toDateString() === day.toDateString()
              const dateString = day.toISOString().split("T")[0]

              return (
                <div key={day.toISOString()} className={`calendar-day ${isToday ? "bg-muted" : "bg-card"}`}>
                  <div className="calendar-day-header flex justify-between">
                    <span className={isToday ? "font-bold" : ""}>{day.getDate()}</span>
                    {selectedMember !== "all" && (
                      <span className="text-muted-foreground">{getMemberHoursForDay(day, selectedMember)}h</span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayProjects.map((project, index) => {
                      // If a member is selected, only show their hours
                      let hoursText = ""
                      if (selectedMember !== "all") {
                        const memberInProject = project.members.find((m) => m.memberId === selectedMember)
                        if (memberInProject) {
                          // If workDays is defined, get hours for this specific day
                          if (memberInProject.workDays) {
                            const workDay = memberInProject.workDays.find((day) => day.date === dateString)
                            if (workDay && workDay.enabled) {
                              hoursText = `${workDay.hours}h`
                            }
                          } else if (memberInProject.assignmentType === "daily") {
                            hoursText = `${memberInProject.hoursPerDay}h`
                          } else {
                            // For fixed assignments, show distributed hours
                            const memberStartDate = new Date(memberInProject.startDate)
                            const memberEndDate = new Date(memberInProject.endDate)
                            const totalDays = Math.ceil(
                              (memberEndDate.getTime() - memberStartDate.getTime()) / (1000 * 60 * 60 * 24),
                            )
                            if (totalDays > 0) {
                              const dailyHours = (memberInProject.totalHours || 0) / totalDays
                              hoursText = `${Math.round(dailyHours * 10) / 10}h`
                            }
                          }
                        }
                      }

                      return (
                        <div key={project.id} className={`calendar-event ${getProjectColor(index)} text-white`}>
                          <div className="flex justify-between">
                            <span className="truncate">{project.title}</span>
                            {hoursText && <span>{hoursText}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {Array.from({ length: (7 - ((monthDays[monthDays.length - 1].getDay() + 1) % 7)) % 7 }).map((_, index) => (
              <div key={`empty-end-${index}`} className="bg-card"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
