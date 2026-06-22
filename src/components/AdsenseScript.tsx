import Script from 'next/script';

export function AdsenseScript({ snippet }: { snippet: string }) {
  if (!snippet) return null;

  // Check if it's a script tag
  if (snippet.includes('<script')) {
    const srcMatch = snippet.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      const src = srcMatch[1];
      return <Script async src={src} crossOrigin="anonymous" strategy="afterInteractive" />;
    }
  }
  
  // Check if it's a meta tag (often used for verification)
  if (snippet.includes('<meta')) {
    const nameMatch = snippet.match(/name=["']([^"']+)["']/);
    const contentMatch = snippet.match(/content=["']([^"']+)["']/);
    if (nameMatch && contentMatch) {
      return <meta name={nameMatch[1]} content={contentMatch[1]} />;
    }
  }

  return null;
}
