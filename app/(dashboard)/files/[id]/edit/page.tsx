import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { FileRecordForm } from "@/components/files/FileRecordForm"
import type { FileRecord, Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit File" }

export default async function EditFilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: fileData, error }, { data: propertiesData }] = await Promise.all([
    supabase.from("file_records").select("*").eq("id", id).single(),
    supabase.from("properties").select("id, name").order("name"),
  ])

  const fileRecord = fileData as FileRecord | null
  if (!fileRecord || error) return notFound()

  const properties = (propertiesData ?? []) as unknown as Pick<Property, "id" | "name">[]

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/files"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to files
        </Link>
      </div>
      <PageHeader
        title="Edit file"
        description={fileRecord.file_name}
      />
      <FileRecordForm fileRecord={fileRecord} properties={properties} />
    </div>
  )
}
