"use client"

import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"
import type { MapProperty } from "@/app/(dashboard)/map/page"
import type { PropertyStatus } from "@/lib/types/database.types"

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<PropertyStatus, { color: string; label: string }> = {
  let:          { color: "#22c55e", label: "Let" },
  airbnb:       { color: "#FF385C", label: "Airbnb" },
  vacant:       { color: "#f59e0b", label: "Vacant" },
  under_refurb: { color: "#f97316", label: "Under refurb" },
  owned:        { color: "#3b82f6", label: "Owned" },
  sale_agreed:  { color: "#8b5cf6", label: "Sale agreed" },
  sold:         { color: "#6b7280", label: "Sold" },
}

// ── Custom div icon ─────────────────────────────────────────────────────────
function makeIcon(color: string, count: number) {
  const size = count > 1 ? 38 : 32
  const label = count > 1
    ? `<span style="font-size:13px;font-weight:700">${count}</span>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:white;
    ">${label}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

// ── Fit map to all markers ──────────────────────────────────────────────────
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (!fitted.current && positions.length > 0) {
      map.fitBounds(positions, { padding: [48, 48] })
      fitted.current = true
    }
  }, [map, positions])
  return null
}

// ── Legend ──────────────────────────────────────────────────────────────────
function Legend({ statuses }: { statuses: PropertyStatus[] }) {
  const present = [...new Set(statuses)]
  return (
    <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-stone-200 bg-white/95 dark:bg-stone-800/95 dark:border-stone-700 shadow-md px-3.5 py-3 backdrop-blur-sm">
      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Status</p>
      <div className="space-y-1.5">
        {present.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: STATUS_CONFIG[s]?.color ?? "#6b7280" }}
            />
            <span className="text-xs text-stone-700 dark:text-stone-300">
              {STATUS_CONFIG[s]?.label ?? s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function PropertyMap({ properties }: { properties: MapProperty[] }) {
  // Group properties that share the same lat/lon (flats in same building)
  const groups = useMemo(() => {
    const map = new Map<string, MapProperty[]>()
    for (const p of properties) {
      const key = `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return Array.from(map.entries()).map(([key, props]) => ({
      key,
      lat: props[0].latitude,
      lon: props[0].longitude,
      properties: props,
    }))
  }, [properties])

  const positions = groups.map((g) => [g.lat, g.lon] as [number, number])
  const allStatuses = properties.map((p) => p.status)

  // Detect dark mode for tile layer
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark")

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  const tileAttrib = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[53.39, -2.96]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer url={tileUrl} attribution={tileAttrib} />
        <FitBounds positions={positions} />

        {groups.map((group) => {
          // Pick the "most interesting" status for the icon colour
          const priority: PropertyStatus[] = ["airbnb", "vacant", "under_refurb", "let", "owned", "sale_agreed", "sold"]
          const primaryStatus = priority.find((s) => group.properties.some((p) => p.status === s)) ?? group.properties[0].status
          const color = STATUS_CONFIG[primaryStatus]?.color ?? "#6b7280"
          const icon = makeIcon(color, group.properties.length)

          return (
            <Marker
              key={group.key}
              position={[group.lat, group.lon]}
              icon={icon}
            >
              <Popup minWidth={200} maxWidth={280}>
                <div className="space-y-2 py-1">
                  {group.properties.map((p) => (
                    <div key={p.id} className="border-b border-stone-100 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-start gap-2">
                        <div
                          className="mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: STATUS_CONFIG[p.status]?.color ?? "#6b7280" }}
                        />
                        <div>
                          <a
                            href={`/properties/${p.id}`}
                            className="text-sm font-semibold text-stone-900 hover:underline leading-tight block"
                          >
                            {p.name}
                          </a>
                          <p className="text-xs text-stone-500 mt-0.5">{STATUS_CONFIG[p.status]?.label ?? p.status}</p>
                          <p className="text-xs text-stone-400">{p.address_line_1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <Legend statuses={allStatuses} />
    </div>
  )
}
