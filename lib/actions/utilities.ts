"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { utilitySchema, type UtilityFormValues } from "@/lib/validations/utility"
import { encryptCredential } from "@/lib/utils/crypto"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createUtility(data: UtilityFormValues): Promise<ActionResult> {
  const parsed = utilitySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { username, password, ...utilityData } = parsed.data

  // Insert the utility record
  const { data: row, error } = await supabase
    .from("utilities")
    .insert({
      ...utilityData,
      account_number: utilityData.account_number || null,
      login_url: utilityData.login_url || null,
      billing_name: utilityData.billing_name || null,
      notes: utilityData.notes || null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("createUtility:", error)
    return { success: false, error: "Failed to create utility. Please try again." }
  }

  // Insert credentials if provided
  if (username || password) {
    const credPayload: { utility_id: string; username?: string; password_encrypted?: string } = {
      utility_id: row.id,
    }
    if (username) credPayload.username = username
    if (password) credPayload.password_encrypted = encryptCredential(password)

    await supabase.from("utility_credentials").insert(credPayload)
  }

  revalidatePath("/utilities")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id: row.id }
}

export async function updateUtility(
  id: string,
  data: UtilityFormValues
): Promise<ActionResult> {
  const parsed = utilitySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { username, password, ...utilityData } = parsed.data

  // Update the utility record
  const { error } = await supabase
    .from("utilities")
    .update({
      ...utilityData,
      account_number: utilityData.account_number || null,
      login_url: utilityData.login_url || null,
      billing_name: utilityData.billing_name || null,
      notes: utilityData.notes || null,
    })
    .eq("id", id)

  if (error) {
    console.error("updateUtility:", error)
    return { success: false, error: "Failed to update utility. Please try again." }
  }

  // Upsert credentials
  if (username !== undefined || password !== undefined) {
    const credPayload: Record<string, string> = { utility_id: id }
    if (username !== null && username !== undefined) credPayload.username = username
    if (password) credPayload.password_encrypted = encryptCredential(password)

    await supabase
      .from("utility_credentials")
      .upsert(credPayload, { onConflict: "utility_id" })
  }

  revalidatePath("/utilities")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id }
}

export async function deleteUtility(id: string, propertyId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("utilities").delete().eq("id", id)

  if (error) {
    console.error("deleteUtility:", error)
    return { success: false, error: "Failed to delete utility. Please try again." }
  }

  revalidatePath("/utilities")
  revalidatePath(`/properties/${propertyId}`)
  return { success: true, id }
}
