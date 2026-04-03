import { cn } from "@/lib/utils"
import type { ContactCategory } from "@/lib/types/database.types"

const labels: Record<ContactCategory, string> = {
  tenant: "Tenant",
  letting_agent: "Letting agent",
  builder: "Builder",
  plumber: "Plumber",
  electrician: "Electrician",
  handyman: "Handyman",
  cleaner: "Cleaner",
  mortgage_broker: "Mortgage Lender",
  solicitor: "Solicitor",
  accountant: "Accountant",
  insurance_broker: "Insurance broker",
  other: "Other",
}

const styles: Record<ContactCategory, string> = {
  tenant: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
  letting_agent: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700",
  builder: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  plumber: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700",
  electrician: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  handyman: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700",
  cleaner: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700",
  mortgage_broker: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  solicitor: "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600",
  accountant: "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600",
  insurance_broker: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700",
  other: "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-600",
}

export function ContactCategoryBadge({ category }: { category: ContactCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[category]
      )}
    >
      {labels[category]}
    </span>
  )
}
