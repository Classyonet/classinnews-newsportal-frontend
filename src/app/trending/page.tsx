'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ArticleGrid from '@/components/ArticleGrid'
import { cachedFetchSafe } from '@/lib/cacheManager'
import { NEWS_API_ROOT } from '@/lib/api-config'

const API_URL = NEWS_API_ROOT

export default function TrendingPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      try {
        const data = await cachedFetchSafe(`${API_URL}/articles/most-read?limit=24&minViews=0`, 'articles', [])
        setArticles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch trending articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Popular</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">Most Read Stories</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            See the stories readers are paying the most attention to right now.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No trending stories yet</h2>
            <p className="mt-2 text-gray-500">Once published articles gain traction, they will appear here.</p>
            <Link href="/" className="mt-4 inline-block text-red-600 hover:text-red-700">
              Return home
            </Link>
          </div>
        ) : (
          <ArticleGrid articles={articles} />
        )}
      </div>
    </div>
  )
}
