import { fetchPublicSiteSettings, resolveLegalCustomPage } from '@/lib/public-site-settings'
import { notFound, redirect } from 'next/navigation'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function TermsPage() {
  const settings = await fetchPublicSiteSettings()
  const customTermsPage = resolveLegalCustomPage(settings.custom_pages, 'terms')

  if (customTermsPage) {
    redirect(`/site-pages/${customTermsPage.slug}`)
  }

  notFound()
}
