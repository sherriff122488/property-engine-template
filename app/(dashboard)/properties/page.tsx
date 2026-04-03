import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { PropertiesTable, type PropertyRow } from "@/components/properties/PropertiesTable"
import type { PropertyStatus } from "@/lib/types/database.types"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Properties" }

// Raw shape returned by the join query
type PropertyWithJoins = {
  id: string
  name: string
  address_line_1: string
  city: string
  bedrooms: number | null
  status: PropertyStatus
  entity_name: string | null
  mortgages: { lender_name: string }[]
  compliance_documents: { expiry_date: string | null }[]
}

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("properties")
    .select(`
      id, name, address_line_1, city, bedrooms, status, entity_name,
      mortgages ( lender_name ),
      compliance_documents ( expiry_date )
    `)
    .order("name")

  if (error) {
    console.error("PropertiesPage fetch error:", error)
  }

  const rows: PropertyRow[] = ((data ?? []) as unknown as PropertyWithJoins[]).map((p) => {
    const lender = p.mortgages?.[0]?.lender_name ?? null

    const upcomingExpiries = (p.compliance_documents ?? [])
      .map((d) => d.expiry_date)
      .filter((d): d is string => !!d)
      .sort()
    const nextExpiry = upcomingExpiries[0] ?? null

    return {
      id: p.id,
      name: p.name,
      address: [p.address_line_1, p.city].filter(Boolean).join(", "),
      bedrooms: p.bedrooms,
      status: p.status,
      entity: p.entity_name ?? "",
      mortgage_lender: lender,
      next_expiry: nextExpiry,
    }
  })

  return (
    <div>
      <PageHeader
        title="Properties"
        description={`${rows.length} propert${rows.length !== 1 ? "ies" : "y"} in your portfolio.`}
        action={
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add property
          </Link>
        }
      />

      <PropertiesTable data={rows} />
    </div>
  )
}
