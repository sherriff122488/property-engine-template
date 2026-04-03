import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { ComplianceForm } from "@/components/compliance/ComplianceForm"
import { ComplianceDocTypeBadge, docTypeLabels } from "@/components/compliance/ComplianceDocTypeBadge"
import type { ComplianceDocument, Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit Compliance Document" }

export default async function EditCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: docData, error }, { data: propertiesData }] = await Promise.all([
    supabase.from("compliance_documents").select("*").eq("id", id).single(),
    supabase.from("properties").select("id, name").order("name"),
  ])

  const doc = docData as ComplianceDocument | null
  if (!doc || error) return notFound()

  const properties = (propertiesData ?? []) as unknown as Pick<Property, "id" | "name">[]

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/compliance"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to compliance
        </Link>
      </div>
      <PageHeader
        title="Edit compliance document"
        description={docTypeLabels[doc.document_type]}
      />
      <ComplianceForm doc={doc} properties={properties} />
    </div>
  )
}
