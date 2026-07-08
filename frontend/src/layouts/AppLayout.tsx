import { Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

export default function AppLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex justify-end border-b border-slate-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
