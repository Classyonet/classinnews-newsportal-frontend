import { fetchPublicSiteSettings, parseCustomPages } from '@/lib/public-site-settings'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function TermsPage() {
  const settings = await fetchPublicSiteSettings()
  const customTermsPage = parseCustomPages(settings.custom_pages).find((page) =>
    ['terms', 'terms-and-conditions', 'terms-conditions', 't-and-c'].includes(page.slug)
  )
  const adminContent = settings.page_terms_conditions?.trim() || customTermsPage?.content?.trim()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-8">
          {adminContent ? (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: adminContent }}
            />
          ) : (
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
              <p className="text-gray-600">
                This page is managed from Admin Settings. Please add Terms content under Pages to publish it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
