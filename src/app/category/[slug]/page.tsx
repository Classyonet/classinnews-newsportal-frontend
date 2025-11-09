import { notFound } from 'next/navigation'
import ArticleGrid from '@/components/ArticleGrid'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

async function getCategoryData(slug: string, page: number = 1) {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}?page=${page}&limit=12`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return null
  }
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const data = await getCategoryData(params.slug, page)

  if (!data) {
    notFound()
  }

  const { category, articles, pagination } = data

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
            {category._count.articles} articles
          </p>
        </div>

        <ArticleGrid articles={articles} />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            {page > 1 && (
              <a
                href={`/category/${params.slug}?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/category/${params.slug}?page=${p}`}
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
                href={`/category/${params.slug}?page=${page + 1}`}
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
