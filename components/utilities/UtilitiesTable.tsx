"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { UtilityTypeBadge } from "@/components/utilities/UtilityTypeBadge"
import type { UtilityType } from "@/lib/types/database.types"
import { ExternalLink } from "lucide-react"

export interface UtilityRow {
  id: string
  property_name: string
  property_id: string
  utility_type: UtilityType
  supplier_name: string
  account_number: string | null
  login_url: string | null
  billing_name: string | null
  username: string | null
}

const columns: Column<UtilityRow>[] = [
  {
    key: "property_name",
    header: "Property",
    render: (row) => (
      <span className="font-medium text-stone-900 dark:text-stone-100">{row.property_name}</span>
    ),
  },
  {
    key: "utility_type",
    header: "Type",
    render: (row) => <UtilityTypeBadge type={row.utility_type} />,
  },
  {
    key: "supplier_name",
    header: "Supplier",
    render: (row) => <span className="text-stone-700">{row.supplier_name}</span>,
  },
  {
    key: "account_number",
    header: "Account no.",
    render: (row) => (
      <span className="text-stone-600 font-mono text-xs">
        {row.account_number ?? "—"}
      </span>
    ),
  },
  {
    key: "username",
    header: "Username",
    render: (row) => (
      <span className="text-stone-600">{row.username ?? "—"}</span>
    ),
  },
  {
    key: "login_url",
    header: "Login",
    render: (row) =>
      row.login_url ? (
        <a
          href={row.login_url}
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

export function UtilitiesTable({ data }: { data: UtilityRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search utilities…"
      searchKeys={["property_name", "supplier_name", "account_number"]}
      onRowClick={(row) => router.push(`/utilities/${row.id}/edit`)}
      emptyMessage="No utilities found."
    />
  )
}
