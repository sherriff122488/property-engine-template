import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/PageHeader"
import { OwnershipChart } from "@/components/properties/OwnershipChart"

export const metadata = { title: "Ownership Structure" }

export default async function OwnershipPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, entity_name, status")
    .order("entity_name")
    .order("name")

  type PropertyRow = { id: string; name: string; entity_name: string | null; status: string }
  // Group by entity_name
  const entityMap = new Map<string, PropertyRow[]>()
  for (const p of properties ?? []) {
    const key = p.entity_name ?? "Unknown"
    if (!entityMap.has(key)) entityMap.set(key, [])
    entityMap.get(key)!.push(p)
  }
  const entityEntries = Array.from(entityMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
  const totalCount = properties?.length ?? 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 px-8 py-6 border-b border-stone-100 dark:border-stone-700">
        <PageHeader
          title="Ownership Structure"
          description={`${totalCount} properties across ${entityEntries.length} entities`}
        />
      </div>

      <OwnershipChart entityEntries={entityEntries} />
    </div>
  )
}
