'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react'

export type Theme = {
  type: 'positive' | 'warning' | 'negative'
  title: string
  detail: string
}

export type ActionPoint = {
  priority: 'high' | 'medium' | 'low'
  text: string
}

export type Synthesis = {
  themes: Theme[]
  action_points: ActionPoint[]
}

export type RawReview = {
  reviewer: string
  date: string
  rating: number
  text: string
  country?: string
  negative?: boolean
}

export type PropertyReviewData = {
  id: string
  platform: 'airbnb' | 'booking_com'
  listing_url: string | null
  overall_score: number | null
  total_reviews: number | null
  category_scores: Record<string, number | null> | null
  raw_reviews: RawReview[] | null
  synthesis: Synthesis | null
  last_fetched_at: string | null
}

function ScoreBadge({ score, platform }: { score: number; platform: string }) {
  const normalised = platform === 'airbnb' ? score : score / 2
  const display = normalised.toFixed(1)
  const colour =
    normalised >= 4.5
      ? 'text-emerald-700 bg-emerald-50 ring-emerald-200'
      : normalised >= 4.0
      ? 'text-amber-700 bg-amber-50 ring-amber-200'
      : 'text-red-700 bg-red-50 ring-red-200'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colour}`}>
      <Star className="h-3 w-3 fill-current" />
      {display} / 5
    </span>
  )
}

function PlatformBadge({ platform, url }: { platform: string; url: string | null }) {
  const isAirbnb = platform === 'airbnb'
  const label = isAirbnb ? 'Airbnb' : 'Booking.com'
  const bg = isAirbnb ? '#FF385C' : '#003580'
  const letter = isAirbnb ? 'A' : 'B'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: bg }}
    >
      <span className="font-bold">{letter}</span> {label}
    </span>
  )
}

function ThemeIcon({ type }: { type: Theme['type'] }) {
  if (type === 'positive') return <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
  if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
  return <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
}

function PriorityDot({ priority }: { priority: ActionPoint['priority'] }) {
  const colour = priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-400' : 'bg-stone-300'
  return <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${colour}`} />
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-[#CF7454] text-[#CF7454]' : 'text-stone-200 fill-stone-200'}`} />
      ))}
    </div>
  )
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never updated'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  if (days < 7) return `Updated ${days} days ago`
  if (days < 30) return `Updated ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return `Updated ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
}

