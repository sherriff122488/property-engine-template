import { cn } from '@/lib/utils'
import { differenceInDays, parseISO } from 'date-fns'

type ExpiryVariant = 'expired' | 'critical' | 'warning' | 'valid' | 'none'

function getVariant(expiryDate: string | null): ExpiryVariant {
  if (!expiryDate) return 'none'

  const days = differenceInDays(parseISO(expiryDate), new Date())

  if (days < 0)  return 'expired'
  if (days <= 30) return 'critical'
  if (days <= 60) return 'warning'
  return 'valid'
}

function formatDays(days: number): string {
  const years = Math.floor(days / 365)
  const remainder = days % 365
  if (years > 0 && remainder > 0) return `${years}y ${remainder}d left`
  if (years > 0) return `${years}y left`
  return `${days}d left`
}

const variantConfig: Record<ExpiryVariant, { label: (days: number) => string; className: string }> = {
  expired:  {
    label: () => 'Expired',
    className: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-700',
  },
  critical: {
    label: (days) => formatDays(days),
    className: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-700',
  },
  warning:  {
    label: (days) => formatDays(days),
    className: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700',
  },
  valid:    {
    label: (days) => formatDays(days),
    className: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-700',
  },
  none:     {
    label: () => 'No expiry',
    className: 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 ring-stone-200 dark:ring-stone-600',
  },
}

interface ExpiryBadgeProps {
  expiryDate: string | null
  className?: string
}

export function ExpiryBadge({ expiryDate, className }: ExpiryBadgeProps) {
  const variant = getVariant(expiryDate)
  const config = variantConfig[variant]
  const days = expiryDate ? differenceInDays(parseISO(expiryDate), new Date()) : 0

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label(days)}
    </span>
  )
}
