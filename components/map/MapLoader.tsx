"use client"

import dynamic from "next/dynamic"
import type { MapProperty } from "@/app/(dashboard)/map/page"

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-50 dark:bg-stone-900">
      <p className="text-sm text-stone-400">Loading map…</p>
    </div>
  ),
})

export default function MapLoader({ properties }: { properties: MapProperty[] }) {
  return <PropertyMap properties={properties} />
}
