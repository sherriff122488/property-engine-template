"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { ContactCategoryBadge } from "@/components/contacts/ContactCategoryBadge"
import type { ContactCategory } from "@/lib/types/database.types"
import { Mail, Phone } from "lucide-react"

export interface ContactRow {
  id: string
  full_name: string
  company_name: string | null
  category: ContactCategory
  phone: string | null
  email: string | null
  property_count: number
}

const columns: Column<ContactRow>[] = [
  {
    key: "full_name",
    header: "Name",
    render: (row) => (
      <div>
        <span className="font-medium text-stone-900 dark:text-stone-100">{row.full_name}</span>
        {row.company_name && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{row.company_name}</p>
        )}
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (row) => <ContactCategoryBadge category={row.category} />,
  },
  {
    key: "phone",
    header: "Phone",
    render: (row) =>
      row.phone ? (
        <a
          href={`tel:${row.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <Phone className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          {row.phone}
        </a>
      ) : (
        <span className="text-stone-400 dark:text-stone-500">—</span>
      ),
  },
  {
    key: "email",
    header: "Email",
    render: (row) =>
      row.email ? (
        <a
          href={`mailto:${row.email}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <Mail className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          {row.email}
        </a>
      ) : (
        <span className="text-stone-400 dark:text-stone-500">—</span>
      ),
  },
  {
    key: "property_count",
    header: "Properties",
    render: (row) => (
      <span className="text-sm text-stone-500 dark:text-stone-400">
        {row.property_count === 0
          ? "—"
          : `${row.property_count} propert${row.property_count === 1 ? "y" : "ies"}`}
      </span>
    ),
  },
]

export function ContactsTable({ data }: { data: ContactRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search contacts…"
      searchKeys={["full_name", "company_name", "email", "phone"]}
      onRowClick={(row) => router.push(`/contacts/${row.id}/edit`)}
      emptyMessage="No contacts found."
    />
  )
}
