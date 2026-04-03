"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ExpiryBadge } from "@/components/shared/ExpiryBadge"
import type { PropertyStatus } from "@/lib/types/database.types"

export interface PropertyRow {
  id: string
  name: string
  address: string
  bedrooms: number | null
  status: PropertyStatus
  entity: string
  mortgage_lender: string | null
  next_expiry: string | null
}

const columns: Column<PropertyRow>[] = [
  {
    key: "name",
    header: "Property",
    render: (row) => (
      <span className="font-medium text-stone-900 dark:text-stone-100">{row.name}</span>
    ),
  },
  {
    key: "address",
    header: "Address",
    render: (row) => <span className="text-stone-600 dark:text-stone-400">{row.address}</span>,
  },
  {
    key: "bedrooms",
    header: "Beds",
    width: "w-16",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{row.bedrooms ?? "—"}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "entity",
    header: "Entity",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{row.entity || "—"}</span>
    ),
  },
  {
    key: "mortgage_lender",
    header: "Mortgage lender",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{row.mortgage_lender ?? "—"}</span>
    ),
  },
  {
    key: "next_expiry",
    header: "Next compliance",
    render: (row) => <ExpiryBadge expiryDate={row.next_expiry} />,
  },
]

export function PropertiesTable({ data }: { data: PropertyRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search properties…"
      searchKeys={["name", "address", "entity"]}
      onRowClick={(row) => router.push(`/properties/${row.id}`)}
      emptyMessage="No properties found."
    />
  )
}
