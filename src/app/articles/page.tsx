'use client'

export const runtime = 'edge'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleGrid from '@/components/ArticleGrid'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

function ArticlesContent() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const [articles, setArticles] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_URL}/articles?page=${page}&limit=12`)
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
          setPagination(data.pagination || null)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchArticles()
  }, [page])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">All Articles</h1>
        
        <ArticleGrid articles={articles} />

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            {page > 1 && (
              <Link
                href={`/articles?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/articles?page=${p}`}
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
                href={`/articles?page=${page + 1}`}
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

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading articles...</p>
        </div>
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  )
}
