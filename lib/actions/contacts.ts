"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

function sanitise(data: ContactFormValues) {
  return {
    ...data,
    company_name: data.company_name || null,
    phone: data.phone || null,
    email: data.email || null,
    whatsapp: data.whatsapp || null,
    notes: data.notes || null,
  }
}

export async function createContact(
  data: ContactFormValues,
  propertyId?: string
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("contacts")
    .insert(sanitise(parsed.data))
    .select("id")
    .single()

  if (error || !row) {
    console.error("createContact:", error)
    return { success: false, error: "Failed to create contact. Please try again." }
  }

  // Auto-link to a property if provided
  if (propertyId) {
    const { error: linkError } = await supabase
      .from("property_contacts")
      .insert({ property_id: propertyId, contact_id: row.id })

    if (linkError) {
      console.error("linkContact (on create):", linkError)
      // Non-fatal — contact was created, link just failed
    }

    revalidatePath(`/properties/${propertyId}`)
  }

  revalidatePath("/contacts")
  return { success: true, id: row.id }
}

export async function updateContact(
  id: string,
  data: ContactFormValues
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("contacts")
    .update(sanitise(parsed.data))
    .eq("id", id)

  if (error) {
    console.error("updateContact:", error)
    return { success: false, error: "Failed to update contact. Please try again." }
  }

  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}/edit`)
  return { success: true, id }
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) {
    console.error("deleteContact:", error)
    return { success: false, error: "Failed to delete contact. Please try again." }
  }

  revalidatePath("/contacts")
  return { success: true, id }
}

export async function unlinkContactFromProperty(
  contactId: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("property_contacts")
    .delete()
    .eq("contact_id", contactId)
    .eq("property_id", propertyId)

  if (error) {
    console.error("unlinkContact:", error)
    return { success: false, error: "Failed to unlink contact." }
  }

  revalidatePath(`/properties/${propertyId}`)
  revalidatePath("/contacts")
  return { success: true, id: contactId }
}
