import { cn } from "@/lib/utils"
import type { ComplianceDocType } from "@/lib/types/database.types"

export const docTypeLabels: Record<ComplianceDocType, string> = {
  epc: "EPC",
  gas_safety_certificate: "Gas Safety",
  eicr: "EICR",
  pat_testing: "PAT Testing",
  fire_alarm_certificate: "Fire Alarm",
  emergency_lighting_certificate: "Emergency Lighting",
  legionella: "Legionella",
  hmo_licence: "HMO Licence",
  insurance_schedule: "Insurance",
  fire_risk_assessment: "Fire Risk Assessment",
  other: "Other",
}

const styles: Record<ComplianceDocType, string> = {
  epc: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700",
  gas_safety_certificate: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700",
  eicr: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  pat_testing: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  fire_alarm_certificate: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700",
  emergency_lighting_certificate: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  legionella: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700",
  hmo_licence: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700",
  insurance_schedule: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700",
  fire_risk_assessment: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700",
  other: "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-600",
}

export function ComplianceDocTypeBadge({ type }: { type: ComplianceDocType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[type]
      )}
    >
      {docTypeLabels[type]}
    </span>
  )
}
