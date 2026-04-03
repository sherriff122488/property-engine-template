'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Landmark, Zap, Users, ShieldCheck,
  FolderOpen, Settings, GitBranch, Star, Map, Calculator, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { href: '/map',        label: 'Map',        icon: Map },
  { href: '/deal-analyser', label: 'Deal Analyser', icon: Calculator },
  { href: '/settings',   label: 'Settings',   icon: Settings },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const currentPage = navItems.find(item =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <>
      {/* Top bar */}
      <header
        className="lg:hidden flex items-center justify-between h-14 px-4 flex-shrink-0"
        style={{ backgroundColor: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: '#CF7454' }}
          >
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            {currentPage?.label ?? 'Property Engine'}
          </span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-8 w-8 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#1C1917' }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between h-14 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: '#CF7454' }}
            >
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">Property Engine</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
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
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'text-white' : 'text-stone-400'
                    )}
                    style={isActive ? { backgroundColor: 'rgba(207,116,84,0.18)' } : undefined}
                  >
                    <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-[#CF7454]' : 'text-stone-500')} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Internal use only</p>
        </div>
      </div>
    </>
  )
}
