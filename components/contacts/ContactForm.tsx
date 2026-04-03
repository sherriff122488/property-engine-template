"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact"
import { createContact, updateContact, deleteContact } from "@/lib/actions/contacts"
import type { Contact } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { value: "tenant",           label: "Tenant" },
  { value: "letting_agent",    label: "Letting agent" },
  { value: "builder",          label: "Builder" },
  { value: "plumber",          label: "Plumber" },
  { value: "electrician",      label: "Electrician" },
  { value: "handyman",         label: "Handyman" },
  { value: "cleaner",          label: "Cleaner" },
  { value: "mortgage_broker",  label: "Mortgage Lender" },
  { value: "solicitor",        label: "Solicitor" },
  { value: "accountant",       label: "Accountant" },
  { value: "insurance_broker", label: "Insurance broker" },
  { value: "other",            label: "Other" },
] as const

// ── Sub-components ─────────────────────────────────────────────────────────

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

// ── Main component ─────────────────────────────────────────────────────────

interface ContactFormProps {
  contact?: Contact
  /** Pre-link to a property on creation (e.g. from a property detail page) */
  defaultPropertyId?: string
}

export function ContactForm({ contact, defaultPropertyId }: ContactFormProps) {
  const router = useRouter()
  const isEdit = !!contact
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          full_name: contact.full_name,
          company_name: contact.company_name ?? "",
          category: contact.category,
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          whatsapp: contact.whatsapp ?? "",
          notes: contact.notes ?? "",
        }
      : {
          category: "other",
        },
  })

  async function onSubmit(data: ContactFormValues) {
    setServerError(null)
    const result = isEdit
      ? await updateContact(contact.id, data)
      : await createContact(data, defaultPropertyId)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    // Return to property if we came from one, otherwise the contacts list
    if (defaultPropertyId) {
      router.push(`/properties/${defaultPropertyId}`)
    } else {
      router.push("/contacts")
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!contact) return
    const confirmed = window.confirm(
      "Delete this contact? This will also remove all property links. This cannot be undone."
    )
    if (!confirmed) return

    setDeleting(true)
    const result = await deleteContact(contact.id)
    if (!result.success) {
      setServerError(result.error)
      setDeleting(false)
      return
    }
    router.push("/contacts")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section: Contact details ──────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Contact details</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <Field label="Full name" required error={errors.full_name?.message}>
              <input
                {...register("full_name")}
                type="text"
                placeholder="e.g. Jane Smith"
                className={inputCls(!!errors.full_name)}
              />
            </Field>

            <Field label="Company / organisation" error={errors.company_name?.message}>
              <input
                {...register("company_name")}
                type="text"
                placeholder="e.g. Apex Lettings"
                className={inputCls(!!errors.company_name)}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Category" required error={errors.category?.message}>
                <select
                  {...register("category")}
                  className={inputCls(!!errors.category)}
                >
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

          </div>
        </div>

        {/* ── Section: Contact methods ──────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Contact methods</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            <Field label="Phone" error={errors.phone?.message}>
              <input
                {...register("phone")}
                type="tel"
                placeholder="07700 000000"
                className={inputCls(!!errors.phone)}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="WhatsApp" hint="(number or link)" error={errors.whatsapp?.message}>
              <input
                {...register("whatsapp")}
                type="text"
                placeholder="07700 000000"
                className={inputCls(!!errors.whatsapp)}
              />
            </Field>

          </div>
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
              {isEdit ? "Save changes" : "Add contact"}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
