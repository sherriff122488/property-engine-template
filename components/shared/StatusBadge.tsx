import { cn } from '@/lib/utils'
import type { PropertyStatus } from '@/lib/types/database.types'

const statusConfig: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  owned:        { label: 'Owned',        className: 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 ring-stone-200 dark:ring-stone-600' },
  under_refurb: { label: 'Under refurb', className: 'bg-amber-50  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400  ring-amber-200  dark:ring-amber-700' },
  let:          { label: 'Let',          className: 'bg-green-50  dark:bg-green-900/30  text-green-700  dark:text-green-400  ring-green-200  dark:ring-green-700' },
  vacant:       { label: 'Vacant',       className: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-700' },
  airbnb:       { label: 'Airbnb',       className: 'bg-[#FFF1F3] dark:bg-[#FF385C]/10 text-[#FF385C] ring-[#FFB3BF] dark:ring-[#FF385C]/30' },
  sale_agreed:  { label: 'Sale agreed',  className: 'bg-blue-50   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400   ring-blue-200   dark:ring-blue-700' },
  sold:         { label: 'Sold',         className: 'bg-stone-100 dark:bg-stone-700 text-stone-500  dark:text-stone-400  ring-stone-200  dark:ring-stone-600' },
}

interface StatusBadgeProps {
  status: PropertyStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
