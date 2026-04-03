import { z } from "zod"

export const contactSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  company_name: z.string().optional().nullable(),
  category: z.enum([
    "tenant",
    "letting_agent",
    "builder",
    "plumber",
    "electrician",
    "handyman",
    "cleaner",
    "mortgage_broker",
    "solicitor",
    "accountant",
    "insurance_broker",
    "other",
  ]),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .email("Must be a valid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  whatsapp: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
