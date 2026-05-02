import { Outlet } from 'react-router-dom'

import { Header } from './header'
import { MobileNavigation, Sidebar } from './sidebar'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <MobileNavigation />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
