'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Newspaper, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { cachedFetchSafe } from '@/lib/cacheManager'
import { NEWS_API_ROOT, ADMIN_API_URL } from '@/lib/api-config'
import {
  DEFAULT_PUBLIC_SITE_SETTINGS,
  fetchPublicSiteSettings,
  parseCustomPages,
  type PublicSiteSettings,
} from '@/lib/public-site-settings'

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([])
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_PUBLIC_SITE_SETTINGS)
  const [siteName, setSiteName] = useState('Classy News')
  const [siteDescription, setSiteDescription] = useState(
    'Your trusted source for quality journalism and engaging stories from around the world.'
  )

  useEffect(() => {
    async function loadFooterData() {
      const [categoryData, siteSettings] = await Promise.all([
        cachedFetchSafe(`${NEWS_API_ROOT}/categories`, 'categories', []),
        fetchPublicSiteSettings(),
      ])

      const popularCategories = (Array.isArray(categoryData) ? categoryData : [])
        .filter((category: any) => (category?._count?.articles || 0) > 0)
        .sort((left: any, right: any) => (right?._count?.articles || 0) - (left?._count?.articles || 0))
        .slice(0, 4)

      setCategories(popularCategories)
      setSettings(siteSettings)

      // Fetch branding from admin dashboard (same source as Header)
      try {
        const res = await fetch(`${ADMIN_API_URL}/api/settings/branding`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            if (data.data.siteName) setSiteName(data.data.siteName)
            if (data.data.siteDescription) setSiteDescription(data.data.siteDescription)
          }
        }
      } catch {
        // fall back to defaults
      }
    }

    loadFooterData()
  }, [])

  const socialLinks = [
    { href: settings.social_facebook_url, icon: Facebook, label: 'Facebook' },
    { href: settings.social_twitter_url, icon: Twitter, label: 'Twitter' },
    { href: settings.social_instagram_url, icon: Instagram, label: 'Instagram' },
    { href: settings.social_youtube_url, icon: Youtube, label: 'YouTube' },
    { href: settings.social_email_url, icon: Mail, label: 'Email' },
  ].filter((item) => item.href.trim())
  const customPages = parseCustomPages(settings.custom_pages)
  const quickCustomPages = customPages.filter((page) =>
    (page.placement === 'footer' || page.placement === 'both') && page.footerColumn === 'quick'
  )
  const legalCustomPages = customPages.filter((page) =>
    (page.placement === 'footer' || page.placement === 'both') && page.footerColumn !== 'quick'
  )
  const legalLinksToRender = legalCustomPages.map((page) => ({ href: `/site-pages/${page.slug}`, title: page.title }))

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Newspaper className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">{siteName}</span>
            </div>
            <p className="text-sm">{siteDescription}</p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400">Home</Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary-400">All Articles</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-400">Categories</Link>
              </li>
              <li>
                <Link href="/latest" className="hover:text-primary-400">Latest News</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400">Contact Us</Link>
              </li>
              {quickCustomPages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/site-pages/${page.slug}`} className="hover:text-primary-400">{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">Popular Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories.length === 0 ? (
                <li className="text-gray-500">No categories available</li>
              ) : categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="hover:text-primary-400">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">{settings.homepage_sidebar_newsletter_title}</h3>
            <p className="mb-4 text-sm">{settings.homepage_sidebar_newsletter_description}</p>
            <div className="flex space-x-4">
              {socialLinks.length === 0 ? (
                <span className="text-sm text-gray-500">No social links configured</span>
              ) : socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-primary-400"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <div className="mb-4">
            <Link href="/contact" className="font-semibold text-white hover:text-primary-400">
              Contact Classy News: support@classinnews.com
            </Link>
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            {legalLinksToRender.map((page) => (
              <Link key={page.href} href={page.href} className="hover:text-primary-400">
                {page.title}
              </Link>
            ))}
          </div>
          <p>{settings.footer_footnote || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  )
}
