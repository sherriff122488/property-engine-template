"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { fileRecordSchema, type FileRecordFormValues } from "@/lib/validations/file-record"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

function sanitise(data: FileRecordFormValues) {
  return {
    ...data,
    file_url: data.file_url || null,
    description: data.description || null,
  }
}

export async function createFileRecord(
  data: FileRecordFormValues
): Promise<ActionResult> {
  const parsed = fileRecordSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("file_records")
    .insert(sanitise(parsed.data))
    .select("id")
    .single()

  if (error || !row) {
    console.error("createFileRecord:", error)
    return { success: false, error: "Failed to save file record. Please try again." }
  }

  revalidatePath("/files")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id: row.id }
}

export async function updateFileRecord(
  id: string,
  data: FileRecordFormValues
): Promise<ActionResult> {
  const parsed = fileRecordSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("file_records")
    .update(sanitise(parsed.data))
    .eq("id", id)

  if (error) {
    console.error("updateFileRecord:", error)
    return { success: false, error: "Failed to update file record. Please try again." }
  }

  revalidatePath("/files")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id }
}

export async function deleteFileRecord(
  id: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("file_records")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("deleteFileRecord:", error)
    return { success: false, error: "Failed to delete file record. Please try again." }
  }

  revalidatePath("/files")
  revalidatePath(`/properties/${propertyId}`)
  return { success: true, id }
}
