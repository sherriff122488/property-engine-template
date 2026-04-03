import { createClient } from "@/lib/supabase/server"
import { PropertyDetailTabs } from "@/components/properties/PropertyDetailTabs"
import type { Property } from "@/lib/types/database.types"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("properties").select("name").eq("id", id).single()
  return { title: (data as { name: string } | null)?.name ?? "Property" }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data, error },
    { data: mortgageData },
    { data: utilityData },
    { data: contactData },
    { data: complianceData },
    { data: fileData },
  ] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase
      .from("mortgages")
      .select("id, lender_name, product_name, fixed_end_date, monthly_payment, interest_rate, loan_balance, review_date")
      .eq("property_id", id)
      .order("fixed_end_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("utilities")
      .select("id, utility_type, supplier_name, account_number, login_url")
      .eq("property_id", id)
      .order("utility_type"),
    supabase
      .from("property_contacts")
      .select("contacts ( id, full_name, company_name, category, phone, email )")
      .eq("property_id", id),
    supabase
      .from("compliance_documents")
      .select("id, document_type, issue_date, expiry_date, file_url")
      .eq("property_id", id)
      .order("expiry_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("file_records")
      .select("id, file_name, category, file_url, description")
      .eq("property_id", id)
      .order("file_name"),
  ])

  const property = data as Property | null
  if (!property || error) return notFound()

  type MortgageSummary = {
    id: string
    lender_name: string
    product_name: string | null
    fixed_end_date: string | null
    monthly_payment: number | null
    interest_rate: number | null
    loan_balance: number | null
    review_date: string | null
  }
  const mortgages = (mortgageData ?? []) as unknown as MortgageSummary[]

  type UtilitySummary = {
    id: string
    utility_type: import("@/lib/types/database.types").UtilityType
    supplier_name: string
    account_number: string | null
    login_url: string | null
  }
  const utilities = (utilityData ?? []) as unknown as UtilitySummary[]

  type ContactSummary = {
    id: string
    full_name: string
    company_name: string | null
    category: import("@/lib/types/database.types").ContactCategory
    phone: string | null
    email: string | null
  }
  type PropertyContactRow = { contacts: ContactSummary | null }
  const contacts = ((contactData ?? []) as unknown as PropertyContactRow[])
    .map((r) => r.contacts)
    .filter((c): c is ContactSummary => c !== null)

  type ComplianceSummary = {
    id: string
    document_type: import("@/lib/types/database.types").ComplianceDocType
    issue_date: string | null
    expiry_date: string | null
    file_url: string | null
  }
  const complianceDocs = (complianceData ?? []) as unknown as ComplianceSummary[]

  type FileSummary = {
    id: string
    file_name: string
    category: import("@/lib/types/database.types").FileCategory
    file_url: string | null
    description: string | null
  }
  const files = (fileData ?? []) as unknown as FileSummary[]

  return (
    <div>
      {/* Nav row */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All properties
        </Link>
        <Link
          href={`/properties/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3.5 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{property.name}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {[property.address_line_1, property.city, property.postcode]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      {/* Tabbed detail panel */}
      <PropertyDetailTabs
        property={property}
        mortgages={mortgages}
        utilities={utilities}
        contacts={contacts}
        complianceDocs={complianceDocs}
        files={files}
      />
    </div>
  )
}
