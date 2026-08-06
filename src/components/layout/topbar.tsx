'use client'

import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Moon,
  Sun,
  HelpCircle,
  Keyboard,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/lib/auth/auth-store'
import { useTheme } from 'next-themes'
import { mockNotifications, mockAgencies } from '@/data/mock-data'
import { cn, getInitials } from '@/lib/utils'

// Custom hook for hydration - returns true only on client after hydration
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function Topbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const mounted = useMounted()
  
  const unreadCount = mockNotifications.filter(n => !n.isRead).length

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ALERT': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
      case 'WARNING': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleNotificationClick = (notif: typeof mockNotifications[0]) => {
    if (notif.link) {
      router.push(notif.link)
    }
    setShowNotifications(false)
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Agency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline max-w-[150px] truncate">
                {user.agencyName || 'Sélectionner'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sélectionner une agence</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockAgencies.map((agency) => (
              <DropdownMenuItem key={agency.id} className="gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{agency.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9"
        >
          {!mounted ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {mockNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-3 cursor-pointer',
                    !notif.isRead && 'bg-blue-50/50 dark:bg-blue-950/30'
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5', getNotificationColor(notif.type))}>
                      {notif.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-blue-600 dark:text-blue-400"
              onClick={() => {
                setShowNotifications(false)
                router.push('/notifications')
              }}
            >
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.roleName || user.department}</p>
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="font-normal text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/users/me" className="gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Aide
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Keyboard className="h-4 w-4" />
              Raccourcis clavier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 text-red-600 dark:text-red-400 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
