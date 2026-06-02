import { fetchPublicSiteSettings, parseCustomPages } from '@/lib/public-site-settings'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function PrivacyPolicyPage() {
  const settings = await fetchPublicSiteSettings()
  const customPrivacyPage = parseCustomPages(settings.custom_pages).find((page) =>
    ['privacy-policy', 'privacy', 'privacy-notice'].includes(page.slug)
  )
  const adminContent = settings.page_privacy_policy?.trim() || customPrivacyPage?.content?.trim()

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
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">
                This page is managed from Admin Settings. Please add Privacy content under Pages to publish it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
