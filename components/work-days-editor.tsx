"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { formatDayOfWeek, isWeekend } from "@/lib/utils"
import type { WorkDay } from "@/lib/types"

interface WorkDaysEditorProps {
  workDays: WorkDay[]
  onSave: (workDays: WorkDay[]) => void
}

export function WorkDaysEditor({ workDays, onSave }: WorkDaysEditorProps) {
  const [editedWorkDays, setEditedWorkDays] = useState<WorkDay[]>(workDays)
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleDay = (index: number) => {
    setEditedWorkDays((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], enabled: !updated[index].enabled }
      return updated
    })
  }

  const handleHoursChange = (index: number, hours: number) => {
    setEditedWorkDays((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], hours }
      return updated
    })
  }

  const handleSave = () => {
    onSave(editedWorkDays)
    setIsOpen(false)
  }

  const handleToggleWeekdays = () => {
    setEditedWorkDays((prev) =>
      prev.map((day) => ({
        ...day,
        enabled: !isWeekend(day.date),
      })),
    )
  }

  const handleToggleWeekends = () => {
    setEditedWorkDays((prev) =>
      prev.map((day) => ({
        ...day,
        enabled: isWeekend(day.date),
      })),
    )
  }

  const handleToggleAll = () => {
    setEditedWorkDays((prev) =>
      prev.map((day) => ({
        ...day,
        enabled: true,
      })),
    )
  }

  const handleClearAll = () => {
    setEditedWorkDays((prev) =>
      prev.map((day) => ({
        ...day,
        enabled: false,
      })),
    )
  }

  const totalHours = editedWorkDays.filter((day) => day.enabled).reduce((sum, day) => sum + day.hours, 0)
  const totalDays = editedWorkDays.filter((day) => day.enabled).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="ml-2">
          <Calendar className="mr-2 h-4 w-4" />
          Edit Work Days
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Work Days</DialogTitle>
          <DialogDescription>
            Select which days this team member will work on the project and how many hours per day.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-medium">Total: </span>
              <span>
                {totalDays} days, {totalHours} hours
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleToggleWeekdays}>
                Weekdays Only
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleWeekends}>
                Weekends Only
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {editedWorkDays.map((day, index) => {
              const date = new Date(day.date)
              const isWeekendDay = isWeekend(day.date)

              return (
                <div
                  key={day.date}
                  className={`flex items-center justify-between p-3 border rounded-md ${
                    isWeekendDay ? "bg-muted/30" : ""
                  } ${day.enabled ? "border-primary" : "border-muted"}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{date.toLocaleDateString()}</span>
                    <span className={`text-xs ${isWeekendDay ? "text-muted-foreground" : ""}`}>
                      {formatDayOfWeek(day.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={day.hours}
                      onChange={(e) => handleHoursChange(index, Number.parseFloat(e.target.value) || 0)}
                      className="w-16 h-8"
                      disabled={!day.enabled}
                    />
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={() => handleToggleDay(index)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
