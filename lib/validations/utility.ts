import { z } from "zod"

export const utilitySchema = z.object({
  property_id: z.string().min(1, "Property is required"),
  utility_type: z.enum(
    ["electric", "gas", "water", "broadband", "council_tax", "tv_licence", "other"],
    { required_error: "Utility type is required" }
  ),
  supplier_name: z.string().min(1, "Supplier name is required"),
  account_number: z.string().optional().nullable(),
  login_url: z.string().optional().nullable(),
  billing_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Credential fields — handled server-side
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(), // plaintext; encrypted before storage
})

export type UtilityFormValues = z.infer<typeof utilitySchema>
