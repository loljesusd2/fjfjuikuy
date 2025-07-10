
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, Calendar, User, BarChart3, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n-client'

interface UserData {
  role: string
}

const getClientNavigationItems = (t: (key: string) => string) => [
  { icon: Home, label: t('navigation.home'), href: '/' },
  { icon: Search, label: t('navigation.explore'), href: '/explore' },
  { icon: Calendar, label: t('navigation.bookings'), href: '/bookings' },
  { icon: Heart, label: t('navigation.favorites'), href: '/favorites' },
  { icon: User, label: t('navigation.profile'), href: '/profile' },
]

const getProfessionalNavigationItems = (t: (key: string) => string) => [
  { icon: Home, label: t('navigation.dashboard'), href: '/' },
  { icon: Calendar, label: t('navigation.calendar'), href: '/calendar' },
  { icon: Settings, label: t('navigation.services'), href: '/services/manage' },
  { icon: BarChart3, label: t('navigation.earnings'), href: '/earnings' },
  { icon: User, label: t('navigation.profile'), href: '/profile' },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const t = useTranslations()

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData: UserData = await response.json()
        setUserRole(userData.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  // Don't show bottom nav on auth pages
  if (pathname.startsWith('/auth') || pathname.startsWith('/admin')) {
    return null
  }

  // Don't show navigation until we know the user role
  if (!userRole) {
    return null
  }

  const navigationItems = userRole === 'PROFESSIONAL' ? getProfessionalNavigationItems(t) : getClientNavigationItems(t)

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-6xl bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around py-3 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[70px]",
                isActive 
                  ? "text-amber-700 bg-amber-50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "mb-1",
                  isActive && "fill-current"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
