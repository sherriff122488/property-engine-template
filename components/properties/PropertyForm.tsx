"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { propertySchema, type PropertyFormValues } from "@/lib/validations/property"
import { createProperty, updateProperty, deleteProperty } from "@/lib/actions/properties"
import type { Property } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

interface PropertyFormProps {
  property?: Property
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Shared input className ─────────────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
  cn(
    "w-full rounded-lg border px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
    "focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500",
    "disabled:opacity-50 transition-colors",
    hasError
      ? "border-red-300 bg-red-50/30 dark:bg-red-900/10"
      : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
  )

const selectCls = (hasError?: boolean) =>
  cn(inputCls(hasError), "appearance-none bg-no-repeat")

// ── Section header ─────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-700 mb-5">
      {children}
    </h3>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const isEdit = !!property
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          name: property.name,
          address_line_1: property.address_line_1,
          address_line_2: property.address_line_2 ?? "",
          city: property.city,
          postcode: property.postcode,
          bedrooms: property.bedrooms ?? undefined,
          property_type: property.property_type,
          entity_name: property.entity_name ?? "",
          tenure: property.tenure ?? undefined,
          status: property.status,
          notes: property.notes ?? "",
          google_drive_photos_url: property.google_drive_photos_url ?? "",
          current_value: property.current_value ?? undefined,
          estimated_monthly_income: property.estimated_monthly_income ?? undefined,
        }
      : {
          status: "owned",
        },
  })

  async function onSubmit(data: PropertyFormValues) {
    setServerError(null)
    const result = isEdit
      ? await updateProperty(property.id, data)
      : await createProperty(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    router.push(`/properties/${result.id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!property) return
    const confirmed = window.confirm(
      `Delete "${property.name}"? This will permanently remove the property and all linked records. This cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(true)
    const result = await deleteProperty(property.id)
    if (!result.success) {
      setServerError(result.error)
      setDeleting(false)
      return
    }
    router.push("/properties")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section: Basic info ────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Basic information</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Property name / internal label" required error={errors.name?.message}>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. 14 Church Street, Flat 3B"
                  className={inputCls(!!errors.name)}
                />
              </Field>
            </div>

            <Field label="Property type" required error={errors.property_type?.message}>
              <select {...register("property_type")} className={selectCls(!!errors.property_type)}>
                <option value="">Select type…</option>
                <option value="house">House</option>
                <option value="flat">Flat</option>
                <option value="hmo">HMO</option>
                <option value="mufb">MUFB</option>
                <option value="commercial">Commercial</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Status" required error={errors.status?.message}>
              <select {...register("status")} className={selectCls(!!errors.status)}>
                <option value="owned">Owned</option>
                <option value="under_refurb">Under refurb</option>
                <option value="let">Let</option>
                <option value="vacant">Vacant</option>
                <option value="airbnb">Airbnb</option>
                <option value="sale_agreed">Sale agreed</option>
                <option value="sold">Sold</option>
              </select>
            </Field>

            <Field label="Tenure" error={errors.tenure?.message}>
              <select {...register("tenure")} className={selectCls(!!errors.tenure)}>
                <option value="">Select tenure…</option>
                <option value="freehold">Freehold</option>
                <option value="leasehold">Leasehold</option>
                <option value="share_of_freehold">Share of freehold</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Bedrooms" error={errors.bedrooms?.message}>
              <input
                {...register("bedrooms")}
                type="number"
                min={0}
                placeholder="0"
                className={inputCls(!!errors.bedrooms)}
              />
            </Field>

            <Field label="Ownership entity / company" error={errors.entity_name?.message}>
              <input
                {...register("entity_name")}
                type="text"
                placeholder="e.g. Davies Properties Ltd"
                className={inputCls(!!errors.entity_name)}
              />
            </Field>

            <Field label="Current value (£)" error={errors.current_value?.message}>
              <input
                {...register("current_value")}
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 250000"
                className={inputCls(!!errors.current_value)}
              />
            </Field>

            <Field label="Est. monthly income (£)" error={errors.estimated_monthly_income?.message}>
              <input
                {...register("estimated_monthly_income")}
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 1200"
                className={inputCls(!!errors.estimated_monthly_income)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Address ───────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Address</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Address line 1" required error={errors.address_line_1?.message}>
                <input
                  {...register("address_line_1")}
                  type="text"
                  placeholder="Street address"
                  className={inputCls(!!errors.address_line_1)}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Address line 2" error={errors.address_line_2?.message}>
                <input
                  {...register("address_line_2")}
                  type="text"
                  placeholder="Apartment, unit, etc. (optional)"
                  className={inputCls(!!errors.address_line_2)}
                />
              </Field>
            </div>

            <Field label="City" required error={errors.city?.message}>
              <input
                {...register("city")}
                type="text"
                placeholder="City or town"
                className={inputCls(!!errors.city)}
              />
            </Field>

            <Field label="Postcode" required error={errors.postcode?.message}>
              <input
                {...register("postcode")}
                type="text"
                placeholder="e.g. SW1A 1AA"
                className={cn(inputCls(!!errors.postcode), "uppercase")}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Links & notes ─────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Links &amp; notes</SectionTitle>
          <div className="space-y-5">

            <Field
              label="Google Drive photos link"
              error={errors.google_drive_photos_url?.message}
            >
              <input
                {...register("google_drive_photos_url")}
                type="url"
                placeholder="https://drive.google.com/…"
                className={inputCls(!!errors.google_drive_photos_url)}
              />
            </Field>

            <Field label="Notes" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                rows={4}
                placeholder="Any additional notes about this property…"
                className={cn(inputCls(!!errors.notes), "resize-none")}
              />
            </Field>

          </div>
        </div>

        {/* ── Server error ───────────────────────────────────────────── */}
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────────── */}
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
                Delete property
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
              {isEdit ? "Save changes" : "Add property"}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
