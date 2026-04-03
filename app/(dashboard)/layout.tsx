import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F6F3] dark:bg-stone-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
