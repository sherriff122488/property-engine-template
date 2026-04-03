"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  MapPin,
  Building2,
  User,
  FileText,
  ExternalLink,
  Landmark,
  Zap,
  Users,
  ShieldCheck,
  FolderOpen,
  Phone,
  Mail,
  Unlink,
  Loader2,
} from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ExpiryBadge } from "@/components/shared/ExpiryBadge"
import { UtilityTypeBadge } from "@/components/utilities/UtilityTypeBadge"
import { ContactCategoryBadge } from "@/components/contacts/ContactCategoryBadge"
import { ComplianceDocTypeBadge } from "@/components/compliance/ComplianceDocTypeBadge"
import { FileCategoryBadge } from "@/components/files/FileCategoryBadge"
import { unlinkContactFromProperty } from "@/lib/actions/contacts"
import type {
  Property,
  UtilityType,
  ContactCategory,
  ComplianceDocType,
  FileCategory,
} from "@/lib/types/database.types"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

type UtilitySummary = {
  id: string
  utility_type: UtilityType
  supplier_name: string
  account_number: string | null
  login_url: string | null
}

type ContactSummary = {
  id: string
  full_name: string
  company_name: string | null
  category: ContactCategory
  phone: string | null
  email: string | null
}

type ComplianceSummary = {
  id: string
  document_type: ComplianceDocType
  issue_date: string | null
  expiry_date: string | null
  file_url: string | null
}

type FileSummary = {
  id: string
  file_name: string
  category: FileCategory
  file_url: string | null
  description: string | null
}

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

const TABS = [
  { id: "overview",    label: "Overview",    icon: Building2 },
  { id: "mortgages",   label: "Mortgages",   icon: Landmark },
  { id: "utilities",   label: "Utilities",   icon: Zap },
  { id: "contacts",    label: "Contacts",    icon: Users },
  { id: "compliance",  label: "Compliance",  icon: ShieldCheck },
  { id: "files",       label: "Files",       icon: FolderOpen },
] as const

type TabId = (typeof TABS)[number]["id"]

// ── Detail row ─────────────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-stone-100 dark:border-stone-700 last:border-0">
      <dt className="w-44 flex-shrink-0 text-sm text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="flex-1 text-sm text-stone-900 dark:text-stone-100">{value || "—"}</dd>
    </div>
  )
}

// ── Placeholder tab ────────────────────────────────────────────────────────
function PlaceholderTab({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700 mb-4">
        <Icon className="h-5 w-5 text-stone-400 dark:text-stone-500" />
      </div>
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No {label.toLowerCase()} yet</p>
      <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
        {label} will appear here once added.
      </p>
    </div>
  )
}

// ── Tenure label ───────────────────────────────────────────────────────────
const tenureLabels: Record<string, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  share_of_freehold: "Share of freehold",
  other: "Other",
}

const typeLabels: Record<string, string> = {
  house: "House",
  flat: "Flat",
  hmo: "HMO",
  mufb: "MUFB",
  commercial: "Commercial",
  other: "Other",
}

