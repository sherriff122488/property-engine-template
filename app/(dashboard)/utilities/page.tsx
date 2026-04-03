import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { UtilitiesTable, type UtilityRow } from "@/components/utilities/UtilitiesTable"
import type { UtilityType } from "@/lib/types/database.types"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Utilities" }

type UtilityWithJoins = {
  id: string
  property_id: string
  utility_type: UtilityType
  supplier_name: string
  account_number: string | null
  login_url: string | null
  billing_name: string | null
  properties: { name: string } | null
  utility_credentials: { username: string | null }[]
}

export default async function UtilitiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("utilities")
    .select(`
      id, property_id, utility_type, supplier_name,
      account_number, login_url, billing_name,
      properties ( name ),
      utility_credentials ( username )
    `)
    .order("utility_type")

  if (error) console.error("UtilitiesPage fetch error:", error)

  const rows: UtilityRow[] = (
    (data ?? []) as unknown as UtilityWithJoins[]
  ).map((u) => ({
    id: u.id,
    property_id: u.property_id,
    property_name: u.properties?.name ?? "Unknown property",
    utility_type: u.utility_type,
    supplier_name: u.supplier_name,
    account_number: u.account_number,
    login_url: u.login_url,
    billing_name: u.billing_name,
    username: u.utility_credentials?.[0]?.username ?? null,
  }))

  return (
    <div>
      <PageHeader
        title="Utilities"
        description={`${rows.length} utility account${rows.length !== 1 ? "s" : ""} across your portfolio.`}
        action={
          <Link
            href="/utilities/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add utility
          </Link>
        }
      />
      <UtilitiesTable data={rows} />
    </div>
  )
}
