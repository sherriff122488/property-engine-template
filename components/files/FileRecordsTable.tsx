"use client"

import { useRouter } from "next/navigation"
import { DataTable, type Column } from "@/components/shared/DataTable"
import { FileCategoryBadge } from "@/components/files/FileCategoryBadge"
import type { FileCategory } from "@/lib/types/database.types"
import { ExternalLink } from "lucide-react"

export interface FileRecordRow {
  id: string
  property_id: string
  property_name: string
  file_name: string
  category: FileCategory
  file_url: string | null
  description: string | null
}

const columns: Column<FileRecordRow>[] = [
  {
    key: "property_name",
    header: "Property",
    render: (row) => (
      <span className="font-medium text-stone-900 dark:text-stone-100">{row.property_name}</span>
    ),
  },
  {
    key: "file_name",
    header: "File name",
    render: (row) => (
      <span className="text-stone-800">{row.file_name}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (row) => <FileCategoryBadge category={row.category} />,
  },
  {
    key: "description",
    header: "Description",
    render: (row) => (
      <span className="text-sm text-stone-500 line-clamp-1">
        {row.description ?? "—"}
      </span>
    ),
  },
  {
    key: "file_url",
    header: "Link",
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

export function FileRecordsTable({ data }: { data: FileRecordRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search files…"
      searchKeys={["property_name", "file_name", "description"]}
      onRowClick={(row) => router.push(`/files/${row.id}/edit`)}
      emptyMessage="No files found."
    />
  )
}
