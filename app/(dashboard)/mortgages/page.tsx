import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { MortgagesTable, type MortgageRow } from "@/components/mortgages/MortgagesTable"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = { title: "Mortgages" }

type MortgageWithProperty = {
  id: string
  property_id: string
  lender_name: string
  product_name: string | null
  fixed_start_date: string | null
  fixed_end_date: string | null
  monthly_payment: number | null
  loan_balance: number | null
  review_date: string | null
  properties: { name: string } | null
}

export default async function MortgagesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mortgages")
    .select(`
      id, property_id, lender_name, product_name,
      fixed_start_date, fixed_end_date,
      monthly_payment, loan_balance, review_date,
      properties ( name )
    `)
    .order("fixed_end_date", { ascending: true, nullsFirst: false })

  if (error) console.error("MortgagesPage fetch error:", error)

  const rows: MortgageRow[] = ((data ?? []) as unknown as MortgageWithProperty[]).map((m) => ({
    id: m.id,
    property_id: m.property_id,
    property_name: m.properties?.name ?? "Unknown property",
    lender_name: m.lender_name,
    product_name: m.product_name,
    fixed_start_date: m.fixed_start_date,
    fixed_end_date: m.fixed_end_date,
    monthly_payment: m.monthly_payment,
    loan_balance: m.loan_balance,
    review_date: m.review_date,
  }))

  return (
    <div>
      <PageHeader
        title="Mortgages"
        description={`${rows.length} mortgage${rows.length !== 1 ? "s" : ""} across your portfolio.`}
        action={
          <Link
            href="/mortgages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add mortgage
          </Link>
        }
      />
      <MortgagesTable data={rows} />
    </div>
  )
}
