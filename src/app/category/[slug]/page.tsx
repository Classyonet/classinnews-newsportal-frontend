export const runtime = 'edge'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArticleGrid from '@/components/ArticleGrid'
import { NEWS_API_ROOT } from '@/lib/api-config'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams?: {
    page?: string
  }
}

interface CategoryResponse {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    icon: string | null
    _count?: {
      articles?: number
    }
  }
  articles: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function getCategoryData(slug: string, page: number): Promise<CategoryResponse> {
  const response = await fetch(
    `${NEWS_API_ROOT}/categories/${encodeURIComponent(slug)}?page=${page}&limit=12`,
    {
      next: { revalidate: 60 },
    }
  )

  if (response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    throw new Error(`Failed to load category ${slug}: ${response.status}`)
  }

  return response.json()
}

export default async function Page({ params, searchParams }: CategoryPageProps) {
  const page = Number.parseInt(searchParams?.page || '1', 10)
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1
  const data = await getCategoryData(params.slug, currentPage)
  const { category, articles, pagination } = data

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
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

        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            {currentPage > 1 && (
              <Link
                href={`/category/${params.slug}?page=${currentPage - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/category/${params.slug}?page=${pageNumber}`}
                className={`px-4 py-2 rounded-lg ${
                  pageNumber === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </Link>
            ))}

            {currentPage < pagination.totalPages && (
              <Link
                href={`/category/${params.slug}?page=${currentPage + 1}`}
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
