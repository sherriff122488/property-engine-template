'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Sync state with the current class on mount
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-stone-400 transition-colors duration-100 hover:text-stone-100"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {isDark ? (
        <Sun className="h-4 w-4 flex-shrink-0 text-stone-500" />
      ) : (
        <Moon className="h-4 w-4 flex-shrink-0 text-stone-500" />
      )}
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
