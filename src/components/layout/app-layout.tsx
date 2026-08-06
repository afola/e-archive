'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { AIAssistant } from '@/components/chat/ai-assistant'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© 2024 Archives Banque - Tous droits réservés</span>
          <span>Version 1.0.0</span>
        </footer>
      </div>
      <AIAssistant />
    </div>
  )
}
