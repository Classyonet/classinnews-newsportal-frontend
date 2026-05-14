'use client'

import { useEffect } from 'react'

export default function OpenInAppRedirect({ slug }: { slug: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('open') !== 'app') {
      return
    }

    window.location.href = `classynews://articles/${encodeURIComponent(slug)}`
  }, [slug])

  return null
}
