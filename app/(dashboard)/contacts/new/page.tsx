import { PageHeader } from "@/components/shared/PageHeader"
import { ContactForm } from "@/components/contacts/ContactForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Add Contact" }

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ property_id?: string }>
}) {
  const { property_id } = await searchParams

  return (
    <div>
      <div className="mb-6">
        <Link
          href={property_id ? `/properties/${property_id}` : "/contacts"}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {property_id ? "Back to property" : "Back to contacts"}
        </Link>
      </div>
      <PageHeader
        title="Add contact"
        description="Add a new contact to your directory."
      />
      <ContactForm defaultPropertyId={property_id} />
    </div>
  )
}
