import { fetchPublicSiteSettings, resolveLegalCustomPage } from '@/lib/public-site-settings'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function TermsPage() {
  const settings = await fetchPublicSiteSettings()
  const customTermsPage = resolveLegalCustomPage(settings.custom_pages, 'terms')

  if (customTermsPage) {
    redirect(`/pages/${customTermsPage.slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
            <p className="text-gray-600">
              No custom Terms page found. Please create a custom page in Admin and include &quot;terms&quot; in the title or slug.
            </p>
            <Link href="/" className="inline-flex rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
