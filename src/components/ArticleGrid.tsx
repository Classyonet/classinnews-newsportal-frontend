import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, MessageCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImageUrl: string | null
  publishedAt: string
  viewsCount: number
  likesCount: number
  readingTime: number | null
  author: {
    username: string
    avatarUrl: string | null
  }
  category: {
    name: string
    slug: string
    color: string | null
  } | null
  _count?: {
    comments: number
  }
}

interface ArticleGridProps {
  articles: Article[]
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Link 
          key={article.id} 
          href={`/article/${article.slug}`}
          className="group"
        >
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Featured Image */}
            <div className="relative h-48 bg-gray-200">
              {article.featuredImageUrl ? (
                <Image
                  src={article.featuredImageUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {article.title.charAt(0)}
                  </span>
                </div>
              )}
              {article.category && (
                <div 
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: article.category.color || '#3b82f6' }}
                >
                  {article.category.name}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{article.author.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.viewsCount}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{article._count?.comments || 0}</span>
                  </span>
                </div>
                {article.readingTime && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.readingTime} min read</span>
                  </span>
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
