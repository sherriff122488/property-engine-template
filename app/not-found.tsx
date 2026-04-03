import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-800">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Page not found</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
