"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, BarChart, Settings, Briefcase, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-primary-dark",
  },
  {
    label: "Projects",
    icon: Briefcase,
    href: "/projects",
    color: "text-primary-dark",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
    color: "text-primary-dark",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
    color: "text-primary-dark",
  },
  {
    label: "Reports",
    icon: BarChart,
    href: "/reports",
    color: "text-primary-dark",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-primary-dark",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative h-full border-r bg-neutral-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-dark">SQUAADS</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:bg-neutral-gray-light",
              pathname === route.href ? "bg-neutral-gray-light" : "",
            )}
          >
            <route.icon className={cn("h-5 w-5", route.color)} />
            {!isCollapsed && <span className="font-medium">{route.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
