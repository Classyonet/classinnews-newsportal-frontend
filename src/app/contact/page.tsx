import { fetchPublicSiteSettings } from '@/lib/public-site-settings'

export const runtime = 'edge'
export const revalidate = 60

export default async function ContactPage() {
  const settings = await fetchPublicSiteSettings()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-8">
          {settings.page_contact ? (
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.page_contact }}
            />
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
              <p className="mb-4 text-gray-700">
                Contact Classy News for app support, editorial questions, news source concerns, or account help.
              </p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <h2 className="mb-3 text-xl font-bold text-gray-900">Classy News Support</h2>
                <p className="mb-2 text-gray-700">
                  Email: <a className="font-semibold text-red-600 hover:text-red-700" href="mailto:support@classinnews.com">support@classinnews.com</a>
                </p>
                <p className="text-gray-700">
                  Website: <a className="font-semibold text-red-600 hover:text-red-700" href="https://classinnews.com">https://classinnews.com</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
