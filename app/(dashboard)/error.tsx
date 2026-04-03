"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Something went wrong</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-sm">
        An error occurred loading this page. Try refreshing, or go back to the dashboard.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
