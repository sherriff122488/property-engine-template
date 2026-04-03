import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { UtilityForm } from "@/components/utilities/UtilityForm"
import { decryptCredential } from "@/lib/utils/crypto"
import type { Utility, Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit Utility" }

export default async function EditUtilityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: utilityData, error }, { data: propertiesData }, { data: credData }] =
    await Promise.all([
      supabase.from("utilities").select("*").eq("id", id).single(),
      supabase.from("properties").select("id, name").order("name"),
      supabase
        .from("utility_credentials")
        .select("username, password_encrypted")
        .eq("utility_id", id)
        .maybeSingle(),
    ])

  const utility = utilityData as Utility | null
  const properties = (propertiesData ?? []) as unknown as Pick<Property, "id" | "name">[]

  if (!utility || error) return notFound()

  // Decrypt the stored password server-side — never sent in plaintext via URL
  const credential = credData
    ? {
        username: (credData as { username: string | null; password_encrypted: string | null }).username,
        password: (credData as { username: string | null; password_encrypted: string | null }).password_encrypted
          ? decryptCredential(
              (credData as { username: string | null; password_encrypted: string | null }).password_encrypted!
            )
          : null,
      }
    : null

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/utilities"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to utilities
        </Link>
      </div>
      <PageHeader
        title="Edit utility"
        description={`${utility.supplier_name} — ${utility.utility_type.replace("_", " ")}`}
      />
      <UtilityForm
        utility={utility}
        credential={credential ?? undefined}
        properties={properties}
      />
    </div>
  )
}
