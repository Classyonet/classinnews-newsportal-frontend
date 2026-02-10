'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ArticleGrid from '@/components/ArticleGrid'
import Link from 'next/link'
import { cachedFetch } from '@/lib/cacheManager'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

function CategoryPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const page = parseInt(searchParams.get('page') || '1')
  
  const [category, setCategory] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategoryData() {
      if (!slug) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await cachedFetch(`${API_URL}/categories/${slug}?page=${page}&limit=12`, 'categories')
        setCategory(data.category)
        setArticles(data.articles || [])
        setPagination(data.pagination)
      } catch (err) {
        console.error('Failed to fetch category:', err)
        setError('Failed to load category')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCategoryData()
  }, [slug, page])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="mb-12">
          <div 
            className="inline-block px-6 py-2 rounded-full text-white font-bold mb-4"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          >
            {category.icon && <span className="mr-2">{category.icon}</span>}
            {category.name}
          </div>
          <h1 className="text-4xl font-bold mb-4">{category.name} Articles</h1>
          {category.description && (
            <p className="text-xl text-gray-600">{category.description}</p>
          )}
          <p className="text-gray-500 mt-2">
            {category._count?.articles || 0} articles
          </p>
        </div>

        <ArticleGrid articles={articles} />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            {page > 1 && (
              <Link
                href={`/category/${slug}?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/category/${slug}?page=${p}`}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            ))}

            {page < pagination.totalPages && (
              <Link
                href={`/category/${slug}?page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <CategoryPageContent />
    </Suspense>
  )
}
