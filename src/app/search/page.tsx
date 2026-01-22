export const runtime = 'edge';

import ArticleGrid from '@/components/ArticleGrid'
import { Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

async function searchArticles(query: string, page: number = 1) {
  try {
    const res = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=12`,
      { cache: 'no-store' }
    )
    if (!res.ok) return { articles: [], pagination: null, query: '' }
    return await res.json()
  } catch (error) {
    console.error('Failed to search articles:', error)
    return { articles: [], pagination: null, query: '' }
  }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const { articles, pagination } = await searchArticles(query, page)

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
              Showing results for: <span className="font-semibold">"{query}"</span>
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
            <p className="text-gray-500 text-lg">No articles found for "{query}"</p>
            <p className="text-gray-400 mt-2">Try different keywords</p>
          </div>
        ) : (
          <>
            <ArticleGrid articles={articles} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                {page > 1 && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </a>
                )}
                
                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                    className={`px-4 py-2 rounded-lg ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </a>
                ))}

                {page < pagination.totalPages && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
