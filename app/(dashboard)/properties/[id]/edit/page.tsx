import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { PropertyForm } from "@/components/properties/PropertyForm"
import type { Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit Property" }

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()

  const property = data as Property | null
  if (!property || error) return notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to property
        </Link>
      </div>

      <PageHeader
        title="Edit property"
        description={property.name}
      />

      <PropertyForm property={property} />
    </div>
  )
}
