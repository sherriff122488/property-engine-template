import { z } from "zod"

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address_line_1: z.string().min(1, "Address line 1 is required"),
  address_line_2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  bedrooms: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
  property_type: z.enum(["house", "flat", "hmo", "mufb", "commercial", "other"], {
    required_error: "Property type is required",
  }),
  entity_name: z.string().optional().nullable(),
  tenure: z
    .enum(["freehold", "leasehold", "share_of_freehold", "other"])
    .optional()
    .nullable(),
  status: z.enum(["owned", "under_refurb", "let", "vacant", "airbnb", "sale_agreed", "sold"], {
    required_error: "Status is required",
  }),
  notes: z.string().optional().nullable(),
  google_drive_photos_url: z.string().optional().nullable(),
  current_value: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
  estimated_monthly_income: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),
})

export type PropertyFormValues = z.infer<typeof propertySchema>
