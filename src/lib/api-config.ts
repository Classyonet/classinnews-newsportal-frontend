const sanitizeApiUrl = (url: string | undefined, fallback: string): string => {
  const normalized = (url || '').trim().replace(/\/+$/, '');

  if (!normalized) {
    return fallback;
  }

  return normalized;
};

export const NEWS_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'https://news-api.classinnews.com'
);

export const ADMIN_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_ADMIN_API_URL,
  'https://admin-api.classinnews.com'
);

export const NEWS_API_ROOT = `${NEWS_API_URL}/api`;
export const ADMIN_API_ROOT = `${ADMIN_API_URL}/api`;
