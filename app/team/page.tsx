"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, User, Briefcase, Clock, DollarSign, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { calculateMemberStats, formatCurrency } from "@/lib/utils"

export default function TeamPage() {
  const { members, projects, deleteMember } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const filteredMembers = members
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "role":
          comparison = a.role.localeCompare(b.role)
          break
        case "compensation":
          const aValue = a.compensationType === "hourly" ? a.hourlyRate || 0 : a.monthlySalary || 0
          const bValue = b.compensationType === "hourly" ? b.hourlyRate || 0 : b.monthlySalary || 0
          comparison = aValue - bValue
          break
        case "hoursPerWeek":
          comparison = a.hoursPerWeek - b.hoursPerWeek
          break
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Team</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Link href="/team/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Member
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("name")}
          className={sortBy === "name" ? "bg-muted" : ""}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("role")}
          className={sortBy === "role" ? "bg-muted" : ""}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("compensation")}
          className={sortBy === "compensation" ? "bg-muted" : ""}
        >
          Compensation
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("hoursPerWeek")}
          className={sortBy === "hoursPerWeek" ? "bg-muted" : ""}
        >
          Hours Per Week
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h3 className="mb-2 text-xl font-medium">No team members found</h3>
          <p className="mb-6 text-center text-muted-foreground">
            {members.length === 0
              ? "Get started by adding your first team member"
              : "Try adjusting your search or filters"}
          </p>
          {members.length === 0 && (
            <Link href="/team/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Member
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const stats = calculateMemberStats(member, projects)
            const memberProjects = projects.filter((project) => project.members.some((m) => m.memberId === member.id))

            return (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className={`h-2 w-full ${
                      stats.stressLevel < 30 ? "bg-green-500" : stats.stressLevel < 70 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <Link href={`/team/${member.id}`}>
                        <h3 className="text-xl font-bold hover:text-primary-dark hover:underline">{member.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/team/${member.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/team/${member.id}/edit`}>Edit Member</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteMember(member.id)}
                          >
                            Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {member.compensationType === "hourly"
                            ? `${formatCurrency(member.hourlyRate || 0)}/hour`
                            : `${formatCurrency(member.monthlySalary || 0)}/month`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{member.hoursPerWeek} hours/week</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{stats.utilizationRate.toFixed(0)}% utilized</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{memberProjects.length} projects</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Workload</span>
                        <span className="text-muted-foreground">
                          {stats.totalHours} / {member.availableHours} hours
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-muted rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            stats.utilizationRate < 50
                              ? "bg-blue-500"
                              : stats.utilizationRate < 80
                                ? "bg-green-500"
                                : stats.utilizationRate < 100
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, stats.utilizationRate)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
