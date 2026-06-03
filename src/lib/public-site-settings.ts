import { ADMIN_API_ROOT } from './api-config'

export interface PublicSiteSettings {
  homepage_sidebar_newsletter_title: string
  homepage_sidebar_newsletter_description: string
  homepage_sidebar_newsletter_placeholder: string
  homepage_sidebar_newsletter_button_text: string
  homepage_sidebar_newsletter_url: string
  homepage_sidebar_social_title: string
  social_facebook_url: string
  social_twitter_url: string
  social_instagram_url: string
  social_youtube_url: string
  social_email_url: string
  page_about: string
  page_contact: string
  page_terms_conditions: string
  page_terms_placement: string
  page_terms_footer_column: string
  page_privacy_policy: string
  page_privacy_placement: string
  page_privacy_footer_column: string
  footer_footnote: string
  custom_pages: string
}

export interface CustomPageLink {
  title: string
  slug: string
  content: string
  placement: 'header' | 'footer' | 'both' | 'none'
  footerColumn: 'quick' | 'legal' | 'none'
  isActive: boolean
}

type LegalPageKind = 'terms' | 'privacy'
type ManagedPageKind = LegalPageKind | 'about' | 'contact'

const normalizePlacement = (value: unknown): CustomPageLink['placement'] => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'header' || normalized === 'footer' || normalized === 'both' || normalized === 'none') {
    return normalized
  }
  return 'footer'
}

const normalizeFooterColumn = (value: unknown): CustomPageLink['footerColumn'] => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'quick' || normalized === 'legal' || normalized === 'none') {
    return normalized
  }
  return 'legal'
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  homepage_sidebar_newsletter_title: 'Stay Updated',
  homepage_sidebar_newsletter_description: 'Subscribe to our newsletter for daily updates',
  homepage_sidebar_newsletter_placeholder: 'Your email address',
  homepage_sidebar_newsletter_button_text: 'Subscribe',
  homepage_sidebar_newsletter_url: '',
  homepage_sidebar_social_title: 'Follow Us',
  social_facebook_url: '',
  social_twitter_url: '',
  social_instagram_url: '',
  social_youtube_url: '',
  social_email_url: '',
  page_about: '',
  page_contact: '',
  page_terms_conditions: '',
  page_terms_placement: 'footer',
  page_terms_footer_column: 'legal',
  page_privacy_policy: '',
  page_privacy_placement: 'footer',
  page_privacy_footer_column: 'legal',
  footer_footnote: 'Classy News - Your trusted source for the latest updates and breaking news.',
  custom_pages: '[]',
}

export function parseCustomPages(raw: string): CustomPageLink[] {
  try {
    const pages = JSON.parse(raw || '[]')
    if (!Array.isArray(pages)) return []
    return pages
      .map((page) => ({
        title: String(page.title || '').trim(),
        slug: String(page.slug || '').trim().replace(/^\/+|\/+$/g, ''),
        content: String(page.content || ''),
        placement: normalizePlacement(page.placement),
        footerColumn: normalizeFooterColumn(page.footerColumn),
        isActive: page.isActive !== false,
      }))
      .filter((page) => page.title && page.slug && page.isActive)
  } catch {
    return []
  }
}

const matchManagedPage = (page: CustomPageLink, kind: ManagedPageKind): boolean => {
  const slug = page.slug.toLowerCase()
  const title = page.title.toLowerCase()

  if (kind === 'terms') {
    return (
      slug.includes('terms') ||
      slug.includes('t-and-c') ||
      title.includes('terms') ||
      title.includes('conditions')
    )
  }

  return (
    kind === 'privacy'
      ? slug.includes('privacy') || title.includes('privacy')
      : kind === 'about'
        ? slug.includes('about') || title.includes('about')
        : slug.includes('contact') || title.includes('contact')
  )
}

export function resolveManagedCustomPage(
  customPagesRaw: string,
  kind: ManagedPageKind
): CustomPageLink | null {
  const pages = parseCustomPages(customPagesRaw)
  return pages.find((page) => matchManagedPage(page, kind)) || null
}

export function resolveLegalCustomPage(
  customPagesRaw: string,
  kind: LegalPageKind
): CustomPageLink | null {
  return resolveManagedCustomPage(customPagesRaw, kind)
}

export function resolveLegalCustomPagePath(
  customPagesRaw: string,
  kind: LegalPageKind
): string | null {
  const page = resolveLegalCustomPage(customPagesRaw, kind)
  return page ? `/site-pages/${page.slug}` : null
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const response = await fetch(`${ADMIN_API_ROOT}/settings/public`)
    if (!response.ok) {
      return DEFAULT_PUBLIC_SITE_SETTINGS
    }

    const data = await response.json()
    const settings = data?.settings && typeof data.settings === 'object' ? data.settings : {}

    const merged = {
      ...DEFAULT_PUBLIC_SITE_SETTINGS,
      ...Object.fromEntries(
        Object.entries(DEFAULT_PUBLIC_SITE_SETTINGS).map(([key, defaultValue]) => [
          key,
          typeof settings[key] === 'string' && settings[key].trim() ? settings[key] : defaultValue,
        ])
      ),
    }

    return {
      ...merged,
      page_terms_placement: normalizePlacement(merged.page_terms_placement),
      page_privacy_placement: normalizePlacement(merged.page_privacy_placement),
      page_terms_footer_column: normalizeFooterColumn(merged.page_terms_footer_column),
      page_privacy_footer_column: normalizeFooterColumn(merged.page_privacy_footer_column),
    }
  } catch {
    return DEFAULT_PUBLIC_SITE_SETTINGS
  }
}