// ── Contacts tab ───────────────────────────────────────────────────────────
function ContactsTab({
  contacts,
  propertyId,
}: {
  contacts: ContactSummary[]
  propertyId: string
}) {
  const [pending, startTransition] = useTransition()
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)

  function handleUnlink(contactId: string) {
    if (!window.confirm("Remove this contact from the property?")) return
    setUnlinkingId(contactId)
    startTransition(async () => {
      await unlinkContactFromProperty(contactId, propertyId)
      setUnlinkingId(null)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </p>
        <Link
          href={`/contacts/new?property_id=${propertyId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 dark:bg-stone-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
        >
          + Add contact
        </Link>
      </div>
      {contacts.length === 0 ? (
        <PlaceholderTab icon={Users} label="Contacts" />
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/contacts/${c.id}/edit`}
                      className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:underline"
                    >
                      {c.full_name}
                    </Link>
                    <ContactCategoryBadge category={c.category} />
                  </div>
                  {c.company_name && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{c.company_name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </a>
                )}
                <button
                  onClick={() => handleUnlink(c.id)}
                  disabled={pending && unlinkingId === c.id}
                  className="inline-flex items-center gap-1 text-xs text-stone-300 dark:text-stone-600 hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Remove from property"
                >
                  {pending && unlinkingId === c.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Unlink className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function PropertyDetailTabs({
  property,
  mortgages = [],
  utilities = [],
  contacts = [],
  complianceDocs = [],
  files = [],
}: {
  property: Property
  mortgages?: MortgageSummary[]
  utilities?: UtilitySummary[]
  contacts?: ContactSummary[]
  complianceDocs?: ComplianceSummary[]
  files?: FileSummary[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  const fullAddress = [
    property.address_line_1,
    property.address_line_2,
    property.city,
    property.postcode,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-stone-200 dark:border-stone-700 px-4 pt-3 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              activeTab === id
                ? "border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100"
                : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">

        {/* ── Overview ────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <dl>
            <DetailRow
              label="Status"
              value={<StatusBadge status={property.status} />}
            />
            <DetailRow
              label="Property type"
              value={typeLabels[property.property_type] ?? property.property_type}
            />
            <DetailRow
              label="Tenure"
              value={property.tenure ? tenureLabels[property.tenure] : null}
            />
            <DetailRow
              label="Bedrooms"
              value={property.bedrooms != null ? String(property.bedrooms) : null}
            />
            <DetailRow
              label="Ownership entity"
              value={property.entity_name}
            />
            <DetailRow
              label="Address"
              value={
                <span className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-stone-400" />
                  {fullAddress}
                </span>
              }
            />
            <DetailRow
              label="Notes"
              value={
                property.notes ? (
                  <p className="whitespace-pre-wrap">{property.notes}</p>
                ) : null
              }
            />
            <DetailRow
              label="Photos (Drive)"
              value={
                property.google_drive_photos_url ? (
                  <a
                    href={property.google_drive_photos_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-300 underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                  >
                    Open Google Drive
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null
              }
            />
            {(() => {
              const totalDebt = mortgages.reduce((s, m) => s + (m.loan_balance ?? 0), 0)
              const ltv =
                property.current_value && property.current_value > 0
                  ? Math.round((totalDebt / property.current_value) * 100)
                  : null
              return (
                <>
                  <DetailRow
                    label="Current value"
                    value={
                      property.current_value != null
                        ? formatCurrency(property.current_value)
                        : null
                    }
                  />
                  {property.current_value != null && mortgages.length > 0 && (
                    <DetailRow
                      label="LTV"
                      value={
                        ltv !== null ? (
                          <span
                            className={
                              ltv > 75
                                ? "text-red-600 dark:text-red-400 font-medium"
                                : ltv > 65
                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                : "text-emerald-600 dark:text-emerald-400 font-medium"
                            }
                          >
                            {ltv}%{" "}
                            <span className="text-stone-400 dark:text-stone-500 font-normal text-xs">
                              ({formatCurrency(totalDebt)} debt)
                            </span>
                          </span>
                        ) : null
                      }
                    />
                  )}
                </>
              )
            })()}
            <DetailRow
              label="Added"
              value={formatDate(property.created_at)}
            />
            <DetailRow
              label="Last updated"
              value={formatDate(property.updated_at)}
            />
          </dl>
        )}

        {/* ── Mortgages ────────────────────────────────────────────── */}
        {activeTab === "mortgages" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {mortgages.length} mortgage{mortgages.length !== 1 ? "s" : ""}
              </p>
              <Link
                href={`/mortgages/new?property_id=${property.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 dark:bg-stone-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
              >
                + Add mortgage
              </Link>
            </div>
            {mortgages.length === 0 ? (
              <PlaceholderTab icon={Landmark} label="Mortgages" />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                {mortgages.map((m) => (
                  <Link
                    key={m.id}
                    href={`/mortgages/${m.id}/edit`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{m.lender_name}</p>
                      {m.product_name && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{m.product_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      {m.interest_rate != null && (
                        <span className="text-stone-600 dark:text-stone-400">{m.interest_rate}%</span>
                      )}
                      {m.monthly_payment != null && (
                        <span className="text-stone-600 dark:text-stone-400">{formatCurrency(m.monthly_payment)}/mo</span>
                      )}
                      {m.loan_balance != null && (
                        <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(m.loan_balance)}</span>
                      )}
                      <ExpiryBadge expiryDate={m.fixed_end_date} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Utilities ────────────────────────────────────────────── */}
        {activeTab === "utilities" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {utilities.length} utility account{utilities.length !== 1 ? "s" : ""}
              </p>
              <Link
                href={`/utilities/new?property_id=${property.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 dark:bg-stone-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
              >
                + Add utility
              </Link>
            </div>
            {utilities.length === 0 ? (
              <PlaceholderTab icon={Zap} label="Utilities" />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                {utilities.map((u) => (
                  <Link
                    key={u.id}
                    href={`/utilities/${u.id}/edit`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UtilityTypeBadge type={u.utility_type} />
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{u.supplier_name}</span>
                      {u.account_number && (
                        <span className="text-xs font-mono text-stone-400 dark:text-stone-500">{u.account_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {u.login_url && (
                        <a
                          href={u.login_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 transition-colors"
                        >
                          Login
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Contacts ─────────────────────────────────────────────── */}
        {activeTab === "contacts" && (
          <ContactsTab
            contacts={contacts}
            propertyId={property.id}
          />
        )}

        {/* ── Compliance ───────────────────────────────────────────── */}
        {activeTab === "compliance" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {complianceDocs.length} document{complianceDocs.length !== 1 ? "s" : ""}
              </p>
              <Link
                href={`/compliance/new?property_id=${property.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 dark:bg-stone-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
              >
                + Add document
              </Link>
            </div>
            {complianceDocs.length === 0 ? (
              <PlaceholderTab icon={ShieldCheck} label="Compliance documents" />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                {complianceDocs.map((c) => (
                  <Link
                    key={c.id}
                    href={`/compliance/${c.id}/edit`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <ComplianceDocTypeBadge type={c.document_type} />
                    <div className="flex items-center gap-6 text-sm">
                      {c.issue_date && (
                        <span className="text-stone-500 dark:text-stone-400 text-xs">
                          Issued {formatDate(c.issue_date)}
                        </span>
                      )}
                      <ExpiryBadge expiryDate={c.expiry_date} />
                      {c.file_url && (
                        <a
                          href={c.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 transition-colors"
                        >
                          View file
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Files ────────────────────────────────────────────────── */}
        {activeTab === "files" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
              <Link
                href={`/files/new?property_id=${property.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 dark:bg-stone-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
              >
                + Add file
              </Link>
            </div>
            {files.length === 0 ? (
              <PlaceholderTab icon={FolderOpen} label="Files" />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                {files.map((f) => (
                  <Link
                    key={f.id}
                    href={`/files/${f.id}/edit`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileCategoryBadge category={f.category} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {f.file_name}
                        </p>
                        {f.description && (
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
                            {f.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {f.file_url && (
                      <a
                        href={f.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-4 flex-shrink-0 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 transition-colors"
                      >
                        Open
                      </a>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
