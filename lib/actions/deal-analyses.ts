"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DealInputs } from "@/lib/utils/deal-calculator"

export interface SavedDeal {
  id: string
  name: string
  deal_type: string
  inputs: DealInputs
  created_at: string
  updated_at: string
}

export async function listDeals(): Promise<SavedDeal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("deal_analyses")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("listDeals error:", error)
    return []
  }
  return data as SavedDeal[]
}

export async function saveDeal(
  inputs: DealInputs,
  existingId?: string
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const supabase = await createClient()
  const name = inputs.propertyName.trim() || "Untitled deal"

  if (existingId) {
    const { data, error } = await supabase
      .from("deal_analyses")
      .update({ name, deal_type: inputs.dealType, inputs, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .select("id")
      .single()

    if (error) {
      console.error("saveDeal update error:", error)
      return { success: false, error: "Failed to update deal." }
    }
    revalidatePath("/deal-analyser")
    return { success: true, id: data.id }
  }

  const { data, error } = await supabase
    .from("deal_analyses")
    .insert({ name, deal_type: inputs.dealType, inputs })
    .select("id")
    .single()

  if (error) {
    console.error("saveDeal insert error:", error)
    return { success: false, error: "Failed to save deal." }
  }
  revalidatePath("/deal-analyser")
  return { success: true, id: data.id }
}

export async function deleteDeal(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("deal_analyses")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("deleteDeal error:", error)
    return { success: false, error: "Failed to delete deal." }
  }
  revalidatePath("/deal-analyser")
  return { success: true }
}
