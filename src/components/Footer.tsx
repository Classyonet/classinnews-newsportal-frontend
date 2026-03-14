'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Newspaper, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { cachedFetchSafe } from '@/lib/cacheManager'
import { NEWS_API_ROOT } from '@/lib/api-config'
import {
  DEFAULT_PUBLIC_SITE_SETTINGS,
  fetchPublicSiteSettings,
  type PublicSiteSettings,
} from '@/lib/public-site-settings'

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([])
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_PUBLIC_SITE_SETTINGS)

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

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Newspaper className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">ClassinNews</span>
            </div>
            <p className="text-sm">
              Your trusted source for quality journalism and engaging stories from around the world.
            </p>
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
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-primary-400">Privacy Policy</Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="hover:text-primary-400">Terms of Service</Link>
            <span className="text-gray-600">•</span>
            <Link href="/data-deletion" className="hover:text-primary-400">Data Deletion</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} ClassinNews. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
