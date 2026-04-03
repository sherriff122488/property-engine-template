/**
 * Uploads PDFs from ~/Downloads to Supabase Storage (documents bucket)
 * then updates compliance_documents and file_records with the public URLs.
 *
 * Run: node scripts/upload-docs.mjs
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

const SUPABASE_URL = "https://gzysvcxtxxvfbsjkqhhe.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eXN2Y3h0eHh2ZmJzamtxaGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDM3NTYsImV4cCI6MjA5MDQ3OTc1Nn0.kZLntPi9huyTaNGVX_e1-COGS4XGKpDm0eZ5sK4OgcA"
const LV_DIR = join(process.env.HOME, "Downloads", "LANDLORD VISION FILES")
const BUCKET = "documents"

/** Recursively find a file by name under a root directory */
function findFile(root, filename) {
  for (const entry of readdirSync(root)) {
    const full = join(root, entry)
    if (statSync(full).isDirectory()) {
      const found = findFile(full, filename)
      if (found) return found
    } else if (entry === filename) {
      return full
    }
  }
  return null
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── File manifest ──────────────────────────────────────────────────────────
// Each entry: { file, table, match, field, notes }
// match: SQL WHERE clause values to find the right row
// field: which column to update with the URL
const FILES = [

  // ── Compliance docs ──────────────────────────────────────────────────────

  // Gas Safety Certificates
  { file: "Gas Safety Certificate - Aigburth Drive.pdf",
    table: "compliance_documents", type: "gas_safety_certificate",
    property: "Flat 8, 36 Aigburth Drive", expiry: "2026-10-12" },

  { file: "Gas Safety Certificate - Back Falkner 7.pdf",
    table: "compliance_documents", type: "gas_safety_certificate",
    property: "7 Back Falkner Street South", expiry: "2026-03-25" },

  { file: "Gas Safety Certificate - Back Falkner 5.pdf",
    table: "compliance_documents", type: "gas_safety_certificate",
    property: "5 Back Falkner Street South", expiry: "2026-03-25" },

  { file: "Gas Safety Certificate  - Basement 15 Croxteth Road.pdf",
    table: "compliance_documents", type: "gas_safety_certificate",
    property: "Basement Flat, 15 Croxteth Road", expiry: "2026-03-28" },

  // EPCs
  { file: "EPC - Sessile Close.pdf",
    table: "compliance_documents", type: "epc",
    property: "44 Sessile Close", expiry: "2030-11-16" },

  { file: "EPC - Sir Thomas 11.12.pdf",
    table: "compliance_documents", type: "epc",
    property: "Apartment 12, 11 Sir Thomas Street", expiry: "2030-08-16" },

  { file: "EPC - flat 1.pdf",
    table: "compliance_documents", type: "epc",
    property: "17 Croxteth Road", expiry: "2034-01-21" },

  { file: "EPC - flat 2.pdf",
    table: "compliance_documents", type: "epc",
    property: "17 Croxteth Road", expiry: "2030-07-29" },

  { file: "EPC - flat 4.pdf",
    table: "compliance_documents", type: "epc",
    property: "17 Croxteth Road", expiry: "2031-06-27" },

  { file: "EPC - flat 5.pdf",
    table: "compliance_documents", type: "epc",
    property: "17 Croxteth Road", expiry: "2032-06-19" },

  { file: "EPC - flat 6.pdf",
    table: "compliance_documents", type: "epc",
    property: "17 Croxteth Road", expiry: "2028-11-11" },

  { file: "EPC - Back Falkner 7.pdf",
    table: "compliance_documents", type: "epc",
    property: "7 Back Falkner Street South", expiry: "2028-10-30" },

  { file: "EPC - Bands 4.pdf",
    table: "compliance_documents", type: "epc",
    property: "Apartment 4, 8 Vernon Street", expiry: "2027-02-05" },

  { file: "EPC - Cornhill 24.6.pdf",
    table: "compliance_documents", type: "epc",
    property: "Apartment 6, 24 Cornhill", expiry: "2029-08-19" },

  { file: "EPC - Cornhill 31.4.pdf",
    table: "compliance_documents", type: "epc",
    property: "Apartment 4, 31 Cornhill", expiry: "2034-09-25" },

  { file: "EPC - Basement 15 Croxteth Road.pdf",
    table: "compliance_documents", type: "epc",
    property: "Basement Flat, 15 Croxteth Road", expiry: "2033-02-20" },

  { file: "EPC - Aigburth.pdf",
    table: "compliance_documents", type: "epc",
    property: "Flat 8, 36 Aigburth Drive", expiry: "2032-01-03" },

  { file: "EPC - 174 Ellerman Road.pdf",
    table: "compliance_documents", type: "epc",
    property: "174 Ellerman Road", expiry: "2028-10-28" },

  { file: "EPC - Back Falkner 5.pdf",
    table: "compliance_documents", type: "epc",
    property: "5 Back Falkner Street South", expiry: "2028-05-08" },

  { file: "EPC - 25 Bennison Drive.pdf",
    table: "compliance_documents", type: "epc",
    property: "25 Bennison Drive", expiry: "2028-11-15" },

  // EICRs
  { file: "EICR - flat 4.pdf",
    table: "compliance_documents", type: "eicr",
    property: "17 Croxteth Road", expiry: "2029-01-09" },

  { file: "EICR - flat 5.pdf",
    table: "compliance_documents", type: "eicr",
    property: "17 Croxteth Road", expiry: "2029-01-02" },

  { file: "EICR - flat 6.pdf",
    table: "compliance_documents", type: "eicr",
    property: "17 Croxteth Road", expiry: "2029-01-02" },

  { file: "EICR - Sessile Close.pdf",
    table: "compliance_documents", type: "eicr",
    property: "44 Sessile Close", expiry: "2030-09-08" },

  { file: "EICR - Sir Thomas 11.12.pdf",
    table: "compliance_documents", type: "eicr",
    property: "Apartment 12, 11 Sir Thomas Street", expiry: "2030-10-24" },

  { file: "Back Falkner 7 - EICR.pdf",
    table: "compliance_documents", type: "eicr",
    property: "7 Back Falkner Street South", expiry: "2028-08-08" },

  // Fire Risk Assessment
  { file: "25 Bennison Road, Aigburth, Liverpool - Fire Risk Assessment 08.05.25 .pdf",
    table: "compliance_documents", type: "other",
    property: "25 Bennison Drive", expiry: "2026-05-08" },

  // Emergency Lighting
  { file: "Emergency Lighting Service - 25 Bennison Drive - L19 0NS.pdf",
    table: "compliance_documents", type: "emergency_lighting_certificate",
    property: "25 Bennison Drive", expiry: "2026-05-23" },

  // Insurance
  { file: "Schedule - Property Owners Policy from RSA (2).pdf",
    table: "compliance_documents", type: "insurance_schedule",
    property: "25 Bennison Drive", expiry: "2026-10-08" },

  // ── File records ─────────────────────────────────────────────────────────

  { file: "Sir Thomas 11.12 Mortgage Statement.pdf",
    table: "file_records",
    property: "Apartment 12, 11 Sir Thomas Street",
    fileName: "Sir Thomas Street Mortgage Statement",
    category: "mortgage_offer" },

  { file: "Rental Agreement for 174 Ellerman Road L3 4FE - Ref 1245244-637737821160842825.pdf",
    table: "file_records",
    property: "174 Ellerman Road",
    fileName: "174 Ellerman Road Tenancy Agreement",
    category: "lease" },

  { file: "Flat 2, Croxteth Rd Mortgage Statement.pdf",
    table: "file_records",
    property: "17 Croxteth Road",
    fileName: "17 Croxteth Road – Flat 2 Mortgage Statement",
    category: "mortgage_offer" },

  { file: "Flat 4 Mortgage Offer.pdf",
    table: "file_records",
    property: "17 Croxteth Road",
    fileName: "17 Croxteth Road – Flat 4 Mortgage Offer",
    category: "mortgage_offer" },

  { file: "Flat 5 Mortgage Offer.pdf",
    table: "file_records",
    property: "17 Croxteth Road",
    fileName: "17 Croxteth Road – Flat 5 Mortgage Offer",
    category: "mortgage_offer" },

  { file: "Bands 4 Mortgage Statement.pdf",
    table: "file_records",
    property: "Apartment 4, 8 Vernon Street",
    fileName: "8 Vernon Street – Mortgage Statement",
    category: "mortgage_offer" },

  { file: "Back Falkner 5 Mortgage Statement.pdf",
    table: "file_records",
    property: "5 Back Falkner Street South",
    fileName: "5 Back Falkner Street South – Mortgage Statement",
    category: "mortgage_offer" },

  { file: "174 Ellerman Rd Mortgage Statement.pdf",
    table: "file_records",
    property: "174 Ellerman Road",
    fileName: "174 Ellerman Road – Mortgage Statement",
    category: "mortgage_offer" },

  { file: "25 Bennison Drive Mortgage Statement.pdf",
    table: "file_records",
    property: "25 Bennison Drive",
    fileName: "25 Bennison Drive – Mortgage Statement",
    category: "mortgage_offer" },

  { file: "Back Falkner 7 Mortgage Statement.pdf",
    table: "file_records",
    property: "7 Back Falkner Street South",
    fileName: "7 Back Falkner Street South – Mortgage Statement",
    category: "mortgage_offer" },

  { file: "Aigburth Drive Mortgage Offer.pdf",
    table: "file_records",
    property: "Flat 8, 36 Aigburth Drive",
    fileName: "Flat 8, 36 Aigburth Drive – Mortgage Offer",
    category: "mortgage_offer" },

  { file: "Basement Flat 15 Croxteth AST Tenancy Agreement.pdf",
    table: "file_records",
    property: "Basement Flat, 15 Croxteth Road",
    fileName: "Basement Flat 15 Croxteth Road – AST Tenancy Agreement",
    category: "lease" },
]

// ── Property ID map (hardcoded to bypass RLS on anon key) ─────────────────
const PROPERTY_IDS = {
  "17 Croxteth Road":                 "63931789-4982-4b5a-8325-a4490bd62d53",
  "174 Ellerman Road":                "a94c029a-6a58-4059-a6b7-56cb73486c49",
  "25 Bennison Drive":                "e4970449-1427-476f-9059-73e8de830622",
  "44 Sessile Close":                 "36642841-2b51-4641-a4ea-3d34a544525c",
  "5 Back Falkner Street South":      "8beb14dd-83b2-45d4-8baa-4168658006d8",
  "7 Back Falkner Street South":      "1ec1fe68-5a13-462a-9f7f-7902695265b8",
  "Apartment 12, 11 Sir Thomas Street": "76bc1612-9fdd-4bf5-abb5-f6c335f28d02",
  "Apartment 4, 31 Cornhill":         "70dc1fc2-775d-491a-b34b-9f78cdbd9c24",
  "Apartment 4, 8 Vernon Street":     "ce46ab56-a88a-4930-953c-163fae569f77",
  "Apartment 6, 24 Cornhill":         "f4132ffc-1a47-4209-b421-48b4956f4a94",
  "Basement Flat, 15 Croxteth Road":  "29554440-5fba-439f-bc53-cfdccdef31a3",
  "Flat 8, 36 Aigburth Drive":        "7e391211-1af7-4f43-983d-6344167505bd",
}

// ── Upload + update ────────────────────────────────────────────────────────

async function run() {
  let uploaded = 0, skipped = 0, failed = 0

  for (const entry of FILES) {
    const localPath = findFile(LV_DIR, entry.file)

    if (!localPath) {
      console.log(`⏭  SKIP (not found): ${entry.file}`)
      skipped++
      continue
    }

    const propertyId = PROPERTY_IDS[entry.property]
    if (!propertyId) {
      console.log(`❌ FAIL (no property '${entry.property}'): ${entry.file}`)
      failed++
      continue
    }

    // Upload to storage
    const storagePath = `${propertyId}/${entry.file}`
    const fileBuffer = readFileSync(localPath)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      console.log(`❌ UPLOAD ERROR: ${entry.file} — ${uploadError.message}`)
      failed++
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    // Update the database
    if (entry.table === "compliance_documents") {
      const { error } = await supabase
        .from("compliance_documents")
        .update({ file_url: publicUrl })
        .eq("property_id", propertyId)
        .eq("document_type", entry.type)
        .eq("expiry_date", entry.expiry)

      if (error) {
        console.log(`❌ DB UPDATE ERROR: ${entry.file} — ${error.message}`)
        failed++
        continue
      }
    } else if (entry.table === "file_records") {
      const { error } = await supabase
        .from("file_records")
        .insert({
          property_id: propertyId,
          file_name: entry.fileName,
          category: entry.category,
          file_url: publicUrl,
        })

      if (error) {
        console.log(`❌ DB INSERT ERROR: ${entry.file} — ${error.message}`)
        failed++
        continue
      }
    }

    console.log(`✅ ${entry.file}`)
    uploaded++
  }

  console.log(`\nDone — ${uploaded} uploaded, ${skipped} skipped (not downloaded yet), ${failed} failed`)
}

run().catch(console.error)
