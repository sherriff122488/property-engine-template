import { cn } from "@/lib/utils"
import type { FileCategory } from "@/lib/types/database.types"

export const categoryLabels: Record<FileCategory, string> = {
  legal: "Legal",
  tenancy: "Tenancy",
  mortgage_offer: "Mortgage offer",
  insurance: "Insurance",
  refurb: "Refurb",
  manuals: "Manuals",
  photos: "Photos",
  miscellaneous: "Misc",
}

const styles: Record<FileCategory, string> = {
  legal: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700",
  tenancy: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
  mortgage_offer: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  insurance: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700",
  refurb: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  manuals: "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600",
  photos: "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-700",
  miscellaneous: "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-600",
}

export function FileCategoryBadge({ category }: { category: FileCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[category]
      )}
    >
      {categoryLabels[category]}
    </span>
  )
}
