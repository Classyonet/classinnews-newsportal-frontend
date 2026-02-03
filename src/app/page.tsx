'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRelativeTime } from '@/lib/timeUtils';
import AdDisplay from '@/components/AdDisplay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImageUrl?: string | null;
  publishedAt: string;
  category?: {
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    username: string;
    name?: string;
    avatarUrl?: string | null;
  };
}

export default function HomePage() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [popularStories, setPopularStories] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [mostRead, setMostRead] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carousel state
  const [carouselArticles, setCarouselArticles] = useState<Article[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselSettings, setCarouselSettings] = useState({
    enabled: false,
    interval: 5,
    effect: 'cube',
    showTitle: true
  });

  // Load carousel settings first
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${ADMIN_API_URL}/api/settings/public/homepage`);
        if (!res.ok) {
          throw new Error(`Failed to fetch settings: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Loaded homepage settings:', data);
        
        const arr = Array.isArray(data.data) ? data.data : [];
        const settingsMap: Record<string, string> = {};
        arr.forEach((s: any) => settingsMap[s.key] = s.value);

        const enabled = settingsMap['homepage_carousel_enabled'] === 'true';
        const interval = Number(settingsMap['homepage_carousel_interval'] || '5');
        const effect = settingsMap['homepage_carousel_effect'] || 'cube';
        const showTitle = settingsMap['homepage_carousel_show_title'] !== 'false';

        setCarouselSettings({ enabled, interval, effect, showTitle });

        // If enabled, fetch random articles for carousel immediately
        if (enabled) {
          try {
            const articlesRes = await fetch(`${API_URL}/api/articles/random?limit=6`);
            if (!articlesRes.ok) {
              throw new Error(`Failed to fetch articles: ${articlesRes.status}`);
            }
            const articles = await articlesRes.json();
            console.log('Loaded random carousel articles:', articles);
            const arr = Array.isArray(articles) ? articles : [];
            setCarouselArticles(arr);
          } catch (err) {
            console.error('Failed to load carousel articles:', err);
            // Fallback to empty array
            setCarouselArticles([]);
          }
        } else {
          // Clear carousel if disabled
          setCarouselArticles([]);
        }
      } catch (err) {
        console.error('Failed to load homepage settings:', err);
        // Default to disabled if settings can't be loaded
        setCarouselSettings({
          enabled: false,
          interval: 5,
          effect: 'cube',
          showTitle: true
        });
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, fetch layout settings to get min views threshold
        let minViews = 20; // default
        try {
          const layoutRes = await fetch(`${ADMIN_API_URL}/api/layout-settings/public/all`);
          if (layoutRes.ok) {
            const layoutData = await layoutRes.json();
            if (layoutData.success && layoutData.data?.homepage_most_read_min_views) {
              minViews = parseInt(layoutData.data.homepage_most_read_min_views) || 20;
            }
          }
        } catch (err) {
          console.error('Failed to fetch layout settings:', err);
        }

        // Fetch all data in parallel for faster loading
        const [
          trendingRes,
          latestRes,
          mostReadRes,
          categoriesRes
        ] = await Promise.all([
          fetch(`${API_URL}/api/articles/trending?limit=6`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/articles/latest?limit=6`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/articles/most-read?limit=6&minViews=${minViews}`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => [])
        ]);

        // Process trending - first one is featured, rest are popular
        const trendingArticles = Array.isArray(trendingRes) ? trendingRes : [];
        if (trendingArticles.length > 0) {
          setFeaturedArticle(trendingArticles[0]);
          setPopularStories(trendingArticles.slice(1, 6));
        }

        // Process latest news
        const latestArticles = Array.isArray(latestRes) ? latestRes : [];
        setLatestNews(latestArticles);

        // Process most read
        const mostReadArticles = Array.isArray(mostReadRes) ? mostReadRes : [];
        setMostRead(mostReadArticles);

        // Process categories
        const cats = Array.isArray(categoriesRes) ? categoriesRes : [];
        setCategories(cats);

        // Fetch articles for first 4 categories in parallel
        if (cats.length > 0) {
          const topCategories = cats.slice(0, 4);
          const categoryPromises = topCategories.map((cat: any) =>
            fetch(`${API_URL}/api/categories/${cat.slug}?limit=4`)
              .then(r => r.json())
              .then(data => ({ slug: cat.slug, articles: data.articles || [] }))
              .catch(() => ({ slug: cat.slug, articles: [] }))
          );

          const categoryResults = await Promise.all(categoryPromises);
          const catArticlesMap: Record<string, Article[]> = {};
          categoryResults.forEach(result => {
            catArticlesMap[result.slug] = result.articles;
          });
          setCategoryArticles(catArticlesMap);
        }

        // Also fetch carousel settings in parallel if not already loaded
        try {
          const settingsRes = await fetch(`${ADMIN_API_URL}/api/settings/public/homepage`);
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            const arr = Array.isArray(settingsData.data) ? settingsData.data : [];
            const settingsMap: Record<string, string> = {};
            arr.forEach((s: any) => settingsMap[s.key] = s.value);

            const enabled = settingsMap['homepage_carousel_enabled'] === 'true';
            if (enabled && carouselArticles.length === 0) {
              const articlesRes = await fetch(`${API_URL}/api/articles/random?limit=6`);
              if (articlesRes.ok) {
                const articles = await articlesRes.json();
                setCarouselArticles(Array.isArray(articles) ? articles : []);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load carousel settings:', err);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Setup autoplay timer
  useEffect(() => {
    if (carouselSettings.enabled && carouselArticles.length > 0) {
      const timer = setInterval(() => {
        setCarouselIndex((current) => (current + 1) % carouselArticles.length);
      }, carouselSettings.interval * 1000);
      
      return () => clearInterval(timer);
    }
  }, [carouselSettings.enabled, carouselSettings.interval, carouselArticles.length]);

  const isNew = (publishedAt: string) => {
    const published = new Date(publishedAt);
    const now = new Date();
    const diffHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Banner Ad - Contained within main content */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-3 mb-6">
          <AdDisplay position="top" pageType="homepage" className="flex justify-center" />
        </div>
        
        {/* Main Grid Layout - Continuous 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {/* Featured Article/Carousel */}
            {carouselSettings.enabled && carouselArticles.length > 0 ? (
              <div className="relative">
                <div className={`carousel-3d relative w-full h-96 perspective-1000 carousel-effect-${carouselSettings.effect}`}>
                  <div
                    className="carousel-3d-inner w-full h-full will-change-transform transition-transform duration-700"
                    style={{
                      transform: carouselSettings.effect === 'cube'
                        ? `translateZ(-300px) rotateY(${carouselIndex * -90}deg)`
                        : carouselSettings.effect === 'flip'
                        ? `translateZ(-150px) rotateX(${carouselIndex * -180}deg)`
                        : 'none'
                    }}
                  >
                    {carouselArticles.map((article, i) => {
                      let transform = '';
                      let className = 'carousel-panel';
                      
                      if (carouselSettings.effect === 'cube') {
                        transform = `rotateY(${i * 90}deg) translateZ(300px)`;
                      } else if (carouselSettings.effect === 'flip') {
                        transform = `rotateX(${i * 180}deg) translateZ(150px)`;
                      } else if (carouselSettings.effect === 'slide') {
                        const offset = (i - carouselIndex) * 100;
                        transform = `translateX(${offset}%)`;
                        if (i === carouselIndex) className += ' active';
                      } else if (carouselSettings.effect === 'fade') {
                        transform = 'none';
                        if (i === carouselIndex) className += ' active';
                      } else if (carouselSettings.effect === 'stack') {
                        transform = 'scale(0.85) translateY(60px)';
                        if (i === carouselIndex) className += ' active';
                        else if (i === (carouselIndex - 1 + carouselArticles.length) % carouselArticles.length) className += ' prev';
                        else if (i === (carouselIndex - 2 + carouselArticles.length) % carouselArticles.length) className += ' prev-2';
                      } else if (carouselSettings.effect === 'coverflow') {
                        transform = `translateX(${(i - carouselIndex) * 100}%) translateZ(-200px) rotateY(0deg) scale(0.8)`;
                        if (i === carouselIndex) className += ' active';
                        else if (i === (carouselIndex - 1 + carouselArticles.length) % carouselArticles.length) className += ' prev';
                        else if (i === (carouselIndex + 1) % carouselArticles.length) className += ' next';
                      }
                      
                      return (
                        <div
                          key={article.id}
                          className={className}
                          style={{ transform }}
                        >
                          <Link href={`/articles/${article.slug}`} className="block w-full h-full bg-gray-200">
                            <div className="relative w-full h-full">
                              {article.featuredImageUrl && (
                                <Image 
                                  src={article.featuredImageUrl}
                                  alt={article.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                              {carouselSettings.showTitle && (
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                                  <div>
                                    {article.category && (
                                      <span className="inline-block bg-red-600 text-white px-3 py-1 text-sm font-semibold uppercase mb-3">
                                        {article.category.name || 'Uncategorized'}
                                      </span>
                                    )}
                                    <h3 className="text-2xl font-bold text-white">{article.title}</h3>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {carouselArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`w-3 h-3 rounded-full ${
                        carouselIndex === idx ? 'bg-white' : 'bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              featuredArticle && (
                <Link href={`/articles/${featuredArticle.slug}`} className="group block bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-96 bg-gray-200">
                    {featuredArticle.featuredImageUrl && (
                      <Image
                        src={featuredArticle.featuredImageUrl}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      {featuredArticle.category && (
                        <span className="bg-red-600 text-white px-3 py-1 text-sm font-semibold uppercase">
                          {featuredArticle.category.name || 'Uncategorized'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-3">
                      {featuredArticle.title}
                    </h1>
                    <p className="text-gray-700 text-lg leading-relaxed mb-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{featuredArticle.author.name || featuredArticle.author.username || 'Unknown Author'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              )
            )}

            {/* Ad Banner - Content Top */}
            <div className="py-4">
              <AdDisplay position="content_top" pageType="homepage" className="flex justify-center" />
            </div>

            {/* Most Read Section - Horizontal Layout */}
            <div className="bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Most Read</h2>
                <Link href="/trending" className="text-red-600 hover:text-red-700 text-sm font-semibold">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {mostRead.slice(0, 6).map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className={`flex gap-4 group hover:bg-gray-50 p-3 -mx-3 transition-colors ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className="relative w-32 h-24 md:w-40 md:h-28 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                      {article.featuredImageUrl && (
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-1 left-1">
                        <span className="bg-red-600 text-white px-1.5 py-0.5 text-xs font-bold rounded">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden md:block">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad Banner - Sidebar Middle (in content flow) */}
            <div className="py-4">
              <AdDisplay position="sidebar_middle" pageType="homepage" className="flex justify-center" />
            </div>

            {/* Latest News Section */}
            <div className="bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
                <Link href="/latest" className="text-red-600 hover:text-red-700 text-sm font-semibold">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestNews.slice(0, 6).map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group"
                  >
                    <div className="relative h-48 bg-gray-200 mb-2">
                      {article.featuredImageUrl && (
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      {isNew(article.publishedAt) && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold uppercase">
                            NEW
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {getRelativeTime(article.publishedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category Sections - Top 3 Categories with Most Stories */}
            {categories.length > 0 && Object.keys(categoryArticles).length > 0 && (
              <div className="space-y-4">
                {/* Sort categories by article count (most articles first) and take top 3 */}
                {[...categories]
                  .sort((a: any, b: any) => (b._count?.articles || 0) - (a._count?.articles || 0))
                  .slice(0, 3)
                  .map((category: any) => {
                    const articles = categoryArticles[category.slug] || [];
                    if (articles.length === 0) return null;

                    return (
                      <div key={category.id} className="bg-white shadow-sm p-4">
                        {/* Category Heading */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-red-600">
                          <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                          <Link
                            href={`/category/${category.slug}`}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                          >
                            More →
                          </Link>
                        </div>
                        {/* Top 3 Articles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {articles.slice(0, 3).map((article: Article) => (
                            <Link
                              key={article.id}
                              href={`/articles/${article.slug}`}
                              className="group"
                            >
                              <div className="relative h-32 bg-gray-200 rounded overflow-hidden mb-2">
                                {article.featuredImageUrl && (
                                  <Image
                                    src={article.featuredImageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                )}
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(article.publishedAt).toLocaleDateString()}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sidebar Column - 1/3 width - Sticky */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4 lg:max-h-screen lg:overflow-y-auto">
            {/* Sidebar Top Ad - Desktop only */}
            <div className="hidden lg:block">
              <AdDisplay position="sidebar_top" pageType="homepage" className="flex justify-center" />
            </div>
            
            {/* Popular Stories */}
            <div className="bg-white shadow-sm p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600">
                Top Stories
              </h2>
              <div className="space-y-3">
                {popularStories.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="flex gap-3 group hover:bg-gray-50 p-2 -mx-2 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 group-hover:text-red-600 line-clamp-3 transition-colors">
                        {article.excerpt || article.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📧 Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-4">Subscribe to our newsletter for daily updates</p>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded border border-gray-300 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all">
                Subscribe
              </button>
            </div>

            {/* Social Media Widget */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🌐</span> Follow Us
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Facebook', color: 'bg-blue-600' },
                  { name: 'Twitter', color: 'bg-sky-500' },
                  { name: 'Instagram', color: 'bg-pink-600' },
                  { name: 'YouTube', color: 'bg-red-600' }
                ].map((social) => (
                  <a key={social.name} href="#" className={`flex items-center justify-between p-3 ${social.color} text-white rounded hover:opacity-90 transition-all`}>
                    <span className="text-sm font-semibold">{social.name}</span>
                    <span className="text-xs">Follow →</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sidebar Bottom Ad - Desktop only */}
            <div className="hidden lg:block">
              <AdDisplay position="sidebar_bottom" pageType="homepage" className="flex justify-center" />
            </div>
          </div>
        </div>

        {/* Full Width Ad Banner - Bottom (Contained) */}
        <div className="py-4 mt-8">
          <div className="flex justify-center max-w-full overflow-hidden">
            <AdDisplay position="content_bottom" pageType="homepage" className="" />
          </div>
        </div>


      </div>
    </div>
  );
}
