# Property Engine — Setup Guide

A private property portfolio dashboard built with Next.js, Supabase, and Claude Code.

---

## What you'll need

- A [GitHub](https://github.com) account
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- [Node.js](https://nodejs.org) 18+ installed locally
- [Claude Code](https://claude.ai/code) installed (`npm install -g @anthropic/claude-code`)

---

## Step 1 — Fork this repo

1. Click **Fork** at the top right of this repo on GitHub
2. Give it a private name (e.g. `my-property-engine`)
3. Clone it to your machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/my-property-engine.git
   cd my-property-engine
   npm install
   ```

---

## Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `property-engine`) and a strong database password
3. Wait for the project to be ready (1–2 min)
4. Go to **Settings → API** and copy:
   - **Project URL** → you'll need this shortly
   - **anon / public key** → you'll need this shortly
   - **Project Ref** (the short code in the URL, e.g. `abcdefghijklmnop`) → needed for Claude Code

---

## Step 3 — Run the database schema

1. In your Supabase project go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo
3. Paste the entire contents and click **Run**

This creates all the tables, indexes, and RLS policies.

---

## Step 4 — Set up environment variables

Copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## Step 5 — Create your login account

In Supabase go to **Authentication → Users → Add user** and create your account with an email and password. This is what you'll use to sign in to the dashboard.

---

## Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

---

## Step 7 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. In **Environment Variables** add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

Your dashboard will be live at `https://your-project.vercel.app`.

---

## Step 8 — Connect Claude Code

Update `.mcp.json` with your Supabase project ref:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF"
    }
  }
}
```

Then open Claude Code in your project directory:

```bash
claude
```

Claude Code can now read and write your database, helping you add properties, update records, and extend the app.

---

## Step 9 — Populate your data

Once Claude Code is connected, paste this prompt to get started:

```
I've just set up my Property Engine dashboard. Please help me add my properties to the database.

For each property I'll give you: address, property type (house/flat/hmo/mufb), number of bedrooms, status (let/vacant/owned/under_refurb), and the entity name it's owned under.

Let's start — here are my properties:
[list your properties here]
```

Follow-up prompts for other data:

- **Mortgages:** "Add mortgages for my properties. For each: property, lender name, product name, fixed rate end date, monthly payment, interest rate, loan balance."
- **Compliance:** "Add compliance documents for my properties. I'll give you: property, document type (gas_safety_certificate/eicr/epc/hmo_licence), issue date, expiry date."
- **Contacts:** "Add my contacts — tenants, tradespeople, agents. For each: name, category, phone, email."
- **Tenants:** "Link tenants to their properties with start date, end date (if applicable), and monthly rent."

---

## Folder structure

```
app/                   Next.js pages (App Router)
  (auth)/login/        Login page
  (dashboard)/         All dashboard pages
components/            Reusable UI components
  deal-analyser/       Deal analysis calculator
  layout/              Sidebar + mobile header
lib/
  actions/             Server actions (DB writes)
  supabase/            Supabase client helpers
  utils/               Deal calculator logic
supabase/
  schema.sql           Full database schema
```

---

## Making changes with Claude Code

Claude Code is the primary way to extend and customise this app. Some examples:

- "Add a new page for tracking insurance policies"
- "Update the mortgage table to show days until the fixed rate ends"
- "Add a notes field to the property overview page"
- "Change the dashboard to show total monthly rent collected"

All your data stays in your own Supabase project. Claude Code only has access to the project ref you configure in `.mcp.json`.
