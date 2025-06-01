"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import { generateId } from "@/lib/utils"

const roles = ["Developer", "Designer", "Project Manager", "QA Engineer", "DevOps Engineer", "Product Owner", "Other"]

export default function NewMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addMember } = useStore()

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    compensationType: "hourly",
    hourlyRate: 0,
    monthlySalary: 0,
    hoursPerWeek: 40,
    availableHours: 160,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "hourlyRate" || name === "monthlySalary" || name === "hoursPerWeek" || name === "availableHours"
          ? Number.parseFloat(value) || 0
          : value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  const handleCompensationTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      compensationType: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation checks
    let hasError = false

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Member name is required",
        variant: "destructive",
      })
      hasError = true
    }

    if (!formData.role) {
      toast({
        title: "Error",
        description: "Member role is required",
        variant: "destructive",
      })
      hasError = true
    }

    if (formData.compensationType === "hourly" && formData.hourlyRate <= 0) {
      toast({
        title: "Error",
        description: "Hourly rate must be greater than zero",
        variant: "destructive",
      })
      hasError = true
    }

    if (formData.compensationType === "monthly" && formData.monthlySalary <= 0) {
      toast({
        title: "Error",
        description: "Monthly salary must be greater than zero",
        variant: "destructive",
      })
      hasError = true
    }

    // If there are validation errors, don't proceed
    if (hasError) return

    const newMember = {
      id: generateId(),
      name: formData.name,
      role: formData.role,
      compensationType: formData.compensationType as "hourly" | "monthly",
      ...(formData.compensationType === "hourly" ? { hourlyRate: formData.hourlyRate } : {}),
      ...(formData.compensationType === "monthly" ? { monthlySalary: formData.monthlySalary } : {}),
      hoursPerWeek: formData.hoursPerWeek,
      availableHours: formData.availableHours,
    }

    try {
      addMember(newMember)

      toast({
        title: "Success",
        description: "Team member added successfully",
      })

      // Only navigate after successful addition
      router.push("/team")
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">New Team Member</h1>
        <p className="text-muted-foreground">Add a new team member</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter member name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compensation Type</Label>
              <RadioGroup
                value={formData.compensationType}
                onValueChange={handleCompensationTypeChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="cursor-pointer">
                    Hourly Rate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">
                    Monthly Salary
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.compensationType === "hourly" ? (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Monthly Salary (€)</Label>
                <Input
                  id="monthlySalary"
                  name="monthlySalary"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.monthlySalary}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
              <Input
                id="hoursPerWeek"
                name="hoursPerWeek"
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={formData.hoursPerWeek}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableHours">Available Hours Per Month</Label>
              <Input
                id="availableHours"
                name="availableHours"
                type="number"
                min="0"
                step="1"
                value={formData.availableHours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Add Member</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
