const sanitizeApiUrl = (url: string | undefined, fallback: string): string => {
  const normalized = (url || '').trim().replace(/\/+$/, '');

  if (!normalized) {
    return fallback;
  }

  if (normalized.includes('localhost') || normalized.includes('onrender.com')) {
    return fallback;
  }

  return normalized;
};

export const NEWS_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'https://news-api.147.93.53.76.sslip.io'
);

export const ADMIN_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_ADMIN_API_URL,
  'https://admin-api.147.93.53.76.sslip.io'
);

export const NEWS_API_ROOT = `${NEWS_API_URL}/api`;
export const ADMIN_API_ROOT = `${ADMIN_API_URL}/api`;
