"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react"
import { utilitySchema, type UtilityFormValues } from "@/lib/validations/utility"
import { createUtility, updateUtility, deleteUtility } from "@/lib/actions/utilities"
import type { Utility, Property } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

interface UtilityFormProps {
  utility?: Utility
  /** Decrypted credential values from the server — only present in edit mode */
  credential?: { username: string | null; password: string | null }
  properties: Pick<Property, "id" | "name">[]
  defaultPropertyId?: string
}

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

export function UtilityForm({
  utility,
  credential,
  properties,
  defaultPropertyId,
}: UtilityFormProps) {
  const router = useRouter()
  const isEdit = !!utility
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UtilityFormValues>({
    resolver: zodResolver(utilitySchema),
    defaultValues: utility
      ? {
          property_id: utility.property_id,
          utility_type: utility.utility_type,
          supplier_name: utility.supplier_name,
          account_number: utility.account_number ?? "",
          login_url: utility.login_url ?? "",
          billing_name: utility.billing_name ?? "",
          notes: utility.notes ?? "",
          username: credential?.username ?? "",
          password: "",  // Never pre-fill — user must re-enter to change
        }
      : {
          property_id: defaultPropertyId ?? "",
        },
  })

  async function onSubmit(data: UtilityFormValues) {
    setServerError(null)
    const result = isEdit
      ? await updateUtility(utility.id, data)
      : await createUtility(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    router.push("/utilities")
    router.refresh()
  }

  async function handleDelete() {
    if (!utility) return
    const confirmed = window.confirm("Delete this utility record? This cannot be undone.")
    if (!confirmed) return

    setDeleting(true)
    const result = await deleteUtility(utility.id, utility.property_id)
    if (!result.success) {
      setServerError(result.error)
      setDeleting(false)
      return
    }
    router.push("/utilities")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section: Account details ──────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Account details</SectionTitle>
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

            <Field label="Utility type" required error={errors.utility_type?.message}>
              <select
                {...register("utility_type")}
                className={inputCls(!!errors.utility_type)}
              >
                <option value="">Select type…</option>
                <option value="electric">Electric</option>
                <option value="gas">Gas</option>
                <option value="water">Water</option>
                <option value="broadband">Broadband</option>
                <option value="council_tax">Council tax</option>
                <option value="tv_licence">TV licence</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Supplier name" required error={errors.supplier_name?.message}>
              <input
                {...register("supplier_name")}
                type="text"
                placeholder="e.g. British Gas, Octopus Energy"
                className={inputCls(!!errors.supplier_name)}
              />
            </Field>

            <Field label="Account number" error={errors.account_number?.message}>
              <input
                {...register("account_number")}
                type="text"
                placeholder="Account or reference number"
                className={inputCls(!!errors.account_number)}
              />
            </Field>

            <Field label="Billing name" error={errors.billing_name?.message}>
              <input
                {...register("billing_name")}
                type="text"
                placeholder="Name on the account"
                className={inputCls(!!errors.billing_name)}
              />
            </Field>

          </div>
        </div>

        {/* ── Section: Login details ────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Online account</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Login URL" error={errors.login_url?.message}>
                <div className="relative">
                  <input
                    {...register("login_url")}
                    type="url"
                    placeholder="https://..."
                    className={inputCls(!!errors.login_url)}
                  />
                </div>
              </Field>
            </div>

            <Field label="Username / email" error={errors.username?.message}>
              <input
                {...register("username")}
                type="text"
                autoComplete="off"
                placeholder="Login username or email"
                className={inputCls(!!errors.username)}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={isEdit ? "Leave blank to keep current" : "Account password"}
                  className={cn(inputCls(!!errors.password), "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
              {isEdit && credential?.password && (
                <p className="mt-1.5 text-xs text-stone-400">
                  A password is stored. Leave blank to keep it unchanged.
                </p>
              )}
            </Field>

          </div>

          <div className="mt-4 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-4 py-3">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <span className="font-medium text-stone-700 dark:text-stone-300">Stored securely.</span>{" "}
              Passwords are AES-256 encrypted before saving and never exposed in the database.
            </p>
          </div>
        </div>

        {/* ── Section: Notes ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <SectionTitle>Notes</SectionTitle>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Any additional notes about this account…"
            className={cn(inputCls(!!errors.notes), "resize-none")}
          />
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
              {isEdit ? "Save changes" : "Add utility"}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
