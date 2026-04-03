"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { mortgageSchema, type MortgageFormValues } from "@/lib/validations/mortgage"
import { createMortgage, updateMortgage, deleteMortgage } from "@/lib/actions/mortgages"
import type { Mortgage, Property } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

interface MortgageFormProps {
  mortgage?: Mortgage
  properties: Pick<Property, "id" | "name">[]
  /** Pre-select a property (e.g. when adding from a property detail page) */
  defaultPropertyId?: string
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-stone-400 dark:text-stone-500">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls = (hasError?: boolean) =>
  cn(
    "w-full rounded-lg border px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
    "focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500",
    "disabled:opacity-50 transition-colors",
    hasError
      ? "border-red-300 bg-red-50/30 dark:bg-red-900/10"
      : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
  )

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-700 mb-5">
      {children}
    </h3>
  )
}

export function MortgageForm({ mortgage, properties, defaultPropertyId }: MortgageFormProps) {
  const router = useRouter()
  const isEdit = !!mortgage
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MortgageFormValues>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: mortgage
      ? {
          property_id: mortgage.property_id,
          lender_name: mortgage.lender_name,
          product_name: mortgage.product_name ?? "",
          fixed_start_date: mortgage.fixed_start_date ?? "",
          fixed_end_date: mortgage.fixed_end_date ?? "",
          monthly_payment: mortgage.monthly_payment ?? undefined,
          interest_rate: mortgage.interest_rate ?? undefined,
          loan_balance: mortgage.loan_balance ?? undefined,
          term_months: mortgage.term_months ?? undefined,
          review_date: mortgage.review_date ?? "",
          broker_name: mortgage.broker_name ?? "",
          broker_email: mortgage.broker_email ?? "",
          broker_phone: mortgage.broker_phone ?? "",
          notes: mortgage.notes ?? "",
        }
      : {
          property_id: defaultPropertyId ?? "",
        },
  })

  async function onSubmit(data: MortgageFormValues) {
    setServerError(null)
    const result = isEdit
      ? await updateMortgage(mortgage.id, data)
      : await createMortgage(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    router.push("/mortgages")
    router.refresh()
  }

  async function handleDelete() {
    if (!mortgage) return
    const confirmed = window.confirm(
      "Delete this mortgage record? This cannot be undone."
    )
    if (!confirmed) return

    setDeleting(true)
    const result = await deleteMortgage(mortgage.id, mortgage.property_id)
    if (!result.success) {
      setServerError(result.error)
      setDeleting(false)
      return
    }
    router.push("/mortgages")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section: Core details ──────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Mortgage details</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Property" required error={errors.property_id?.message}>
                <select {...register("property_id")} className={inputCls(!!errors.property_id)}>
                  <option value="">Select property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Lender name" required error={errors.lender_name?.message}>
              <input
                {...register("lender_name")}
                type="text"
                placeholder="e.g. Barclays, Halifax"
                className={inputCls(!!errors.lender_name)}
              />
            </Field>

            <Field label="Product name" error={errors.product_name?.message}>
              <input
                {...register("product_name")}
                type="text"
                placeholder="e.g. 2-year fixed 4.25%"
                className={inputCls(!!errors.product_name)}
              />
            </Field>

            <Field label="Fixed period start" error={errors.fixed_start_date?.message}>
              <input
                {...register("fixed_start_date")}
                type="date"
                className={inputCls(!!errors.fixed_start_date)}
              />
            </Field>

            <Field label="Fixed period end" error={errors.fixed_end_date?.message}>
              <input
                {...register("fixed_end_date")}
                type="date"
                className={inputCls(!!errors.fixed_end_date)}
              />
            </Field>

            <Field label="Review / renewal date" error={errors.review_date?.message}>
              <input
                {...register("review_date")}
                type="date"
                className={inputCls(!!errors.review_date)}
              />
            </Field>

            <Field
              label="Mortgage term"
              hint="(months)"
              error={errors.term_months?.message}
            >
              <input
                {...register("term_months")}
                type="number"
                min={1}
                placeholder="e.g. 300 for 25 years"
                className={inputCls(!!errors.term_months)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Financial figures ─────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Financial figures</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            <Field
              label="Monthly payment"
              hint="(£)"
              error={errors.monthly_payment?.message}
            >
              <input
                {...register("monthly_payment")}
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className={inputCls(!!errors.monthly_payment)}
              />
            </Field>

            <Field
              label="Interest rate"
              hint="(%)"
              error={errors.interest_rate?.message}
            >
              <input
                {...register("interest_rate")}
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="4.25"
                className={inputCls(!!errors.interest_rate)}
              />
            </Field>

            <Field
              label="Loan balance"
              hint="(£)"
              error={errors.loan_balance?.message}
            >
              <input
                {...register("loan_balance")}
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className={inputCls(!!errors.loan_balance)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Broker ────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Broker</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            <Field label="Broker name" error={errors.broker_name?.message}>
              <input
                {...register("broker_name")}
                type="text"
                placeholder="Full name"
                className={inputCls(!!errors.broker_name)}
              />
            </Field>

            <Field label="Broker email" error={errors.broker_email?.message}>
              <input
                {...register("broker_email")}
                type="email"
                placeholder="broker@example.com"
                className={inputCls(!!errors.broker_email)}
              />
            </Field>

            <Field label="Broker phone" error={errors.broker_phone?.message}>
              <input
                {...register("broker_phone")}
                type="tel"
                placeholder="07700 000000"
                className={inputCls(!!errors.broker_phone)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Notes ─────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Notes</SectionTitle>
          <textarea
            {...register("notes")}
            rows={4}
            placeholder="Any additional notes…"
            className={cn(inputCls(!!errors.notes), "resize-none")}
          />
        </div>

        {/* ── Server error ───────────────────────────────────────── */}
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-transparent px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting || deleting}
              className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 dark:bg-stone-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add mortgage"}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
