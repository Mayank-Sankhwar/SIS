import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function AppLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-950 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileSidebarOpen(true)} onLogout={handleLogout} />
        <main className="min-w-0 flex-1 bg-slate-50/90 px-1 py-1 transition-colors duration-200 dark:bg-slate-900/90 sm:px-2 sm:py-2">
          <div className="page-transition h-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
