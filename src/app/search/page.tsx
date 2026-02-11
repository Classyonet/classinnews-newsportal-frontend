'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleGrid from '@/components/ArticleGrid'
import { Search } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const [articles, setArticles] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    async function searchArticles() {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=12`)
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
          setPagination(data.pagination || null)
        }
      } catch (error) {
        console.error('Failed to search articles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    searchArticles()
  }, [query, page])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Searching...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center text-gray-500 mb-4">
            <Search className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Search Results</h1>
          </div>
          {query && (
            <p className="text-lg text-gray-700">
              Showing results for: <span className="font-semibold">&quot;{query}&quot;</span>
              {pagination && (
                <span className="text-gray-500 ml-2">
                  ({pagination.total} results)
                </span>
              )}
            </p>
          )}
        </div>

        {!query ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Enter a search term to find articles</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No articles found for &quot;{query}&quot;</p>
            <p className="text-gray-400 mt-2">Try different keywords</p>
          </div>
        ) : (
          <>
            <ArticleGrid articles={articles} />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                {page > 1 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                
                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                    className={`px-4 py-2 rounded-lg ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {page < pagination.totalPages && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
