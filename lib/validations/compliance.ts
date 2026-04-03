import { z } from "zod"

export const complianceSchema = z.object({
  property_id: z.string().min(1, "Property is required"),
  document_type: z.enum([
    "epc",
    "gas_safety_certificate",
    "eicr",
    "pat_testing",
    "fire_alarm_certificate",
    "emergency_lighting_certificate",
    "legionella",
    "hmo_licence",
    "insurance_schedule",
    "fire_risk_assessment",
    "other",
  ]),
  issue_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  file_url: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
})

export type ComplianceFormValues = z.infer<typeof complianceSchema>
