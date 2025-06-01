"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="mb-4 text-gray-700">An error occurred while rendering this page.</p>
          {error && (
            <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
              <p className="font-mono text-sm">{error.toString()}</p>
            </div>
          )}
          <Button onClick={() => (window.location.href = "/")} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
