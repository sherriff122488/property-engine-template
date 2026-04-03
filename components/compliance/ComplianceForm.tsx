"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { complianceSchema, type ComplianceFormValues } from "@/lib/validations/compliance"
import {
  createComplianceDoc,
  updateComplianceDoc,
  deleteComplianceDoc,
} from "@/lib/actions/compliance"
import type { ComplianceDocument, Property } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

const DOC_TYPES = [
  { value: "epc",                            label: "EPC" },
  { value: "gas_safety_certificate",          label: "Gas Safety Certificate" },
  { value: "eicr",                            label: "EICR (Electrical)" },
  { value: "pat_testing",                     label: "PAT Testing" },
  { value: "fire_alarm_certificate",          label: "Fire Alarm Certificate" },
  { value: "emergency_lighting_certificate",  label: "Emergency Lighting Certificate" },
  { value: "legionella",                      label: "Legionella Risk Assessment" },
  { value: "hmo_licence",                     label: "HMO Licence" },
  { value: "insurance_schedule",              label: "Insurance Schedule" },
  { value: "fire_risk_assessment",            label: "Fire Risk Assessment" },
  { value: "other",                           label: "Other" },
] as const

// ── Sub-components ──────────────────────────────────────────────────────────

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

// ── Main component ──────────────────────────────────────────────────────────

interface ComplianceFormProps {
  doc?: ComplianceDocument
  properties: Pick<Property, "id" | "name">[]
  defaultPropertyId?: string
}

export function ComplianceForm({
  doc,
  properties,
  defaultPropertyId,
}: ComplianceFormProps) {
  const router = useRouter()
  const isEdit = !!doc
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComplianceFormValues>({
    resolver: zodResolver(complianceSchema),
    defaultValues: doc
      ? {
          property_id: doc.property_id,
          document_type: doc.document_type,
          issue_date: doc.issue_date ?? "",
          expiry_date: doc.expiry_date ?? "",
          file_url: doc.file_url ?? "",
          notes: doc.notes ?? "",
        }
      : {
          property_id: defaultPropertyId ?? "",
          document_type: "epc",
        },
  })

  async function onSubmit(data: ComplianceFormValues) {
    setServerError(null)
    const result = isEdit
      ? await updateComplianceDoc(doc.id, data)
      : await createComplianceDoc(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    if (defaultPropertyId && !isEdit) {
      router.push(`/properties/${defaultPropertyId}`)
    } else {
      router.push("/compliance")
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!doc) return
    const confirmed = window.confirm(
      "Delete this compliance document? This cannot be undone."
    )
    if (!confirmed) return

    setDeleting(true)
    const result = await deleteComplianceDoc(doc.id, doc.property_id)
    if (!result.success) {
      setServerError(result.error)
      setDeleting(false)
      return
    }
    router.push("/compliance")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section: Document details ─────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Document details</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Property" required error={errors.property_id?.message}>
                <select
                  {...register("property_id")}
                  className={inputCls(!!errors.property_id)}
                >
                  <option value="">Select property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Document type"
                required
                error={errors.document_type?.message}
              >
                <select
                  {...register("document_type")}
                  className={inputCls(!!errors.document_type)}
                >
                  {DOC_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Issue date" error={errors.issue_date?.message}>
              <input
                {...register("issue_date")}
                type="date"
                className={inputCls(!!errors.issue_date)}
              />
            </Field>

            <Field label="Expiry date" error={errors.expiry_date?.message}>
              <input
                {...register("expiry_date")}
                type="date"
                className={inputCls(!!errors.expiry_date)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Document link ────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Document link</SectionTitle>
          <Field
            label="File URL"
            hint="(Google Drive, Dropbox, or any link)"
            error={errors.file_url?.message}
          >
            <input
              {...register("file_url")}
              type="url"
              placeholder="https://drive.google.com/…"
              className={inputCls(!!errors.file_url)}
            />
          </Field>
        </div>

        {/* ── Section: Notes ────────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Notes</SectionTitle>
          <textarea
            {...register("notes")}
            rows={4}
            placeholder="Any additional notes…"
            className={cn(inputCls(!!errors.notes), "resize-none")}
          />
        </div>

        {/* ── Server error ──────────────────────────────────────────── */}
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-transparent px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
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
              {isEdit ? "Save changes" : "Add document"}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
