"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { calculateMemberStats, calculateProjectStats, formatCurrency } from "@/lib/utils"
import type { MemberStats, ProjectStats } from "@/lib/types"

export default function ReportsPage() {
  const { projects, members } = useStore()
  const [memberStats, setMemberStats] = useState<MemberStats[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [reportType, setReportType] = useState<string>("utilization")

  useEffect(() => {
    if (members.length > 0 && projects.length > 0) {
      const memberStatsData = members.map((member) => calculateMemberStats(member, projects))

      const projectStatsData = projects.map((project) => calculateProjectStats(project, members))

      setMemberStats(memberStatsData)
      setProjectStats(projectStatsData)
    }
  }, [members, projects])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  const renderUtilizationChart = () => {
    const data = memberStats.map((stats) => ({
      name: stats.memberName,
      utilization: Number.parseFloat(stats.utilizationRate.toFixed(2)),
      stress: Number.parseFloat(stats.stressLevel.toFixed(2)),
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar dataKey="utilization" name="Utilization Rate (%)" fill="#70C1B3" />
          <Bar dataKey="stress" name="Stress Level (%)" fill="#FF9F00" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderProfitabilityChart = () => {
    const data = projectStats.map((stats) => ({
      name: stats.projectTitle,
      profitability: Number.parseFloat(stats.profitability.toFixed(2)),
      budget: stats.budget,
      cost: stats.cost,
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (name === "profitability") return `${value}%`
              return formatCurrency(value as number)
            }}
          />
          <Legend />
          <Bar dataKey="budget" name="Budget" fill="#1E3A5F" />
          <Bar dataKey="cost" name="Cost" fill="#FF9F00" />
          <Bar dataKey="profitability" name="Profitability (%)" fill="#70C1B3" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderRoleDistributionChart = () => {
    const roleCount: Record<string, number> = {}

    members.forEach((member) => {
      if (roleCount[member.role]) {
        roleCount[member.role]++
      } else {
        roleCount[member.role] = 1
      }
    })

    const data = Object.entries(roleCount).map(([role, count]) => ({
      name: role,
      value: count,
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} members`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderHoursChart = () => {
    const data = projectStats.map((stats) => ({
      name: stats.projectTitle,
      estimated: stats.estimatedHours,
      actual: stats.actualHours,
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value) => `${value} hours`} />
          <Legend />
          <Bar dataKey="estimated" name="Estimated Hours" fill="#1E3A5F" />
          <Bar dataKey="actual" name="Actual Hours" fill="#FF9F00" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderFinancialSummary = () => {
    const totalBudget = projectStats.reduce((sum, project) => sum + project.budget, 0)
    const totalCost = projectStats.reduce((sum, project) => sum + project.cost, 0)
    const totalProfit = totalBudget - totalCost
    const overallProfitability = totalBudget > 0 ? ((totalProfit / totalBudget) * 100).toFixed(2) : "0.00"

    return (
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-secondary-green" : "text-destructive"}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Profitability: {overallProfitability}%</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">Reports</h1>
        <p className="text-muted-foreground">Financial and team performance reports</p>
      </div>

      <div className="mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utilization">Team Utilization & Stress</SelectItem>
            <SelectItem value="profitability">Project Profitability</SelectItem>
            <SelectItem value="roles">Team Role Distribution</SelectItem>
            <SelectItem value="hours">Estimated vs. Actual Hours</SelectItem>
            <SelectItem value="financial">Financial Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {reportType === "utilization" && "Team Utilization & Stress Levels"}
            {reportType === "profitability" && "Project Profitability"}
            {reportType === "roles" && "Team Role Distribution"}
            {reportType === "hours" && "Estimated vs. Actual Hours"}
            {reportType === "financial" && "Financial Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === "utilization" && renderUtilizationChart()}
          {reportType === "profitability" && renderProfitabilityChart()}
          {reportType === "roles" && renderRoleDistributionChart()}
          {reportType === "hours" && renderHoursChart()}
          {reportType === "financial" && renderFinancialSummary()}
        </CardContent>
      </Card>

      {reportType === "utilization" && (
        <Card>
          <CardHeader>
            <CardTitle>Team Member Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Assigned Hours</th>
                    <th className="text-left p-2">Available Hours</th>
                    <th className="text-left p-2">Utilization</th>
                    <th className="text-left p-2">Stress Level</th>
                  </tr>
                </thead>
                <tbody>
                  {memberStats.map((stats, index) => {
                    const member = members.find((m) => m.id === stats.memberId)
                    return (
                      <tr key={stats.memberId} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                        <td className="p-2 font-medium">{stats.memberName}</td>
                        <td className="p-2">{member?.role}</td>
                        <td className="p-2">{stats.totalHours} hours</td>
                        <td className="p-2">{stats.availableHours} hours</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{stats.utilizationRate.toFixed(0)}%</span>
                            <div className="h-2 w-24 bg-muted rounded-full">
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
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{stats.stressLevel.toFixed(0)}%</span>
                            <div className="h-2 w-24 bg-muted rounded-full">
                              <div
                                className={`h-2 rounded-full ${
                                  stats.stressLevel < 30
                                    ? "bg-green-500"
                                    : stats.stressLevel < 70
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min(100, stats.stressLevel)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "profitability" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Project</th>
                    <th className="text-left p-2">Budget</th>
                    <th className="text-left p-2">Cost</th>
                    <th className="text-left p-2">Profit</th>
                    <th className="text-left p-2">Profitability</th>
                  </tr>
                </thead>
                <tbody>
                  {projectStats.map((stats, index) => (
                    <tr key={stats.projectId} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                      <td className="p-2 font-medium">{stats.projectTitle}</td>
                      <td className="p-2">{formatCurrency(stats.budget)}</td>
                      <td className="p-2">{formatCurrency(stats.cost)}</td>
                      <td className="p-2">
                        <span className={stats.budget - stats.cost >= 0 ? "text-secondary-green" : "text-destructive"}>
                          {formatCurrency(stats.budget - stats.cost)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span>{stats.profitability.toFixed(2)}%</span>
                          <div className="h-2 w-24 bg-muted rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                stats.profitability < 0
                                  ? "bg-red-500"
                                  : stats.profitability < 15
                                    ? "bg-yellow-500"
                                    : stats.profitability < 30
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, stats.profitability))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
