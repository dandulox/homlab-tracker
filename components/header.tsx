'use client'

import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Settings, LogIn, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onSearch: (query: string) => void
  onAdminClick: () => void
  isAuthenticated?: boolean
  onLogin?: () => void
  onLogout?: () => void
}

export function Header({ 
  onSearch, 
  onAdminClick, 
  isAuthenticated = false,
  onLogin,
  onLogout 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      onSearch('')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Labora</h1>
              <p className="text-sm text-muted-foreground">Homelab Dashboard</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Services durchsuchen... (/)"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4"
            />
            {searchQuery && (
              <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                ESC
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
            title="Theme wechseln (t)"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Admin Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onAdminClick}
            className="h-9 w-9"
            title="Administration (a)"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-9 w-9"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogin}
              className="h-9 w-9"
              title="Anmelden"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
