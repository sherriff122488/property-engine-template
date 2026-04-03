import { z } from "zod"

export const mortgageSchema = z.object({
  property_id: z.string().min(1, "Property is required"),
  lender_name: z.string().min(1, "Lender name is required"),
  product_name: z.string().optional().nullable(),
  fixed_start_date: z.string().optional().nullable(),
  fixed_end_date: z.string().optional().nullable(),
  monthly_payment: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
  interest_rate: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more")
    .max(100, "Must be 100 or less")
    .optional()
    .nullable(),
  loan_balance: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
  term_months: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(1, "Must be at least 1 month")
    .optional()
    .nullable(),
  review_date: z.string().optional().nullable(),
  broker_name: z.string().optional().nullable(),
  broker_email: z.string().email("Must be a valid email").optional().nullable().or(z.literal("")),
  broker_phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type MortgageFormValues = z.infer<typeof mortgageSchema>
