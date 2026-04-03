"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { complianceSchema, type ComplianceFormValues } from "@/lib/validations/compliance"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

function sanitise(data: ComplianceFormValues) {
  return {
    ...data,
    issue_date: data.issue_date || null,
    expiry_date: data.expiry_date || null,
    file_url: data.file_url || null,
    notes: data.notes || null,
  }
}

export async function createComplianceDoc(
  data: ComplianceFormValues
): Promise<ActionResult> {
  const parsed = complianceSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("compliance_documents")
    .insert(sanitise(parsed.data))
    .select("id")
    .single()

  if (error || !row) {
    console.error("createComplianceDoc:", error)
    return { success: false, error: "Failed to save document. Please try again." }
  }

  revalidatePath("/compliance")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id: row.id }
}

export async function updateComplianceDoc(
  id: string,
  data: ComplianceFormValues
): Promise<ActionResult> {
  const parsed = complianceSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("compliance_documents")
    .update(sanitise(parsed.data))
    .eq("id", id)

  if (error) {
    console.error("updateComplianceDoc:", error)
    return { success: false, error: "Failed to update document. Please try again." }
  }

  revalidatePath("/compliance")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id }
}

export async function deleteComplianceDoc(
  id: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("compliance_documents")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("deleteComplianceDoc:", error)
    return { success: false, error: "Failed to delete document. Please try again." }
  }

  revalidatePath("/compliance")
  revalidatePath(`/properties/${propertyId}`)
  return { success: true, id }
}
