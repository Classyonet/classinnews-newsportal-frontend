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
              <p className="text-sm text-gray-500 mb-8">This page has not been updated yet.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
