-- ============================================================
-- Joe's Property Engine — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- or via the Supabase CLI: supabase db push
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid(), pgp_sym_encrypt
create extension if not exists "pg_trgm";    -- trigram indexes for search


-- ============================================================
-- ENUMS
-- ============================================================

create type property_status as enum (
  'owned',
  'under_refurb',
  'let',
  'vacant',
  'sale_agreed',
  'sold'
);

create type property_type as enum (
  'house',
  'flat',
  'hmo',
  'mufb',
  'commercial',
  'other'
);

create type tenure_type as enum (
  'freehold',
  'leasehold',
  'share_of_freehold',
  'other'
);

create type utility_type as enum (
  'electric',
  'gas',
  'water',
  'broadband',
  'council_tax',
  'tv_licence',
  'other'
);

create type contact_category as enum (
  'tenant',
  'letting_agent',
  'builder',
  'plumber',
  'electrician',
  'handyman',
  'cleaner',
  'mortgage_broker',
  'solicitor',
  'accountant',
  'insurance_broker',
  'other'
);

create type compliance_doc_type as enum (
  'epc',
  'gas_safety_certificate',
  'eicr',
  'pat_testing',
  'fire_alarm_certificate',
  'emergency_lighting_certificate',
  'legionella',
  'hmo_licence',
  'insurance_schedule',
  'other'
);

create type file_category as enum (
  'legal',
  'lease',
  'mortgage_offer',
  'insurance',
  'refurb',
  'manuals',
  'photos',
  'miscellaneous'
);


-- ============================================================
-- SHARED: updated_at TRIGGER FUNCTION
-- ============================================================

create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- TABLE: properties
-- ============================================================

