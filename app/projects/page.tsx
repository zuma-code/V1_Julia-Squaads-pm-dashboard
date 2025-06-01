"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Calendar, Clock, DollarSign, Users, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, members, deleteProject } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleNewProject = () => {
    router.push("/projects/new")
  }

  const filteredProjects = projects
    .filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "startDate":
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          break
        case "endDate":
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
          break
        case "budget":
          comparison = a.budget - b.budget
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
          <h1 className="text-3xl font-bold text-primary-dark">Projects</h1>
          <p className="text-muted-foreground">Manage your projects</p>
        </div>
        <Button onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
          onClick={() => handleSort("title")}
          className={sortBy === "title" ? "bg-muted" : ""}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("startDate")}
          className={sortBy === "startDate" ? "bg-muted" : ""}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("endDate")}
          className={sortBy === "endDate" ? "bg-muted" : ""}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort("budget")}
          className={sortBy === "budget" ? "bg-muted" : ""}
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h3 className="mb-2 text-xl font-medium">No projects found</h3>
          <p className="mb-6 text-center text-muted-foreground">
            {projects.length === 0
              ? "Get started by creating your first project"
              : "Try adjusting your search or filters"}
          </p>
          {projects.length === 0 && (
            <Button onClick={handleNewProject}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectMembers = project.members
              .map((pm) => members.find((m) => m.id === pm.memberId))
              .filter(Boolean)

            const isActive = new Date(project.endDate) >= new Date()
            const daysLeft = Math.ceil(
              (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <Card key={project.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-2 w-full ${isActive ? "bg-secondary-green" : "bg-neutral-gray-dark"}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <Link href={`/projects/${project.id}`}>
                        <h3 className="text-xl font-bold hover:text-primary-dark hover:underline">{project.title}</h3>
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
                            <Link href={`/projects/${project.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{project.estimatedHours} hours</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{projectMembers.length} members</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{daysLeft} days left</span>
                          <span className="text-muted-foreground">
                            {project.originalEndDate &&
                              project.originalEndDate !== project.endDate &&
                              `Extended from ${formatDate(project.originalEndDate)}`}
                          </span>
                        </div>
                      </div>
                    )}
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
