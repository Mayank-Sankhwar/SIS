import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { cn } from '../../utils/cn'
import { navigationGroups, type NavigationItem } from './navigation'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onCloseMobile: () => void
}

function isActiveRoute(pathname: string, item: NavigationItem) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {
  const { pathname } = useLocation()

  const sidebar = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200 bg-slate-950 text-slate-100 shadow-xl transition-[width,transform] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950',
        collapsed ? 'w-[5.25rem]' : 'w-72',
      )}
      aria-label="Application navigation"
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white shadow-sm">
          K
        </div>
        <div className={cn('min-w-0 transition-opacity duration-200', collapsed && 'pointer-events-none opacity-0')}>
          <p className="truncate text-sm font-semibold uppercase tracking-wide text-white">KESCO</p>
          <p className="truncate text-xs text-slate-400">Substation Info System</p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-md p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {navigationGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon

            return (
              <div key={group.label ?? `group-${groupIndex}`} className="space-y-2">
                {group.label ? (
                  <div className={cn('flex h-7 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500', collapsed && 'justify-center px-0')}>
                    {GroupIcon ? <GroupIcon className="h-4 w-4" aria-hidden="true" /> : null}
                    <span className={cn('truncate transition-opacity duration-200', collapsed && 'hidden')}>{group.label}</span>
                  </div>
                ) : null}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    const active = isActiveRoute(pathname, item)

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400',
                          collapsed && 'justify-center px-0',
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        <ItemIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className={cn('truncate transition-opacity duration-200', collapsed && 'hidden')}>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'hidden h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white lg:flex',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" aria-hidden="true" /> : <ChevronLeft className="h-5 w-5" aria-hidden="true" />}
          <span className={cn('truncate transition-opacity duration-200', collapsed && 'hidden')}>Collapse</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block">{sidebar}</div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </div>

      <button
        type="button"
        onClick={onCloseMobile}
        className="sr-only"
        aria-label="Close navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  )
}
