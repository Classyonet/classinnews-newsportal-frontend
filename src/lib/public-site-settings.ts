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
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const response = await fetch(`${ADMIN_API_ROOT}/settings/public`)
    if (!response.ok) {
      return DEFAULT_PUBLIC_SITE_SETTINGS
    }

    const data = await response.json()
    const settings = data?.settings && typeof data.settings === 'object' ? data.settings : {}

    return {
      ...DEFAULT_PUBLIC_SITE_SETTINGS,
      ...Object.fromEntries(
        Object.entries(DEFAULT_PUBLIC_SITE_SETTINGS).map(([key, defaultValue]) => [
          key,
          typeof settings[key] === 'string' && settings[key].trim() ? settings[key] : defaultValue,
        ])
      ),
    }
  } catch {
    return DEFAULT_PUBLIC_SITE_SETTINGS
  }
}
