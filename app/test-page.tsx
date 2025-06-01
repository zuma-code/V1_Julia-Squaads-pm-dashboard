"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TestPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Routing Test Page</h1>
      <p className="mb-4">This page tests if routing is working correctly.</p>

      <div className="flex gap-4">
        <Button onClick={() => router.push("/team/new")}>Go to New Member</Button>

        <Button onClick={() => router.push("/projects/new")}>Go to New Project</Button>

        <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
      </div>
    </div>
  )
}
