import { createClient } from "@/lib/supabase/server"
import { Star } from "lucide-react"
import { PropertyReviewCard, type PropertyReviewData } from "@/components/reviews/PropertyReviewCard"

export const metadata = { title: "Reviews" }

type DBRow = PropertyReviewData & {
  properties: { id: string; name: string } | null
}

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("property_reviews")
    .select(`id, platform, listing_url, overall_score, total_reviews, category_scores, raw_reviews, synthesis, last_fetched_at, properties ( id, name )`)
    .order("last_fetched_at", { ascending: false })

  if (error) console.error("ReviewsPage fetch error:", error)

  const rows = (data ?? []) as unknown as DBRow[]

  // Group by property
  const byProperty = rows.reduce<Record<string, { name: string; rows: PropertyReviewData[] }>>((acc, row) => {
    const propId = row.properties?.id ?? "unknown"
    if (!acc[propId]) acc[propId] = { name: row.properties?.name ?? "Unknown property", rows: [] }
    acc[propId].rows.push(row)
    return acc
  }, {})

  const propertyCount = Object.keys(byProperty).length
  const totalReviews = rows.reduce((sum, r) => sum + (r.total_reviews ?? 0), 0)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-stone-200 dark:border-stone-700">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Reviews</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {propertyCount} {propertyCount === 1 ? "property" : "properties"} · {totalReviews} reviews across Airbnb &amp; Booking.com
        </p>
      </div>

      {/* List */}
      <div className="flex-1 px-8 py-6 space-y-3">
        {Object.entries(byProperty).map(([propId, { name, rows: propRows }]) => (
          <PropertyReviewCard
            key={propId}
            propertyId={propId}
            propertyName={name}
            rows={propRows}
          />
        ))}

        {propertyCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Star className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">No reviews yet</h3>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
              Run <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">node scripts/fetch-reviews.mjs</code> to import reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
