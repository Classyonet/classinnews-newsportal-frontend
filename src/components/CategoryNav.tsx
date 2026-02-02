'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  const isActive = (slug: string) => {
    if (slug === '' && pathname === '/') return true
    if (slug && pathname.includes(`/category/${slug}`)) return true
    return false
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {categories.map((category) => {
            const active = isActive(category.slug)
            const href = category.slug === '' ? '/' : `/category/${category.slug}`
            
            return (
              <Link
                key={category.id}
                href={href}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold text-white
                  transition-all hover:opacity-90 hover:scale-105
                  ${active ? 'ring-2 ring-offset-2 ring-gray-400 scale-105' : ''}
                `}
                style={{ backgroundColor: category.color || '#6B7280' }}
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile scroll indicator */}
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
