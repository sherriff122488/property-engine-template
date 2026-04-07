 import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  Wrench,
  Eye,
  Clock,
  ArrowRight,
  TrendingUp,
  PieChart,
  Wallet,
  Banknote,
  ShieldCheck,
  Star,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ExpiryBadge } from "@/components/shared/ExpiryBadge"
import { ComplianceDocTypeBadge } from "@/components/compliance/ComplianceDocTypeBadge"
import type {
  PropertyStatus,
  ComplianceDocType,
} from "@/lib/types/database.types"
import { formatDate } from "@/lib/utils"
import { addDays, addMonths, format } from "date-fns"

export const metadata = { title: "Dashboard" }

// ── Helpers ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  note,
  href,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  note?: string
  href?: string
}) {
  const inner = (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm h-full transition-colors hover:border-stone-300 dark:hover:border-stone-600">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">
          <Icon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold text-stone-900 dark:text-stone-100">{value}</p>
      {note && <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{note}</p>}
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

function SectionHeader({
  icon: Icon,
  title,
  href,
}: {
  icon: React.ElementType
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 px-5 py-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
      >
        View all
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-sm text-stone-400 dark:text-stone-500">{message}</p>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

type PropertyStatusRow = { status: PropertyStatus }
type MortgageAlertRow = {
  id: string
  lender_name: string
  fixed_end_date: string | null
  properties: { id: string; name: string } | null
}
type ComplianceAlertRow = {
  id: string
  document_type: ComplianceDocType
  expiry_date: string | null
  properties: { id: string; name: string } | null
}
type RecentPropertyRow = {
  id: string
  name: string
  status: PropertyStatus
  address_line_1: string
  city: string
  updated_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")
  const in60Days = format(addDays(today, 60), "yyyy-MM-dd")
  const in6Months = format(addMonths(today, 6), "yyyy-MM-dd")
  const in3Months = format(addMonths(today, 3), "yyyy-MM-dd")

  const [
    { data: propertyStatusData },
    { data: propertyValueData },
    { data: mortgageLtvData },
    { data: mortgagePaymentData },
    { data: mortgageAlertData },
    { data: mortgageReviewData },
    { data: complianceAlertData },
    { data: complianceExpiredData },
    { data: complianceTotalData },
    { data: reviewScoreData },
    { data: recentPropertyData },
    { data: incomeData },
    { data: entityPropertyData },
    { data: allMortgageDebtData },
  ] = await Promise.all([
    // All property statuses for counting
    supabase.from("properties").select("status"),

    // Property values for portfolio total
    supabase.from("properties").select("current_value").not("current_value", "is", null),

    // Loan balances joined to property values (for LTV calculation)
    supabase.from("mortgages").select("loan_balance, properties ( current_value )"),

    // Monthly payments for total mortgage cost
    supabase.from("mortgages").select("monthly_payment").not("monthly_payment", "is", null),

    // Mortgages with fixed_end_date on or before 6 months from now
    supabase
      .from("mortgages")
      .select("id, lender_name, fixed_end_date, properties ( id, name )")
      .not("fixed_end_date", "is", null)
      .lte("fixed_end_date", in6Months)
      .order("fixed_end_date", { ascending: true })
      .limit(8),

    // Mortgages with review_date within 3 months (but fixed rate not yet ending)
    supabase
      .from("mortgages")
      .select("id, lender_name, review_date, fixed_end_date, properties ( id, name )")
      .not("review_date", "is", null)
      .lte("review_date", in3Months)
      .gt("fixed_end_date", in6Months) // exclude those already in fixed_end alerts
      .order("review_date", { ascending: true })
      .limit(8),

    // Compliance docs expiring within 60 days
    supabase
      .from("compliance_documents")
      .select("id, document_type, expiry_date, properties ( id, name )")
      .not("expiry_date", "is", null)
      .lte("expiry_date", in60Days)
      .order("expiry_date", { ascending: true })
      .limit(8),

    // Expired compliance docs (for health score)
    supabase
      .from("compliance_documents")
      .select("id", { count: "exact", head: true })
      .not("expiry_date", "is", null)
      .lt("expiry_date", todayStr),

    // Total compliance docs (for health score)
    supabase
      .from("compliance_documents")
      .select("id", { count: "exact", head: true }),

    // Review scores for Airbnb properties
    supabase
      .from("property_reviews")
      .select("platform, overall_score, properties ( id, name, status )"),

    // 6 most recently updated properties
    supabase
      .from("properties")
      .select("id, name, status, address_line_1, city, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),

    // Monthly income for cashflow & yield
    supabase.from("properties").select("estimated_monthly_income").not("estimated_monthly_income", "is", null),
    supabase.from("properties").select("id, entity_name, current_value").not("current_value", "is", null),
    supabase.from("mortgages").select("property_id, loan_balance").not("loan_balance", "is", null),
  ])

  // ── Status counts ──────────────────────────────────────────────────────
  const statuses = (propertyStatusData ?? []) as PropertyStatusRow[]
  const total = statuses.length
  const letCount = statuses.filter((p) => p.status === "let" || p.status === "airbnb").length
  const vacantCount = statuses.filter((p) => p.status === "vacant").length
  const refurbCount = statuses.filter((p) => p.status === "under_refurb").length

  // ── Portfolio value & LTV ──────────────────────────────────────────────
  const portfolioValue = (propertyValueData ?? []).reduce(
    (sum, p) => sum + ((p as { current_value: number }).current_value ?? 0),
    0
  )
  // Only sum debt for properties that have a known value (excludes Mariners Wharf etc.)
  const totalDebt = (mortgageLtvData ?? []).reduce((sum, m) => {
    const row = m as unknown as { loan_balance: number | null; properties: { current_value: number | null } | null }
    if (!row.properties?.current_value) return sum
    return sum + (row.loan_balance ?? 0)
  }, 0)
  const portfolioLtv = portfolioValue > 0 ? Math.round((totalDebt / portfolioValue) * 100) : null

  const formatPortfolioValue = (v: number) =>
    v >= 1_000_000
      ? `£${(v / 1_000_000).toFixed(2)}m`
      : `£${(v / 1_000).toFixed(0)}k`

  // ── Monthly mortgage cost ───────────────────────────────────────────────
  const monthlyMortgageCost = (mortgagePaymentData ?? []).reduce(
    (sum, m) => sum + ((m as { monthly_payment: number }).monthly_payment ?? 0), 0
  )

  // ── Portfolio equity ────────────────────────────────────────────────────
  const portfolioEquity = portfolioValue - totalDebt

  // ── Income, cashflow & yield ────────────────────────────────────────────
  const monthlyIncome = (incomeData ?? []).reduce(
    (sum, p) => sum + ((p as { estimated_monthly_income: number }).estimated_monthly_income ?? 0), 0
  )
  const monthlyCashflow = monthlyIncome - monthlyMortgageCost
  const grossYield = portfolioValue > 0
    ? ((monthlyIncome * 12) / portfolioValue) * 100
    : null

  // ── Compliance health ───────────────────────────────────────────────────
  const expiredDocs = (complianceExpiredData as unknown as { count: number } | null)?.count ?? 0
  const totalDocs = (complianceTotalData as unknown as { count: number } | null)?.count ?? 0
  const validDocs = totalDocs - expiredDocs

  // ── Review scores (normalised to /5) ────────────────────────────────────
  type ReviewScoreRow = { platform: string; overall_score: number | null; properties: { id: string; name: string; status: string } | null }
  const reviewRows = (reviewScoreData ?? []) as unknown as ReviewScoreRow[]
  // Group by property, only airbnb-status properties
  const airbnbReviews = new Map<string, { name: string; airbnb?: number; booking?: number }>()
  for (const r of reviewRows) {
    if (!r.properties || r.properties.status !== "airbnb") continue
    const pid = r.properties.id
    if (!airbnbReviews.has(pid)) airbnbReviews.set(pid, { name: r.properties.name })
    const entry = airbnbReviews.get(pid)!
    if (r.platform === "airbnb" && r.overall_score != null) entry.airbnb = r.overall_score
    if (r.platform === "booking_com" && r.overall_score != null) entry.booking = r.overall_score / 2
  }
  const airbnbReviewList = Array.from(airbnbReviews.entries()).map(([id, v]) => ({ id, ...v }))

  type MortgageReviewRow = { id: string; lender_name: string; review_date: string | null; fixed_end_date: string | null; properties: { id: string; name: string } | null }
  const mortgageAlerts = (mortgageAlertData ?? []) as unknown as MortgageAlertRow[]
  const mortgageReviews = (mortgageReviewData ?? []) as unknown as MortgageReviewRow[]
  const complianceAlerts = (complianceAlertData ?? []) as unknown as ComplianceAlertRow[]
  const recentProperties = (recentPropertyData ?? []) as unknown as RecentPropertyRow[]

  // ── Unified reminders list (sorted by date) ─────────────────────────────
  type Reminder =
    | { kind: "mortgage"; date: string; id: string; propertyName: string; lender: string; isReview: boolean }
    | { kind: "compliance"; date: string; id: string; propertyName: string; docType: ComplianceDocType; isReview: boolean }

  const reminders: Reminder[] = [
    ...mortgageAlerts
      .filter((m) => m.fixed_end_date)
      .map((m) => ({
        kind: "mortgage" as const,
        date: m.fixed_end_date!,
        id: m.id,
        propertyName: m.properties?.name ?? "Unknown property",
        lender: m.lender_name,
        isReview: false,
      })),
    ...mortgageReviews
      .filter((m) => m.review_date)
      .map((m) => ({
        kind: "mortgage" as const,
        date: m.review_date!,
        id: m.id,
        propertyName: m.properties?.name ?? "Unknown property",
        lender: m.lender_name,
        isReview: true,
      })),
    ...complianceAlerts
      .filter((c) => c.expiry_date)
      .map((c) => ({
        kind: "compliance" as const,
        date: c.expiry_date!,
        id: c.id,
        propertyName: c.properties?.name ?? "Unknown property",
        docType: c.document_type,
        isReview: false,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Overview of your property portfolio.</p>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total properties" value={total} icon={Building2} note="in your portfolio" href="/properties" />
        <StatCard
          label="Let / Airbnb"
          value={letCount}
          icon={CheckCircle2}
          note={total > 0 ? `${Math.round((letCount / total) * 100)}% of portfolio` : undefined}
          href="/properties"
        />
        <StatCard label="Vacant" value={vacantCount} icon={Eye} note="between tenants" href="/properties" />
        <StatCard label="Under refurb" value={refurbCount} icon={Wrench} note="being refurbished" href="/properties" />
        <StatCard
          label="Portfolio value"
          value={portfolioValue > 0 ? formatPortfolioValue(portfolioValue) : "—"}
          icon={TrendingUp}
          note={portfolioValue > 0 ? `£${portfolioValue.toLocaleString("en-GB")}` : "No values set"}
          href="/properties"
        />
        <StatCard
          label="Total equity"
          value={portfolioEquity > 0 ? formatPortfolioValue(portfolioEquity) : "—"}
          icon={Wallet}
          note={portfolioEquity > 0 ? `£${portfolioEquity.toLocaleString("en-GB")}` : "No data"}
          href="/properties"
        />
        <StatCard
          label="Portfolio LTV"
          value={portfolioLtv !== null ? `${portfolioLtv}%` : "—"}
          icon={PieChart}
          note={portfolioLtv !== null ? `£${totalDebt.toLocaleString("en-GB")} debt` : "No mortgage data"}
          href="/mortgages"
        />
        <StatCard
          label="Monthly mortgage cost"
          value={monthlyMortgageCost > 0 ? `£${Math.round(monthlyMortgageCost).toLocaleString("en-GB")}` : "—"}
          icon={Banknote}
          note={monthlyMortgageCost > 0 ? `£${Math.round(monthlyMortgageCost * 12).toLocaleString("en-GB")} / year` : "No data"}
          href="/mortgages"
        />
        <StatCard
          label="Monthly income"
          value={monthlyIncome > 0 ? `£${Math.round(monthlyIncome).toLocaleString("en-GB")}` : "—"}
          icon={ArrowUpRight}
          note={monthlyIncome > 0 ? `£${Math.round(monthlyIncome * 12).toLocaleString("en-GB")} / year` : "No data"}
          href="/properties"
        />
        <StatCard
          label="Gross monthly profit"
          value={monthlyIncome > 0 ? `£${Math.round(monthlyCashflow).toLocaleString("en-GB")}` : "—"}
          icon={Wallet}
          note={monthlyCashflow > 0 ? `£${Math.round(monthlyCashflow * 12).toLocaleString("en-GB")} / year` : undefined}
          href="/properties"
        />
        <StatCard
          label="Gross yield"
          value={grossYield !== null ? `${grossYield.toFixed(1)}%` : "—"}
          icon={TrendingUp}
          note="annual rent / portfolio value"
          href="/properties"
        />
      </div>

      {/* ── Unified reminders panel ──────────────────────────────────── */}
      {matthewTotalEquity > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-700 px-5 py-4">
            <Wallet className="h-4 w-4 text-stone-500 dark:text-stone-400" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Matthew&apos;s equity breakdown</h2>
          </div>
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-stone-100 dark:divide-stone-700">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Personal (direct)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">
                £{Math.round(matthewDirectEquity).toLocaleString('en-GB')}
              </p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Matthew Sherriff (direct ownership)</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Via P.I.G (50% of SPH)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">
                £{Math.round(matthewPIGEquity).toLocaleString('en-GB')}
              </p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">50% of SPH equity (£{Math.round(sphEquity).toLocaleString('en-GB')} total)</p>
            </div>
            <div className="px-5 py-4 bg-stone-50 dark:bg-stone-700/30">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Matthew&apos;s total equity</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: '#CF7454' }}>
                £{Math.round(matthewTotalEquity).toLocaleString('en-GB')}
              </p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">direct + P.I.G share combined</p>
            </div>
          </div>
        </div>
      )}

      {matthewTotalEquity > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-700 px-5 py-4">
            <Wallet className="h-4 w-4 text-stone-500 dark:text-stone-400" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Matthew&apos;s equity breakdown</h2>
          </div>
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-stone-100 dark:divide-stone-700">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Personal (direct)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">£{Math.round(matthewDirectEquity).toLocaleString('en-GB')}</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Matthew Sherriff (direct ownership)</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Via P.I.G (50% of SPH)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">£{Math.round(matthewPIGEquity).toLocaleString('en-GB')}</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">50% of SPH equity (£{Math.round(sphEquity).toLocaleString('en-GB')} total)</p>
            </div>
            <div className="px-5 py-4 bg-stone-50 dark:bg-stone-700/30">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Matthew&apos;s total equity</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: '#CF7454' }}>£{Math.round(matthewTotalEquity).toLocaleString('en-GB')}</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">direct + P.I.G share combined</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Clock}
          title="Upcoming reminders"
          href="/compliance"
        />
        {reminders.length === 0 ? (
          <EmptyRow message="No compliance or mortgage deadlines in the next 6 months." />
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {reminders.map((r) => (
              <Link
                key={`${r.kind}-${r.id}`}
                href={r.kind === "mortgage" ? `/mortgages/${r.id}/edit` : `/compliance/${r.id}/edit`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {r.propertyName}
                  </p>
                  <div className="mt-0.5">
                    {r.kind === "mortgage" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-700">
                        {r.isReview ? <CalendarClock className="h-3 w-3" /> : null}
                        {r.isReview ? "Review due" : "Rate expires"} · {r.lender}
                      </span>
                    ) : (
                      <ComplianceDocTypeBadge type={r.docType} />
                    )}
                  </div>
                </div>
                <ExpiryBadge expiryDate={r.date} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Compliance health + Airbnb reviews ──────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Compliance health */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Compliance health</h2>
            </div>
            <Link href="/compliance" className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">{validDocs}<span className="text-base font-normal text-stone-400 dark:text-stone-500"> / {totalDocs}</span></p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">documents valid</p>
              </div>
              {expiredDocs > 0 ? (
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-700">
                  {expiredDocs} expired
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-700">
                  All valid
                </span>
              )}
            </div>
            {totalDocs > 0 && (
              <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${expiredDocs > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.round((validDocs / totalDocs) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Airbnb review scores */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 px-5 py-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Holiday let scores</h2>
            </div>
            <Link href="/reviews" className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {airbnbReviewList.length === 0 ? (
            <div className="px-5 py-8 text-center"><p className="text-sm text-stone-400 dark:text-stone-500">No review data yet.</p></div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-700">
              {airbnbReviewList.map((p) => (
                <Link key={p.id} href="/reviews" className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{p.name}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {p.airbnb != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF385C]">
                        <span className="font-bold text-[10px] bg-[#FF385C] text-white rounded-full w-4 h-4 flex items-center justify-center">A</span>
                        {p.airbnb.toFixed(1)}
                      </span>
                    )}
                    {p.booking != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#003580]">
                        <span className="font-bold text-[10px] bg-[#003580] text-white rounded-full w-4 h-4 flex items-center justify-center">B</span>
                        {p.booking.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Recently updated properties ──────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Building2}
          title="Recently updated properties"
          href="/properties"
        />
        {recentProperties.length === 0 ? (
          <EmptyRow message="No properties yet. Add your first property to get started." />
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {recentProperties.map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{p.name}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {[p.address_line_1, p.city].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block">
                    {formatDate(p.updated_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
