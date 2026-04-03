"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { mortgageSchema, type MortgageFormValues } from "@/lib/validations/mortgage"

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

function sanitise(data: MortgageFormValues) {
  return {
    ...data,
    product_name: data.product_name || null,
    fixed_start_date: data.fixed_start_date || null,
    fixed_end_date: data.fixed_end_date || null,
    review_date: data.review_date || null,
    broker_name: data.broker_name || null,
    broker_email: data.broker_email || null,
    broker_phone: data.broker_phone || null,
    notes: data.notes || null,
  }
}

export async function createMortgage(data: MortgageFormValues): Promise<ActionResult> {
  const parsed = mortgageSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("mortgages")
    .insert(sanitise(parsed.data))
    .select("id")
    .single()

  if (error) {
    console.error("createMortgage:", error)
    return { success: false, error: "Failed to create mortgage. Please try again." }
  }

  revalidatePath("/mortgages")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id: row.id }
}

export async function updateMortgage(
  id: string,
  data: MortgageFormValues
): Promise<ActionResult> {
  const parsed = mortgageSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid form data." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("mortgages")
    .update(sanitise(parsed.data))
    .eq("id", id)

  if (error) {
    console.error("updateMortgage:", error)
    return { success: false, error: "Failed to update mortgage. Please try again." }
  }

  revalidatePath("/mortgages")
  revalidatePath(`/properties/${parsed.data.property_id}`)
  return { success: true, id }
}

export async function deleteMortgage(
  id: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("mortgages").delete().eq("id", id)

  if (error) {
    console.error("deleteMortgage:", error)
    return { success: false, error: "Failed to delete mortgage. Please try again." }
  }

  revalidatePath("/mortgages")
  revalidatePath(`/properties/${propertyId}`)
  return { success: true, id }
}
