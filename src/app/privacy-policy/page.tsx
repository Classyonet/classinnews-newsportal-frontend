import { fetchPublicSiteSettings, resolveLegalCustomPage } from '@/lib/public-site-settings'
import { notFound, redirect } from 'next/navigation'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function PrivacyPolicyPage() {
  const settings = await fetchPublicSiteSettings()
  const customPrivacyPage = resolveLegalCustomPage(settings.custom_pages, 'privacy')

  if (customPrivacyPage) {
    redirect(`/site-pages/${customPrivacyPage.slug}`)
  }

  notFound()
}
