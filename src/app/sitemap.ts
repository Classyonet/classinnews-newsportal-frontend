import { MetadataRoute } from 'next';
import { NEWS_API_ROOT } from '@/lib/api-config';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://classinnews.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/articles`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/latest`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let articlePages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      fetch(`${NEWS_API_ROOT}/articles?limit=1000&status=published`, { next: { revalidate: 3600 } }),
      fetch(`${NEWS_API_ROOT}/categories`, { next: { revalidate: 3600 } }),
    ]);

    if (articlesRes.ok) {
      const data = await articlesRes.json();
      const articles = data.data?.articles || data.articles || data.data || [];
      articlePages = (Array.isArray(articles) ? articles : []).map((article: any) => ({
        url: `${base}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

    if (categoriesRes.ok) {
      const data = await categoriesRes.json();
      const cats = data.data || data.categories || data || [];
      categoryPages = (Array.isArray(cats) ? cats : []).map((cat: any) => ({
        url: `${base}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Sitemap generation error:', e);
  }

  return [...staticPages, ...categoryPages, ...articlePages];
}
