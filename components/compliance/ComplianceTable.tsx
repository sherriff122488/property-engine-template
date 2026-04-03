"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { ComplianceDocTypeBadge } from "@/components/compliance/ComplianceDocTypeBadge"
import { ExpiryBadge } from "@/components/shared/ExpiryBadge"
import type { ComplianceDocType } from "@/lib/types/database.types"
import { formatDate } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

export interface ComplianceRow {
  id: string
  property_id: string
  property_name: string
  document_type: ComplianceDocType
  issue_date: string | null
  expiry_date: string | null
  file_url: string | null
}

const columns: Column<ComplianceRow>[] = [
  {
    key: "property_name",
    header: "Property",
    render: (row) => (
      <span className="font-medium text-stone-900 dark:text-stone-100">{row.property_name}</span>
    ),
  },
  {
    key: "document_type",
    header: "Document",
    render: (row) => <ComplianceDocTypeBadge type={row.document_type} />,
  },
  {
    key: "issue_date",
    header: "Issue date",
    render: (row) => (
      <span className="text-sm text-stone-600">
        {row.issue_date ? formatDate(row.issue_date) : "—"}
      </span>
    ),
  },
  {
    key: "expiry_date",
    header: "Expiry",
    render: (row) => <ExpiryBadge expiryDate={row.expiry_date} />,
  },
  {
    key: "file_url",
    header: "File",
    render: (row) =>
      row.file_url ? (
        <a
          href={row.file_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="text-xs">Open</span>
        </a>
      ) : (
        <span className="text-stone-400">—</span>
      ),
  },
]

export function ComplianceTable({ data }: { data: ComplianceRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search compliance documents…"
      searchKeys={["property_name", "document_type"]}
      onRowClick={(row) => router.push(`/compliance/${row.id}/edit`)}
      emptyMessage="No compliance documents found."
    />
  )
}
