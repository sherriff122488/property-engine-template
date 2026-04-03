import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { ComplianceTable, type ComplianceRow } from "@/components/compliance/ComplianceTable"
import type { ComplianceDocType } from "@/lib/types/database.types"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Compliance" }

type ComplianceWithJoins = {
  id: string
  property_id: string
  document_type: ComplianceDocType
  issue_date: string | null
  expiry_date: string | null
  file_url: string | null
  properties: { name: string } | null
}

export default async function CompliancePage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("compliance_documents")
    .select(`
      id, property_id, document_type, issue_date, expiry_date, file_url,
      properties ( name )
    `)
    // Sort: null expiry last, then soonest first so you see what needs renewing
    .order("expiry_date", { ascending: true, nullsFirst: false })

  if (error) console.error("CompliancePage fetch error:", error)

  const rows: ComplianceRow[] = (
    (data ?? []) as unknown as ComplianceWithJoins[]
  ).map((c) => ({
    id: c.id,
    property_id: c.property_id,
    property_name: c.properties?.name ?? "Unknown property",
    document_type: c.document_type,
    issue_date: c.issue_date,
    expiry_date: c.expiry_date,
    file_url: c.file_url,
  }))

  return (
    <div>
      <PageHeader
        title="Compliance"
        description={`${rows.length} document${rows.length !== 1 ? "s" : ""} across your portfolio.`}
        action={
          <Link
            href="/compliance/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add document
          </Link>
        }
      />
      <ComplianceTable data={rows} />
    </div>
  )
}
