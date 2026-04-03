import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { MortgageForm } from "@/components/mortgages/MortgageForm"
import type { Mortgage, Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit Mortgage" }

export default async function EditMortgagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: mortgageData, error }, { data: propertiesData }] = await Promise.all([
    supabase.from("mortgages").select("*").eq("id", id).single(),
    supabase.from("properties").select("id, name").order("name"),
  ])

  const mortgage = mortgageData as Mortgage | null
  const properties = (propertiesData ?? []) as unknown as Pick<Property, "id" | "name">[]

  if (!mortgage || error) return notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/mortgages"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to mortgages
        </Link>
      </div>
      <PageHeader
        title="Edit mortgage"
        description={`${mortgage.lender_name}${mortgage.product_name ? ` — ${mortgage.product_name}` : ""}`}
      />
      <MortgageForm mortgage={mortgage} properties={properties} />
    </div>
  )
}
