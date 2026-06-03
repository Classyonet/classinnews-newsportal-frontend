import { ADMIN_API_URL } from './api-config'

export const frontendTextDefaults = {
  frontend_reader_login_title: 'Classy News',
  frontend_reader_login_description: 'Your trusted source for quality news and insightful journalism.',
  frontend_reader_auth_features: 'Personalized news feed\nSave and bookmark articles\nEngage with the community',
  frontend_reader_login_form_title: 'Welcome back',
  frontend_reader_login_form_subtitle: 'Sign in to your reader account',
  frontend_reader_register_title: 'Classy News',
  frontend_reader_register_description: 'Join thousands of readers who trust us for quality journalism.',
  frontend_reader_register_form_title: 'Get started with Classy News',
  frontend_reader_register_form_subtitle: 'Create your reader account',
}

export type FrontendTextSettings = typeof frontendTextDefaults

const mapSettingsResponse = (data: any): Partial<FrontendTextSettings> => {
  const raw = data?.data ?? data
  if (Array.isArray(raw)) {
    return raw.reduce((acc, item) => {
      if (item?.key && typeof item.value === 'string') {
        acc[item.key as keyof FrontendTextSettings] = item.value
      }
      return acc
    }, {} as Partial<FrontendTextSettings>)
  }

  if (raw && typeof raw === 'object') {
    return raw as Partial<FrontendTextSettings>
  }

  return {}
}

export const fetchFrontendTextSettings = async (): Promise<FrontendTextSettings> => {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/settings/public/frontend_text`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return frontendTextDefaults
    }

    const data = await response.json()
    return {
      ...frontendTextDefaults,
      ...mapSettingsResponse(data),
    }
  } catch {
    return frontendTextDefaults
  }
}

export const settingLines = (value: string, fallback: string) =>
  (value || fallback)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
