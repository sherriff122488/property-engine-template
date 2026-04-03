'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Landmark,
  Zap,
  Users,
  ShieldCheck,
  FolderOpen,
  Settings,
  GitBranch,
  Star,
  Map,
  Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const navItems = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/mortgages',  label: 'Mortgages',  icon: Landmark },
  { href: '/utilities',  label: 'Utilities',  icon: Zap },
  { href: '/contacts',   label: 'Contacts',   icon: Users },
  { href: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/files',      label: 'Files',      icon: FolderOpen },
  { href: '/ownership',  label: 'Ownership',  icon: GitBranch },
  { href: '/reviews',    label: 'Reviews',    icon: Star },
  { href: '/map',           label: 'Map',           icon: Map },
  { href: '/deal-analyser', label: 'Deal Analyser', icon: Calculator },
  { href: '/settings',      label: 'Settings',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex h-screen w-56 flex-shrink-0 flex-col"
      style={{ backgroundColor: '#1C1917' }}
    >
      {/* Brand */}
      <div
        className="flex h-14 items-center px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: '#CF7454' }}
          >
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            Property Engine
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-100',
                    isActive
                      ? 'text-white'
                      : 'text-stone-400 hover:text-stone-100'
                  )}
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(207,116,84,0.18)' }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = ''
                    }
                  }}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-[#CF7454]' : 'text-stone-500'
                    )}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme toggle + Footer */}
      <div
        className="px-2.5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <ThemeToggle />
        <p className="mt-2 px-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Internal use only
        </p>
      </div>
    </aside>
  )
}
