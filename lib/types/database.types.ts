// ============================================================
// Database types — mirrors the Supabase schema exactly.
// After running schema.sql, you can regenerate this file via:
//   npx supabase gen types typescript --project-id <ref> > lib/types/database.types.ts
// ============================================================

// --- Enums ---------------------------------------------------

export type PropertyStatus =
  | 'owned'
  | 'under_refurb'
  | 'let'
  | 'vacant'
  | 'airbnb'
  | 'sale_agreed'
  | 'sold'

export type PropertyType =
  | 'house'
  | 'flat'
  | 'hmo'
  | 'mufb'
  | 'commercial'
  | 'other'

export type TenureType =
  | 'freehold'
  | 'leasehold'
  | 'share_of_freehold'
  | 'other'

export type UtilityType =
  | 'electric'
  | 'gas'
  | 'water'
  | 'broadband'
  | 'council_tax'
  | 'tv_licence'
  | 'other'

export type ContactCategory =
  | 'tenant'
  | 'letting_agent'
  | 'builder'
  | 'plumber'
  | 'electrician'
  | 'handyman'
  | 'cleaner'
  | 'mortgage_broker'
  | 'solicitor'
  | 'accountant'
  | 'insurance_broker'
  | 'other'

export type ComplianceDocType =
  | 'epc'
  | 'gas_safety_certificate'
  | 'eicr'
  | 'pat_testing'
  | 'fire_alarm_certificate'
  | 'emergency_lighting_certificate'
  | 'legionella'
  | 'hmo_licence'
  | 'insurance_schedule'
  | 'fire_risk_assessment'
  | 'other'

export type FileCategory =
  | 'legal'
  | 'tenancy'
  | 'mortgage_offer'
  | 'insurance'
  | 'refurb'
  | 'manuals'
  | 'photos'
  | 'miscellaneous'

// --- Row types -----------------------------------------------

export interface Property {
  id: string
  name: string
  address_line_1: string
  address_line_2: string | null
  city: string
  postcode: string
  bedrooms: number | null
  property_type: PropertyType
  entity_name: string | null
  tenure: TenureType | null
  status: PropertyStatus
  notes: string | null
  google_drive_photos_url: string | null
  current_value: number | null
  estimated_monthly_income: number | null
  created_at: string
  updated_at: string
}

export interface Mortgage {
  id: string
  property_id: string
  lender_name: string
  product_name: string | null
  fixed_start_date: string | null
  fixed_end_date: string | null
  monthly_payment: number | null
  interest_rate: number | null
  loan_balance: number | null
  term_months: number | null
  review_date: string | null
  broker_name: string | null
  broker_email: string | null
  broker_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Utility {
  id: string
  property_id: string
  utility_type: UtilityType
  supplier_name: string
  account_number: string | null
  login_url: string | null
  billing_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface UtilityCredential {
  id: string
  utility_id: string
  username: string | null
  password_encrypted: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  full_name: string
  company_name: string | null
  category: ContactCategory
  phone: string | null
  email: string | null
  whatsapp: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PropertyContact {
  id: string
  property_id: string
  contact_id: string
  relationship_notes: string | null
  created_at: string
}

export interface ComplianceDocument {
  id: string
  property_id: string
  document_type: ComplianceDocType
  issue_date: string | null
  expiry_date: string | null
  file_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FileRecord {
  id: string
  property_id: string
  file_name: string
  category: FileCategory
  file_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

// --- Supabase Database type (for typed client) ---------------

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>
      }
      mortgages: {
        Row: Mortgage
        Insert: Omit<Mortgage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Mortgage, 'id' | 'created_at' | 'updated_at'>>
      }
      utilities: {
        Row: Utility
        Insert: Omit<Utility, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Utility, 'id' | 'created_at' | 'updated_at'>>
      }
      utility_credentials: {
        Row: UtilityCredential
        Insert: Omit<UtilityCredential, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UtilityCredential, 'id' | 'created_at' | 'updated_at'>>
      }
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>
      }
      property_contacts: {
        Row: PropertyContact
        Insert: Omit<PropertyContact, 'id' | 'created_at'>
        Update: Partial<Omit<PropertyContact, 'id' | 'created_at'>>
      }
      compliance_documents: {
        Row: ComplianceDocument
        Insert: Omit<ComplianceDocument, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ComplianceDocument, 'id' | 'created_at' | 'updated_at'>>
      }
      file_records: {
        Row: FileRecord
        Insert: Omit<FileRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FileRecord, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Enums: {
      property_status: PropertyStatus
      property_type: PropertyType
      tenure_type: TenureType
      utility_type: UtilityType
      contact_category: ContactCategory
      compliance_doc_type: ComplianceDocType
      file_category: FileCategory
    }
  }
}
