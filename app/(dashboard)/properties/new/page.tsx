import { PageHeader } from "@/components/shared/PageHeader"
import { PropertyForm } from "@/components/properties/PropertyForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Add Property" }

export default function NewPropertyPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to properties
        </Link>
      </div>

      <PageHeader
        title="Add property"
        description="Create a new property record."
      />

      <PropertyForm />
    </div>
  )
}
