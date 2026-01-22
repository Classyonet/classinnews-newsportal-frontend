export const runtime = 'edge';

import CategoryList from '@/components/CategoryList'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' })
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
        <p className="text-xl text-gray-600 mb-12">
          Explore articles across different topics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              style={{ borderTop: `4px solid ${category.color || '#3b82f6'}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 mb-4">{category.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {category._count.articles} articles
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
