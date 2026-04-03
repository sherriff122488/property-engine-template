"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { ExpiryBadge } from "@/components/shared/ExpiryBadge"
import { formatDate, formatCurrency } from "@/lib/utils"

export interface MortgageRow {
  id: string
  property_name: string
  property_id: string
  lender_name: string
  product_name: string | null
  fixed_start_date: string | null
  fixed_end_date: string | null
  monthly_payment: number | null
  loan_balance: number | null
  review_date: string | null
}

const columns: Column<MortgageRow>[] = [
  {
    key: "property_name",
    header: "Property",
    render: (row) => (
      <span className="font-medium text-stone-900 dark:text-stone-100">{row.property_name}</span>
    ),
  },
  {
    key: "lender_name",
    header: "Lender",
    render: (row) => <span className="text-stone-700 dark:text-stone-300">{row.lender_name}</span>,
  },
  {
    key: "product_name",
    header: "Product",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{row.product_name ?? "—"}</span>
    ),
  },
  {
    key: "fixed_start_date",
    header: "Fixed start",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{formatDate(row.fixed_start_date)}</span>
    ),
  },
  {
    key: "fixed_end_date",
    header: "Fixed end",
    render: (row) => <ExpiryBadge expiryDate={row.fixed_end_date} />,
  },
  {
    key: "monthly_payment",
    header: "Monthly",
    render: (row) => (
      <span className="text-stone-700 dark:text-stone-300">{formatCurrency(row.monthly_payment)}</span>
    ),
  },
  {
    key: "loan_balance",
    header: "Balance",
    render: (row) => (
      <span className="text-stone-700 dark:text-stone-300">{formatCurrency(row.loan_balance)}</span>
    ),
  },
  {
    key: "review_date",
    header: "Review date",
    render: (row) => (
      <span className="text-stone-600 dark:text-stone-400">{formatDate(row.review_date)}</span>
    ),
  },
]

export function MortgagesTable({ data }: { data: MortgageRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search mortgages…"
      searchKeys={["property_name", "lender_name", "product_name"]}
      onRowClick={(row) => router.push(`/mortgages/${row.id}/edit`)}
      emptyMessage="No mortgages found."
    />
  )
}
