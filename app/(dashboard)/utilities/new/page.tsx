import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { UtilityForm } from "@/components/utilities/UtilityForm"
import type { Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Add Utility" }

export default async function NewUtilityPage({
  searchParams,
}: {
  searchParams: Promise<{ property_id?: string }>
}) {
  const { property_id } = await searchParams
  const supabase = await createClient()

  const { data } = await supabase
    .from("properties")
    .select("id, name")
    .order("name")

  const properties = (data ?? []) as unknown as Pick<Property, "id" | "name">[]

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/utilities"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to utilities
        </Link>
      </div>
      <PageHeader title="Add utility" description="Record a utility account for a property." />
      <UtilityForm properties={properties} defaultPropertyId={property_id} />
    </div>
  )
}
