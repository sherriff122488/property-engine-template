"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { propertySchema, type PropertyFormValues } from "@/lib/validations/property"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createProperty(data: PropertyFormValues): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid form data." }
  }

  const supabase = await createClient()

  const payload = {
    ...parsed.data,
    address_line_2: parsed.data.address_line_2 || null,
    entity_name: parsed.data.entity_name || null,
    tenure: parsed.data.tenure || null,
    notes: parsed.data.notes || null,
    google_drive_photos_url: parsed.data.google_drive_photos_url || null,
    current_value: parsed.data.current_value ?? null,
    estimated_monthly_income: parsed.data.estimated_monthly_income ?? null,
  }

  const { data: property, error } = await supabase
    .from("properties")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    console.error("createProperty error:", error)
    return { success: false, error: "Failed to create property. Please try again." }
  }

  revalidatePath("/properties")
  return { success: true, id: property.id }
}

export async function updateProperty(
  id: string,
  data: PropertyFormValues
): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid form data." }
  }

  const supabase = await createClient()

  const payload = {
    ...parsed.data,
    address_line_2: parsed.data.address_line_2 || null,
    entity_name: parsed.data.entity_name || null,
    tenure: parsed.data.tenure || null,
    notes: parsed.data.notes || null,
    google_drive_photos_url: parsed.data.google_drive_photos_url || null,
    current_value: parsed.data.current_value ?? null,
    estimated_monthly_income: parsed.data.estimated_monthly_income ?? null,
  }

  const { error } = await supabase.from("properties").update(payload).eq("id", id)

  if (error) {
    console.error("updateProperty error:", error)
    return { success: false, error: "Failed to update property. Please try again." }
  }

  revalidatePath("/properties")
  revalidatePath(`/properties/${id}`)
  return { success: true, id }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from("properties").delete().eq("id", id)

  if (error) {
    console.error("deleteProperty error:", error)
    return { success: false, error: "Failed to delete property. Please try again." }
  }

  revalidatePath("/properties")
  return { success: true, id }
}
