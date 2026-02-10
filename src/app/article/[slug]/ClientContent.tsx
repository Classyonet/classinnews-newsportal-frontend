'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Eye, Share2, Clock, Tag, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ArticleGrid from '@/components/ArticleGrid'
import AdDisplay from '@/components/AdDisplay'
import dynamic from 'next/dynamic'

const ArticleComments = dynamic(() => import('@/components/ArticleComments'), { ssr: false })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

export default function ArticlePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchArticle()
      fetchRelatedArticles()
    }
  }, [slug])

  async function fetchArticle() {
    try {
      const res = await fetch(`${API_URL}/articles/${slug}`, { cache: 'no-store' })
      if (!res.ok) {
        setArticle(null)
        return
      }
      const data = await res.json()
      setArticle(data)
    } catch (error) {
      console.error('Failed to fetch article:', error)
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRelatedArticles() {
    try {
      const res = await fetch(`${API_URL}/articles/${slug}/related?limit=3`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setRelatedArticles(data)
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!article) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner Ad */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <AdDisplay position="top" pageType="article" className="flex justify-center" />
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            {article.category && (
              <Link 
                href={`/category/${article.category.slug}`}
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-4"
                style={{ backgroundColor: article.category.color || '#3b82f6' }}
              >
                {article.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b">
              <div className="flex items-center space-x-2">
                {article.author.avatarUrl ? (
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {article.author.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{article.author.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewsCount} views</span>
              </div>

              {article.readingTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              )}

              <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImageUrl && (
          <div className="w-full h-96 relative bg-gray-200">
            <Image
              src={article.featuredImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div 
                className="article-content prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-5 w-5 text-gray-400" />
                    {article.tags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  {article.author.avatarUrl ? (
                    <Image
                      src={article.author.avatarUrl}
                      alt={article.author.username}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {article.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {article.author.username}
                    </h3>
                    <p className="text-gray-600">
                      Publisher at ClassinNews
                    </p>
                  </div>
                </div>

                {/* Comments and interactions */}
                <div className="mt-8">
                  <div className="flex items-center gap-3">
                    <button onClick={async () => {
                      const token = localStorage.getItem('reader_token')
                      if (!token) { alert('Please login to like articles'); return }
                      try {
                        const res = await fetch(`${API_URL}/articles/${article.slug}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
                        if (!res.ok) throw new Error('Failed to like')
                        const d = await res.json();
                        alert('Liked! Total likes: ' + d.likesCount)
                      } catch (err: any) { alert(err.message || 'Error') }
                    }} className="flex items-center gap-2 bg-white border px-3 py-2 rounded">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span>Like</span>
                    </button>

                    <button onClick={() => {
                      const shareUrl = window.location.href
                      if ((navigator as any).share) {
                        (navigator as any).share({ title: article.title, url: shareUrl })
                      } else {
                        navigator.clipboard.writeText(shareUrl)
                        alert('Link copied to clipboard')
                      }
                    }} className="flex items-center gap-2 bg-white border px-3 py-2 rounded">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  <ArticleComments slug={article.slug} />
                </div>
              </div>
            </div>

            {/* Sidebar with ads */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Sidebar Top Ad */}
              <div className="sticky top-6">
                <AdDisplay position="sidebar_top" pageType="article" className="flex justify-center" />
              </div>

              {/* Sidebar Middle Ad */}
              <div>
                <AdDisplay position="sidebar_middle" pageType="article" className="flex justify-center" />
              </div>

              {/* Sidebar Bottom Ad */}
              <div>
                <AdDisplay position="sidebar_bottom" pageType="article" className="flex justify-center" />
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Bottom Banner Ad */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <AdDisplay position="bottom" pageType="article" className="flex justify-center" />
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <ArticleGrid articles={relatedArticles} />
          </div>
        </section>
      )}
    </div>
  )
}
