export const runtime = 'edge'

import type { Metadata } from 'next'
import ArticlePage from './ArticleClientContent'
import OpenInAppRedirect from './OpenInAppRedirect'
import { NEWS_API_ROOT } from '@/lib/api-config'

type ArticleMetadataRecord = {
  title?: string
  excerpt?: string
  description?: string
  content?: string
  slug?: string
  featuredImageUrl?: string | null
  publishedAt?: string
  category?: {
    name?: string
  } | null
  author?: {
    name?: string
    username?: string
  } | null
}

const stripHtml = (value: string | undefined): string => {
  if (!value) {
    return ''
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const fetchArticleMetadata = async (
  slug: string
): Promise<ArticleMetadataRecord | null> => {
  try {
    const response = await fetch(
      `${NEWS_API_ROOT}/articles/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return null
    }

    return (await response.json()) as ArticleMetadataRecord
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug)
  const article = await fetchArticleMetadata(slug)
  const canonicalUrl = `https://classinnews.com/articles/${slug}`

  if (!article) {
    return {
      title: 'Article | Classy News',
      description: 'Read the latest article on Classy News.',
      alternates: {
        canonical: canonicalUrl,
      },
    }
  }

  const title = article.title?.trim() || 'Article'
  const contentPreview = stripHtml(article.content).slice(0, 180)
  const description =
    stripHtml(article.excerpt) ||
    stripHtml(article.description) ||
    contentPreview ||
    'Read the latest article on Classy News.'
  const imageUrl = article.featuredImageUrl?.trim() || undefined
  const authorName =
    article.author?.name?.trim() || article.author?.username?.trim() || undefined
  const section = article.category?.name?.trim() || undefined

  return {
    title: `${title} | Classy News`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Classy News',
      type: 'article',
      publishedTime: article.publishedAt,
      authors: authorName ? [authorName] : undefined,
      section,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <>
      <OpenInAppRedirect slug={decodeURIComponent(params.slug)} />
      <ArticlePage />
    </>
  )
}