export function PropertyReviewCard({
  propertyId,
  propertyName,
  rows,
}: {
  propertyId: string
  propertyName: string
  rows: PropertyReviewData[]
}) {
  const [open, setOpen] = useState(false)

  const airbnbRow = rows.find(r => r.platform === 'airbnb')
  const bookingRow = rows.find(r => r.platform === 'booking_com')
  const lastFetched = rows.map(r => r.last_fetched_at).filter(Boolean).sort().pop() ?? null
  const isStale = lastFetched ? (Date.now() - new Date(lastFetched).getTime()) > 7 * 86400000 : true

  const synthRaw = airbnbRow?.synthesis ?? bookingRow?.synthesis ?? null
  const synthesis: Synthesis | null = synthRaw
    ? (typeof synthRaw === 'string' ? JSON.parse(synthRaw) : synthRaw)
    : null

  const positives = synthesis?.themes?.filter(t => t.type === 'positive') ?? []
  const warnings = synthesis?.themes?.filter(t => t.type !== 'positive') ?? []
  const highActions = synthesis?.action_points?.filter(a => a.priority === 'high') ?? []
  const totalReviews = rows.reduce((s, r) => s + (r.total_reviews ?? 0), 0)

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">

      {/* ── Always-visible summary row ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
      >
        {/* Chevron */}
        <span className="flex-shrink-0 text-stone-400 dark:text-stone-500">
          {open
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />}
        </span>

        {/* Property name */}
        <span className="font-semibold text-stone-900 dark:text-stone-100 flex-1 min-w-0 truncate">{propertyName}</span>

        {/* Scores */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {airbnbRow?.overall_score != null && (
            <ScoreBadge score={airbnbRow.overall_score} platform="airbnb" />
          )}
          {bookingRow?.overall_score != null && (
            <ScoreBadge score={bookingRow.overall_score} platform="booking_com" />
          )}
        </div>

        {/* Review count */}
        <span className="text-xs text-stone-400 dark:text-stone-500 flex-shrink-0 w-24 text-right">
          {totalReviews} reviews
        </span>

        {/* Last updated */}
        <span className={`flex-shrink-0 text-xs ${isStale ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`}>
          {timeAgo(lastFetched)}
        </span>

        {/* High-priority action pill */}
        {highActions.length > 0 && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-700">
            {highActions.length} action{highActions.length > 1 ? 's' : ''}
          </span>
        )}
      </button>

      {/* ── Expanded content ── */}
      {open && (
        <div className="border-t border-stone-200 dark:border-stone-700">
          <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Left — synthesis */}
            {synthesis && (
              <div className="xl:col-span-1 space-y-4">

                {/* What guests love */}
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">What guests love</h3>
                  <ul className="space-y-2.5">
                    {positives.map((t, i) => (
                      <li key={i} className="flex gap-2.5">
                        <ThemeIcon type={t.type} />
                        <div>
                          <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{t.title}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{t.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Issues */}
                {warnings.length > 0 && (
                  <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">Issues flagged</h3>
                    <ul className="space-y-2.5">
                      {warnings.map((t, i) => (
                        <li key={i} className="flex gap-2.5">
                          <ThemeIcon type={t.type} />
                          <div>
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{t.title}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{t.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action points */}
                {synthesis.action_points.length > 0 && (
                  <div className="rounded-xl border-2 p-5 dark:bg-[#CF7454]/5" style={{ borderColor: '#CF7454', backgroundColor: '#FFF9F7' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#CF7454' }}>
                      Action points
                    </h3>
                    <ul className="space-y-2.5">
                      {synthesis.action_points.map((ap, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <PriorityDot priority={ap.priority} />
                          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{ap.text}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-3 text-xs text-stone-400 dark:text-stone-500">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> High</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Medium</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-stone-300 inline-block" /> Low</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right — reviews */}
            <div className={`${synthesis ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-4`}>
              {[airbnbRow, bookingRow].filter(Boolean).map(row => {
                const r = row!
                const isAirbnb = r.platform === 'airbnb'
                const reviews = r.raw_reviews ?? []
                return (
                  <div key={r.id} className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={r.platform} url={r.listing_url} />
                        <span className="text-xs text-stone-400 dark:text-stone-500">{r.total_reviews} reviews</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {r.category_scores && (
                          <div className="hidden sm:flex items-center gap-3">
                            {Object.entries(r.category_scores)
                              .filter(([, v]) => v !== null)
                              .slice(0, 4)
                              .map(([k, v]) => (
                                <div key={k} className="text-center">
                                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{v}</p>
                                  <p className="text-[10px] text-stone-400 dark:text-stone-500 capitalize">{k.replace(/_/g, ' ')}</p>
                                </div>
                              ))}
                          </div>
                        )}
                        {r.listing_url && (
                          <a href={r.listing_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-stone-400 dark:text-stone-500 hover:text-[#CF7454] flex items-center gap-0.5 transition-colors">
                            View listing <ChevronRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-stone-100 dark:divide-stone-700">
                      {reviews.map((review, i) => (
                        <div key={i} className={`px-5 py-4 ${review.negative ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                style={{ backgroundColor: '#CF7454' }}>
                                {review.reviewer.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{review.reviewer}</p>
                                {review.country && <p className="text-xs text-stone-400 dark:text-stone-500">{review.country}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {isAirbnb
                                ? <StarRating rating={review.rating} />
                                : <span className={`text-sm font-semibold ${review.rating >= 8 ? 'text-emerald-600' : review.rating >= 6 ? 'text-amber-600' : 'text-red-600'}`}>{review.rating}/10</span>
                              }
                              <span className="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">{review.date}</span>
                            </div>
                          </div>
                          <p className="mt-2.5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
