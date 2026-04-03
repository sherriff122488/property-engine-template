import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { ContactForm } from "@/components/contacts/ContactForm"
import type { Contact } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata = { title: "Edit Contact" }

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

  const contact = data as Contact | null
  if (!contact || error) return notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contacts
        </Link>
      </div>
      <PageHeader
        title="Edit contact"
        description={contact.company_name ?? contact.full_name}
      />
      <ContactForm contact={contact} />
    </div>
  )
}
