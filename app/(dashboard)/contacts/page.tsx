import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { ContactsTable, type ContactRow } from "@/components/contacts/ContactsTable"
import type { ContactCategory } from "@/lib/types/database.types"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Contacts" }

type ContactWithCount = {
  id: string
  full_name: string
  company_name: string | null
  category: ContactCategory
  phone: string | null
  email: string | null
  property_contacts: { property_id: string }[]
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("contacts")
    .select(`
      id, full_name, company_name, category, phone, email,
      property_contacts ( property_id )
    `)
    .order("full_name")

  if (error) console.error("ContactsPage fetch error:", error)

  const rows: ContactRow[] = (
    (data ?? []) as unknown as ContactWithCount[]
  ).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    company_name: c.company_name,
    category: c.category,
    phone: c.phone,
    email: c.email,
    property_count: c.property_contacts?.length ?? 0,
  }))

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${rows.length} contact${rows.length !== 1 ? "s" : ""} in your directory.`}
        action={
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add contact
          </Link>
        }
      />
      <ContactsTable data={rows} />
    </div>
  )
}
