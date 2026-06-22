import { NextResponse } from 'next/server';
import { NEWS_API_ROOT, ADMIN_API_URL } from '@/lib/api-config';

export const runtime = 'edge';

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const base = 'https://classinnews.com';
  let siteName = 'Classy News';
  let siteDesc = 'Latest breaking news, politics, entertainment, sports and more.';

  try {
    const settingsRes = await fetch(`${ADMIN_API_URL}/api/settings/public`, { next: { revalidate: 3600 } });
    if (settingsRes.ok) {
      const { settings } = await settingsRes.json();
      if (settings?.siteName) siteName = settings.siteName;
      if (settings?.siteDescription) siteDesc = settings.siteDescription;
    }
  } catch {}

  let items = '';
  try {
    const res = await fetch(`${NEWS_API_ROOT}/articles?limit=50&status=published`, { next: { revalidate: 900 } });
    if (res.ok) {
      const data = await res.json();
      const articles = data.data?.articles || data.articles || data.data || [];
      items = (Array.isArray(articles) ? articles : []).map((article: any) => {
        const url = `${base}/articles/${article.slug}`;
        const pubDate = new Date(article.publishedAt || Date.now()).toUTCString();
        const title = escapeXml(article.title || '');
        const desc = escapeXml(
          (article.excerpt || article.description || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300)
        );
        const imageTag = article.featuredImageUrl
          ? `<enclosure url="${escapeXml(article.featuredImageUrl)}" type="image/jpeg" length="0"/>\n      <media:content url="${escapeXml(article.featuredImageUrl)}" medium="image"/>`
          : '';
        const author = escapeXml(article.author?.name || article.author?.username || siteName);
        const category = escapeXml(article.category?.name || 'News');
        return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      <category>${category}</category>
      ${imageTag}
    </item>`;
      }).join('');
    }
  } catch (e) {
    console.error('RSS feed error:', e);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${base}/logo.png</url>
      <title>${escapeXml(siteName)}</title>
      <link>${base}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
    },
  });
}
