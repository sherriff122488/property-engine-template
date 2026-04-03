import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
          <Icon className="h-6 w-6 text-stone-400 dark:text-stone-500" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
