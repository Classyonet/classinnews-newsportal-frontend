export const runtime = 'edge';

import ArticleGrid from '@/components/ArticleGrid'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

async function getArticles(page: number = 1) {
  try {
    const res = await fetch(`${API_URL}/articles?page=${page}&limit=12`, { cache: 'no-store' })
    if (!res.ok) return { articles: [], pagination: null }
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return { articles: [], pagination: null }
  }
}

export default async function ArticlesPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const { articles, pagination } = await getArticles(page)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">All Articles</h1>
        
        <ArticleGrid articles={articles} />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            {page > 1 && (
              <a
                href={`/articles?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/articles?page=${p}`}
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
                href={`/articles?page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
