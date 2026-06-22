import { NextResponse } from 'next/server';
import { ADMIN_API_URL } from '@/lib/api-config';

export async function GET() {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/settings/public/ads_verification`, {
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      const { data } = await res.json();
      const setting = data.find((s: any) => s.key === 'ads_txt_content');
      if (setting?.value) {
        return new NextResponse(setting.value, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
    }
  } catch (e) {
    console.error('Error fetching ads.txt:', e);
  }

  // Return a default empty response or placeholder if not configured
  return new NextResponse('# ads.txt not configured', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