create table properties (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  address_line_1        text not null,
  address_line_2        text,
  city                  text not null,
  postcode              text not null,
  bedrooms              smallint check (bedrooms >= 0),
  property_type         property_type not null,
  entity_name           text,                          -- e.g. "Davies Properties Ltd"
  tenure                tenure_type,
  status                property_status not null default 'owned',
  notes                 text,
  google_drive_photos_url text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger properties_updated_at
  before update on properties
  for each row execute function handle_updated_at();

-- indexes
create index idx_properties_status       on properties (status);
create index idx_properties_entity_name  on properties (entity_name);
create index idx_properties_postcode     on properties (postcode);

-- trigram search index (enables fast ILIKE search on name + address)
create index idx_properties_name_trgm    on properties using gin (name gin_trgm_ops);
create index idx_properties_address_trgm on properties using gin (address_line_1 gin_trgm_ops);


-- ============================================================
-- TABLE: mortgages
-- ============================================================

create table mortgages (
  id                uuid primary key default gen_random_uuid(),
  property_id       uuid not null references properties (id) on delete cascade,
  lender_name       text not null,
  product_name      text,
  fixed_start_date  date,
  fixed_end_date    date,
  monthly_payment   numeric(10, 2) check (monthly_payment >= 0),
  interest_rate     numeric(5, 2) check (interest_rate >= 0),  -- stored as 4.25 for 4.25%
  loan_balance      numeric(12, 2) check (loan_balance >= 0),
  term_months       smallint check (term_months > 0),           -- e.g. 300 for 25 years
  review_date       date,
  broker_name       text,
  broker_email      text,
  broker_phone      text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint mortgages_dates_check
    check (fixed_end_date is null or fixed_start_date is null or fixed_end_date >= fixed_start_date)
);

create trigger mortgages_updated_at
  before update on mortgages
  for each row execute function handle_updated_at();

-- indexes
create index idx_mortgages_property_id    on mortgages (property_id);
create index idx_mortgages_fixed_end_date on mortgages (fixed_end_date);  -- dashboard: ending soon
create index idx_mortgages_review_date    on mortgages (review_date);


-- ============================================================
-- TABLE: utilities
-- ============================================================
-- Non-sensitive utility account info stored here.
-- Login credentials are stored separately in utility_credentials.

create table utilities (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties (id) on delete cascade,
  utility_type    utility_type not null,
  supplier_name   text not null,
  account_number  text,
  login_url       text,
  billing_name    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger utilities_updated_at
  before update on utilities
  for each row execute function handle_updated_at();

-- indexes
create index idx_utilities_property_id  on utilities (property_id);
create index idx_utilities_type         on utilities (utility_type);


-- ============================================================
-- TABLE: utility_credentials
-- ============================================================
-- Sensitive credentials kept in a separate table.
-- password_encrypted must be encrypted by the application before insert.
-- Use pgp_sym_encrypt(value, app_secret) / pgp_sym_decrypt(value, app_secret).
-- This table has its own strict RLS policy (authenticated only).
-- Never join or expose this table in public-facing queries.

create table utility_credentials (
  id                  uuid primary key default gen_random_uuid(),
  utility_id          uuid not null references utilities (id) on delete cascade unique,
  username            text,
  password_encrypted  text,   -- app-layer encrypted; never store plaintext here
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger utility_credentials_updated_at
  before update on utility_credentials
  for each row execute function handle_updated_at();


-- ============================================================
-- TABLE: contacts
-- ============================================================

create table contacts (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  company_name  text,
  category      contact_category not null,
  phone         text,
  email         text,
  whatsapp      text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger contacts_updated_at
  before update on contacts
  for each row execute function handle_updated_at();

-- indexes
create index idx_contacts_category      on contacts (category);
create index idx_contacts_email         on contacts (email);
create index idx_contacts_name_trgm     on contacts using gin (full_name gin_trgm_ops);


-- ============================================================
-- TABLE: property_contacts  (junction)
-- ============================================================

create table property_contacts (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid not null references properties (id) on delete cascade,
  contact_id       uuid not null references contacts (id) on delete cascade,
  relationship_notes text,                   -- optional free-text e.g. "current tenant, room 3"
  created_at       timestamptz not null default now(),

  constraint property_contacts_unique unique (property_id, contact_id)
);

-- indexes
create index idx_property_contacts_property on property_contacts (property_id);
create index idx_property_contacts_contact  on property_contacts (contact_id);


-- ============================================================
-- TABLE: compliance_documents
-- ============================================================

create table compliance_documents (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references properties (id) on delete cascade,
  document_type  compliance_doc_type not null,
  issue_date     date,
  expiry_date    date,
  file_url       text,                       -- Supabase Storage path or external URL
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint compliance_dates_check
    check (expiry_date is null or issue_date is null or expiry_date >= issue_date)
);

create trigger compliance_documents_updated_at
  before update on compliance_documents
  for each row execute function handle_updated_at();

-- indexes
create index idx_compliance_property_id  on compliance_documents (property_id);
create index idx_compliance_expiry_date  on compliance_documents (expiry_date);  -- dashboard: expiring soon
create index idx_compliance_doc_type     on compliance_documents (document_type);


-- ============================================================
-- TABLE: file_records
-- ============================================================

create table file_records (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references properties (id) on delete cascade,
  file_name    text not null,
  category     file_category not null,
  file_url     text,                          -- Supabase Storage path or external URL
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger file_records_updated_at
  before update on file_records
  for each row execute function handle_updated_at();

-- indexes
create index idx_file_records_property_id on file_records (property_id);
create index idx_file_records_category    on file_records (category);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- This is a single-user internal app. All tables are accessible
-- to any authenticated user. Adjust if you ever add multiple users
-- with different access levels.

alter table properties           enable row level security;
alter table mortgages            enable row level security;
alter table utilities            enable row level security;
alter table utility_credentials  enable row level security;
alter table contacts             enable row level security;
alter table property_contacts    enable row level security;
alter table compliance_documents enable row level security;
alter table file_records         enable row level security;

-- Properties
create policy "Authenticated full access"
  on properties for all
  to authenticated
  using (true)
  with check (true);

-- Mortgages
create policy "Authenticated full access"
  on mortgages for all
  to authenticated
  using (true)
  with check (true);

-- Utilities
create policy "Authenticated full access"
  on utilities for all
  to authenticated
  using (true)
  with check (true);

-- Utility credentials (same policy, but kept in its own table
-- so it can have independent policy tightened later if needed)
create policy "Authenticated full access"
  on utility_credentials for all
  to authenticated
  using (true)
  with check (true);

-- Contacts
create policy "Authenticated full access"
  on contacts for all
  to authenticated
  using (true)
  with check (true);

-- Property contacts
create policy "Authenticated full access"
  on property_contacts for all
  to authenticated
  using (true)
  with check (true);

-- Compliance documents
create policy "Authenticated full access"
  on compliance_documents for all
  to authenticated
  using (true)
  with check (true);

-- File records
create policy "Authenticated full access"
  on file_records for all
  to authenticated
  using (true)
  with check (true);


-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or CLI)
-- ============================================================
-- The SQL below is a reference — storage buckets are managed via
-- the Supabase Storage API, not raw SQL. Create these in the
-- Supabase Dashboard > Storage, or via the JS/CLI:
--
-- Bucket: "compliance-docs"   private: true
-- Bucket: "property-files"    private: true
--
-- Set the following bucket policy for both:
--   Allow authenticated users to upload/read/delete their own files.
-- ============================================================
