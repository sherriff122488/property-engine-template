import { cn } from "@/lib/utils"
import type { UtilityType } from "@/lib/types/database.types"

const typeConfig: Record<UtilityType, { label: string; className: string }> = {
  electric:    { label: "Electric",    className: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-yellow-200 dark:ring-yellow-700" },
  gas:         { label: "Gas",         className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-700" },
  water:       { label: "Water",       className: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 ring-cyan-200 dark:ring-cyan-700" },
  broadband:   { label: "Broadband",   className: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-violet-200 dark:ring-violet-700" },
  council_tax: { label: "Council tax", className: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-700" },
  tv_licence:  { label: "TV licence",  className: "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 ring-stone-200 dark:ring-stone-600" },
  other:       { label: "Other",       className: "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 ring-stone-200 dark:ring-stone-600" },
}

export function UtilityTypeBadge({
  type,
  className,
}: {
  type: UtilityType
  className?: string
}) {
  const config = typeConfig[type] ?? typeConfig.other
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function utilityTypeLabel(type: UtilityType): string {
  return typeConfig[type]?.label ?? "Other"
}
