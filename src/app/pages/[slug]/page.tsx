import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchPublicSiteSettings, parseCustomPages } from '@/lib/public-site-settings'

export const dynamic = 'force-dynamic'

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const settings = await fetchPublicSiteSettings()
  const page = parseCustomPages(settings.custom_pages).find((item) => item.slug === params.slug)

  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <Link href="/" className="text-sm font-semibold text-red-600 hover:text-red-700">
            Back to home
          </Link>
        </div>
        <article className="rounded-lg bg-white p-6 shadow-sm md:p-10">
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </main>
  )
}
