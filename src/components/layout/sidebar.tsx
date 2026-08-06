'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Archive,
  Search,
  ArrowRightLeft,
  FileCheck,
  Shield,
  FileText,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  History,
  Bell,
  Menu,
  LineChart,
  Calendar,
  Recycle,
  Trophy,
  AlertOctagon,
  Warehouse,
  Scan,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useArchiveStore } from '@/store/archive-store'

const navigation = [
  {
    title: 'Principal',
    items: [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, id: 'dashboard' },
      { name: 'Archives', href: '/archives', icon: Archive, id: 'archives' },
      { name: 'Recherche', href: '/search', icon: Search, id: 'search' },
    ],
  },
  {
    title: 'Opérations',
    items: [
      { name: 'Capture & OCR', href: '/capture', icon: Scan, id: 'capture' },
      { name: 'Mouvements', href: '/movements', icon: ArrowRightLeft, id: 'movements' },
      { name: 'Workflows', href: '/workflows', icon: FileCheck, id: 'workflows' },
      { name: 'Conservation', href: '/retention', icon: Shield, id: 'retention' },
      { name: 'Cycle de vie', href: '/lifecycle', icon: Recycle, id: 'lifecycle' },
      { name: 'Stockage', href: '/storage', icon: Warehouse, id: 'storage' },
    ],
  },
  {
    title: 'Contrôle',
    items: [
      { name: 'Audit', href: '/audit', icon: History, id: 'audit' },
      { name: 'Rapports', href: '/reports', icon: BarChart3, id: 'reports' },
      { name: 'Analytics', href: '/analytics', icon: LineChart, id: 'analytics' },
      { name: 'Timeline', href: '/timeline', icon: Calendar, id: 'timeline' },
      { name: 'Détection Fraude', href: '/fraud', icon: AlertOctagon, id: 'fraud' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { name: 'Gamification', href: '/gamification', icon: Trophy, id: 'gamification' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Utilisateurs', href: '/users', icon: Users, id: 'users' },
      { name: 'Paramètres', href: '/settings', icon: Settings, id: 'settings' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, setActiveModule } = useArchiveStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative h-screen bg-slate-900 dark:bg-slate-950 text-white flex flex-col border-r border-slate-800"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Archives Banque</h1>
                <p className="text-[10px] text-slate-400">Gestion documentaire</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
            <Building2 className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveModule(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                        sidebarCollapsed && 'justify-center'
                      )}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 shrink-0',
                        isActive && 'text-white'
                      )} />
                      
                      <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md whitespace-nowrap z-50"
                        >
                          {item.name}
                        </motion.div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse button */}
      <div className="p-3 border-t border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  )
}
