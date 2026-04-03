import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { FileRecordsTable, type FileRecordRow } from "@/components/files/FileRecordsTable"
import type { FileCategory } from "@/lib/types/database.types"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Files" }

type FileWithJoins = {
  id: string
  property_id: string
  file_name: string
  category: FileCategory
  file_url: string | null
  description: string | null
  properties: { name: string } | null
}

export default async function FilesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("file_records")
    .select(`
      id, property_id, file_name, category, file_url, description,
      properties ( name )
    `)
    .order("file_name")

  if (error) console.error("FilesPage fetch error:", error)

  const rows: FileRecordRow[] = (
    (data ?? []) as unknown as FileWithJoins[]
  ).map((f) => ({
    id: f.id,
    property_id: f.property_id,
    property_name: f.properties?.name ?? "Unknown property",
    file_name: f.file_name,
    category: f.category,
    file_url: f.file_url,
    description: f.description,
  }))

  return (
    <div>
      <PageHeader
        title="Files"
        description={`${rows.length} file${rows.length !== 1 ? "s" : ""} across your portfolio.`}
        action={
          <Link
            href="/files/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add file
          </Link>
        }
      />
      <FileRecordsTable data={rows} />
    </div>
  )
}
