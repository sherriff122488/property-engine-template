import { z } from "zod"

export const fileRecordSchema = z.object({
  property_id: z.string().min(1, "Property is required"),
  file_name: z.string().min(1, "File name is required"),
  category: z.enum([
    "legal",
    "tenancy",
    "mortgage_offer",
    "insurance",
    "refurb",
    "manuals",
    "photos",
    "miscellaneous",
  ]),
  file_url: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
})

export type FileRecordFormValues = z.infer<typeof fileRecordSchema>
