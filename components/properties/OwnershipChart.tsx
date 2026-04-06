'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'

type Property = {
  id: string
  name: string
  entity_name: string | null
  status: string
}

type EntityEntry = [string, Property[]]

export function OwnershipChart({ entityEntries }: { entityEntries: EntityEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-centre the chart horizontally on mount
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    }
  }, [])

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto p-8">
      <div className="inline-flex flex-col items-center pb-12">

        {/* ── Root node ── */}
        <div
          className="rounded-xl px-8 py-3 text-sm font-semibold text-white tracking-wide shadow-sm"
          style={{ backgroundColor: '#1C1917' }}
        >
          Matthew Sherriff
        </div>

        {/* Root → spine connector */}
        <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />

        {/* ── Spine + entity columns ── */}
        <div className="flex border-t border-stone-300 dark:border-stone-600">
          {entityEntries.map(([entityName, props]) => (
            <div key={entityName} className="flex flex-col items-center px-5">

              {/* Vertical drop from spine to entity box */}
              <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />

              {/* Entity box */}
              {entityName === 'Matthew Sherriff' ? (
                <div
                  className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap shadow-sm"
                  style={{ backgroundColor: '#CF7454', color: '#fff', minWidth: '130px' }}
                >
                  {entityName}
                </div>
              ) : (
                <a
                  href={`https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(entityName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap shadow-sm transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#CF7454', color: '#fff', minWidth: '130px' }}
                >
                  {entityName}
                </a>
              )}

              {/* Entity → properties connector */}
              {props.length > 0 && <div className="h-4 w-px bg-stone-300 dark:bg-stone-600" />}

              {/* Property boxes */}
              {props.length > 0 && (
                <div className="flex flex-col items-center">
                  {props.map((p, i) => (
                    <div key={p.id} className="flex flex-col items-center">
                      {i > 0 && <div className="h-2 w-px bg-stone-300 dark:bg-stone-600" />}
                      <Link href={`/properties/${p.id}`}>
                        <div
                          className="rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-2 text-center text-xs transition-all whitespace-nowrap hover:border-[#CF7454] hover:shadow-sm"
                          style={{ minWidth: '140px' }}
                        >
                          {p.name}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'

type Property = {
  id: string
  name: string
  entity_name: string | null
  status: string
}

type EntityEntry = [string, Property[]]

export function OwnershipChart({ entityEntries }: { entityEntries: EntityEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-centre the chart horizontally on mount
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    }
  }, [])

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto p-8">
      <div className="inline-flex flex-col items-center pb-12">

        {/* ── Root node ── */}
        <div
          className="rounded-xl px-8 py-3 text-sm font-semibold text-white tracking-wide shadow-sm"
          style={{ backgroundColor: '#1C1917' }}
        >
          Joe &amp; Katy
        </div>

        {/* Root → spine connector */}
        <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />

        {/* ── Spine + entity columns ── */}
        <div className="flex border-t border-stone-300 dark:border-stone-600">
          {entityEntries.map(([entityName, props]) => (
            <div key={entityName} className="flex flex-col items-center px-5">

              {/* Vertical drop from spine to entity box */}
              <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />

              {/* Entity box */}
              {entityName === 'Personal Name' ? (
                <div
                  className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap shadow-sm"
                  style={{ backgroundColor: '#CF7454', color: '#fff', minWidth: '130px' }}
                >
                  {entityName}
                </div>
              ) : (
                <a
                  href={`https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(entityName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap shadow-sm transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#CF7454', color: '#fff', minWidth: '130px' }}
                >
                  {entityName}
                </a>
              )}

              {/* Entity → properties connector */}
              {props.length > 0 && <div className="h-4 w-px bg-stone-300 dark:bg-stone-600" />}

              {/* Property boxes */}
              {props.length > 0 && (
                <div className="flex flex-col items-center">
                  {props.map((p, i) => (
                    <div key={p.id} className="flex flex-col items-center">
                      {i > 0 && <div className="h-2 w-px bg-stone-300 dark:bg-stone-600" />}
                      <Link href={`/properties/${p.id}`}>
                        <div
                          className="rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-2 text-center text-xs transition-all whitespace-nowrap hover:border-[#CF7454] hover:shadow-sm"
                          style={{ minWidth: '140px' }}
                        >
                          {p.name}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
