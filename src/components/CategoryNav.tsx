'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

export default function CategoryNav() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch categories from API
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        console.log('Categories API response:', data)
        // API returns array directly, not wrapped
        const apiCategories = Array.isArray(data) ? data : (data.value || data.categories || [])
        console.log('Parsed categories:', apiCategories)
        setCategories(apiCategories)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching categories:', err)
        setLoading(false)
      })
  }, [])

  // Check scroll position to show/hide arrows
  const checkScrollArrows = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScrollArrows()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollArrows)
      window.addEventListener('resize', checkScrollArrows)
      return () => {
        container.removeEventListener('scroll', checkScrollArrows)
        window.removeEventListener('resize', checkScrollArrows)
      }
    }
  }, [categories])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const isActive = (slug: string) => {
    if (slug === '' && pathname === '/') return true
    if (slug && pathname.includes(`/category/${slug}`)) return true
    return false
  }

  // Truncate text if too long
  const truncateText = (text: string, maxLength: number = 12) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 1) + '…'
  }

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2">
            <span className="text-gray-400 text-sm">Loading categories...</span>
          </div>
        </div>
      </nav>
    )
  }

  if (categories.length === 0) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2">
            <span className="text-gray-400 text-sm">No categories available</span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 md:px-4 relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-gray-100 p-1.5 rounded-full shadow-md border border-gray-200 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Categories Container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-6 md:px-2"
        >
          {categories.map((category) => {
            const active = isActive(category.slug)
            const href = category.slug === '' ? '/' : `/category/${category.slug}`
            
            return (
              <Link
                key={category.id}
                href={href}
                className={`
                  flex-shrink-0 w-24 md:w-28 px-2 py-2 text-center text-xs md:text-sm font-semibold text-white
                  transition-all hover:opacity-90 truncate
                  ${active ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
                `}
                style={{ backgroundColor: category.color || '#6B7280' }}
                title={category.name}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {truncateText(category.name)}
              </Link>
            )
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-gray-100 p-1.5 rounded-full shadow-md border border-gray-200 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  )
}
