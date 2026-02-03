'use client'

import Link from 'next/link'
import { Search, Youtube, Facebook, User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdDisplay from './AdDisplay'

interface BrandingSettings {
  siteName: string
  siteDescription: string
  site_logo_url: string
  site_mobile_logo_url: string
  site_favicon_url: string
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [branding, setBranding] = useState<BrandingSettings>({
    siteName: 'ClassinNews',
    siteDescription: 'Your Source for Quality News',
    site_logo_url: '',
    site_mobile_logo_url: '',
    site_favicon_url: ''
  })
  const router = useRouter()
  const pathname = usePathname()

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check auth status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('reader_token')
    const userStr = localStorage.getItem('reader_user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('reader_token')
        localStorage.removeItem('reader_user')
        setIsAuthenticated(false)
        setCurrentUser(null)
      }
    } else {
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
    fetchBranding()

    // Listen for storage changes (for login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Re-check auth when pathname changes (after navigation)
  useEffect(() => {
    if (mounted) {
      checkAuthStatus()
    }
  }, [pathname, mounted])

  const fetchBranding = async () => {
    const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://classinnews-admin-backend.onrender.com'
    try {
      const response = await fetch(`${ADMIN_API_URL}/api/settings/branding`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setBranding(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('reader_token')
    localStorage.removeItem('reader_user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setShowUserMenu(false)
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <header className="bg-white shadow-sm">
      {/* TOP BANNER AD - Above everything */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdDisplay position="header_top" pageType="homepage" className="flex justify-center" />
        </div>
      </div>

      {/* TOP HEADER - Date | Quick Links | Social + Search */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            {/* Left - Date */}
            <div className="text-gray-600 font-medium">
              {currentDate}
            </div>

            {/* Center - Quick Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Contact
              </Link>
              <Link href="/advertise" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Advertise
              </Link>
            </div>

            {/* Right - Social Icons + Search */}
            <div className="flex items-center space-x-3">
              {/* Social Icons */}
              <div className="hidden sm:flex items-center space-x-2">
                <a 
                  href="https://youtube.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-red-600 rounded-sm flex items-center justify-center hover:bg-red-700 transition"
                  title="YouTube"
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center hover:bg-blue-700 transition"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-gray-900 rounded-sm flex items-center justify-center hover:bg-gray-800 transition"
                  title="X (Twitter)"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>

              {/* Search Icon */}
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-32 sm:w-48 px-3 py-1 pr-8 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-red-600 focus:w-56 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 bg-red-600 hover:bg-red-700 rounded-sm p-1 transition"
                  >
                    <Search className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </form>
              {/* Notifications */}
              <button className="relative p-2 text-gray-700 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-1 ring-white"></span>
              </button>

              {/* Auth Links or User Menu */}
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-3 ml-4">
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Login</Link>
                  <Link href="/register" className="text-sm font-semibold text-white bg-red-600 px-4 py-1.5 rounded-lg hover:bg-red-700 shadow-md transition-colors">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                      {currentUser?.username || 'User'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{currentUser?.username}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser?.email || currentUser?.phoneNumber}</p>
                        </div>
                        
                        <Link 
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>My Dashboard</span>
                        </Link>
                        
                        <Link 
                          href="/dashboard/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE HEADER - Logo | Ads Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Left - Logo */}
            <Link href="/" className="flex items-center flex-1 md:flex-none justify-center md:justify-start">
              <div className="relative">
                {/* Mobile Logo - Shows on mobile only */}
                {isMobile && branding.site_mobile_logo_url ? (
                  <img 
                    src={branding.site_mobile_logo_url}
                    alt={branding.siteName}
                    className="h-10 w-auto max-w-[150px] object-contain"
                    onError={(e) => {
                      console.error('Mobile logo failed to load');
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : branding.site_logo_url ? (
                  /* Desktop Logo */
                  <div className="flex flex-col">
                    <img 
                      src={branding.site_logo_url}
                      alt={branding.siteName}
                      className="h-10 md:h-12 w-auto max-w-[180px] md:max-w-[250px] object-contain"
                      onError={(e) => {
                        console.error('Logo failed to load:', branding.site_logo_url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {!isMobile && branding.siteDescription && (
                      <p className="text-xs text-gray-500 mt-1">{branding.siteDescription}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                      <span className="text-gray-900">Classy</span>
                      <span className="text-red-600">News</span>
                    </span>
                    {/* Red Triangle */}
                    <div className="ml-1 sm:ml-2 w-0 h-0 border-l-[8px] sm:border-l-[12px] md:border-l-[16px] lg:border-l-[20px] border-l-transparent border-t-[16px] sm:border-t-[24px] md:border-t-[30px] lg:border-t-[35px] border-t-red-600 border-r-[8px] sm:border-r-[12px] md:border-r-[16px] lg:border-r-[20px] border-r-transparent transform rotate-90"></div>
                    {!isMobile && (
                      <p className="text-xs text-gray-500 mt-1 absolute -bottom-5 left-0">{branding.siteDescription}</p>
                    )}
                  </div>
                )}
              </div>
            </Link>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Right - Header Banner Ad (beside logo) - Desktop only */}
            <div className="hidden lg:block max-w-[728px]">
              <AdDisplay position="header_banner" pageType="homepage" className="flex justify-center" />
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden mt-3 pb-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 rounded p-1.5 transition"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </form>
            </div>
          )}

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-3 pb-3 border-t border-gray-200 pt-3">
              <nav className="flex flex-col space-y-2">
                <Link href="/" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                  Home
                </Link>
                <Link href="/about" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                  About Us
                </Link>
                <Link href="/contact" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                  Contact
                </Link>
                <Link href="/advertise" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                  Advertise
                </Link>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/login" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                        Login
                      </Link>
                      <Link href="/register" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 bg-red-600 text-white rounded-lg font-semibold text-center mt-2 hover:bg-red-700 transition-colors">
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
                        My Dashboard
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM HEADER - Categories will be rendered here by CategoryNav component */}
    </header>
  )
}
