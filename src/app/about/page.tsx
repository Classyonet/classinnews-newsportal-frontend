import { notFound, redirect } from 'next/navigation'
import { fetchPublicSiteSettings, resolveManagedCustomPage } from '@/lib/public-site-settings'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const settings = await fetchPublicSiteSettings()
  const customPage = resolveManagedCustomPage(settings.custom_pages, 'about')

  if (!customPage) {
    notFound()
  }

  redirect(`/site-pages/${customPage.slug}`)
}
