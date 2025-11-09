import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
  _count?: {
    articles: number
  }
}

interface CategoryListProps {
  categories: Category[]
}

export default function CategoryList({ categories }: CategoryListProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: category.color || '#3b82f6' }}
        >
          {category.icon && <span className="mr-2">{category.icon}</span>}
          {category.name}
          {category._count && (
            <span className="ml-2 opacity-80">({category._count.articles})</span>
          )}
        </Link>
      ))}
    </div>
  )
}
