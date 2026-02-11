/**
 * Client-side Cache Manager for ClassInNews Newsportal
 * 
 * Provides localStorage-based caching for API responses with:
 * - Configurable TTL per content type (controlled from admin dashboard)
 * - Cache versioning for instant purge capability
 * - Automatic stale data cleanup
 */

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'
const CACHE_PREFIX = 'cin_cache_'
const CACHE_SETTINGS_KEY = 'cin_cache_settings'
const CACHE_SETTINGS_FETCH_INTERVAL = 300000 // Refetch cache settings every 5 minutes

export type CacheCategory = 
  | 'homepage' 
  | 'articles' 
  | 'article_detail' 
  | 'categories' 
  | 'media' 
  | 'settings'

interface CacheEntry {
  data: any
  timestamp: number
  version: number
}

interface CacheSettings {
  cache_enabled: boolean
  cache_ttl_homepage: number
  cache_ttl_articles: number
  cache_ttl_article_detail: number
  cache_ttl_categories: number
  cache_ttl_media: number
  cache_ttl_settings: number
  cache_version: number
  cache_cleared_at: string
  _fetchedAt: number
}

const DEFAULT_SETTINGS: CacheSettings = {
  cache_enabled: true,
  cache_ttl_homepage: 300,
  cache_ttl_articles: 600,
  cache_ttl_article_detail: 900,
  cache_ttl_categories: 1800,
  cache_ttl_media: 3600,
  cache_ttl_settings: 1800,
  cache_version: 1,
  cache_cleared_at: '',
  _fetchedAt: 0
}

let settingsPromise: Promise<CacheSettings> | null = null

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__cin_test__'
    localStorage.setItem(test, '1')
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Fetch cache settings from admin backend (with its own caching)
 */
async function fetchCacheSettings(): Promise<CacheSettings> {
  if (!isLocalStorageAvailable()) return DEFAULT_SETTINGS
  
  // Check if we have recent settings in localStorage
  try {
    const stored = localStorage.getItem(CACHE_SETTINGS_KEY)
    if (stored) {
      const parsed: CacheSettings = JSON.parse(stored)
      if (Date.now() - parsed._fetchedAt < CACHE_SETTINGS_FETCH_INTERVAL) {
        return parsed
      }
    }
  } catch {}

  // Fetch fresh settings from admin backend
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/settings/public/cache`)
    if (!res.ok) return getCachedOrDefaultSettings()
    
    const data = await res.json()
    if (!data.success || !data.data) return getCachedOrDefaultSettings()

    const settings: CacheSettings = { ...DEFAULT_SETTINGS, _fetchedAt: Date.now() }
    
    for (const item of data.data) {
      switch (item.key) {
        case 'cache_enabled':
          settings.cache_enabled = item.value === 'true'
          break
        case 'cache_ttl_homepage':
          settings.cache_ttl_homepage = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_homepage
          break
        case 'cache_ttl_articles':
          settings.cache_ttl_articles = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_articles
          break
        case 'cache_ttl_article_detail':
          settings.cache_ttl_article_detail = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_article_detail
          break
        case 'cache_ttl_categories':
          settings.cache_ttl_categories = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_categories
          break
        case 'cache_ttl_media':
          settings.cache_ttl_media = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_media
          break
        case 'cache_ttl_settings':
          settings.cache_ttl_settings = parseInt(item.value) || DEFAULT_SETTINGS.cache_ttl_settings
          break
        case 'cache_version':
          settings.cache_version = parseInt(item.value) || DEFAULT_SETTINGS.cache_version
          break
        case 'cache_cleared_at':
          settings.cache_cleared_at = item.value || ''
          break
      }
    }

    // Check if admin triggered a cache clear — compare with last known clear timestamp
    if (settings.cache_cleared_at) {
      const lastKnownClear = localStorage.getItem('cin_last_clear') || ''
      if (settings.cache_cleared_at !== lastKnownClear) {
        // Admin cleared cache since our last check — purge all cached data
        clearAllCacheEntries()
        localStorage.setItem('cin_last_clear', settings.cache_cleared_at)
      }
    }

    localStorage.setItem(CACHE_SETTINGS_KEY, JSON.stringify(settings))
    return settings
  } catch {
    return getCachedOrDefaultSettings()
  }
}

function getCachedOrDefaultSettings(): CacheSettings {
  try {
    const stored = localStorage.getItem(CACHE_SETTINGS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_SETTINGS
}

/**
 * Get cache settings (singleton promise to avoid multiple concurrent fetches)
 */
async function getCacheSettings(): Promise<CacheSettings> {
  if (!settingsPromise) {
    settingsPromise = fetchCacheSettings().finally(() => {
      // Allow refetch after the interval
      setTimeout(() => { settingsPromise = null }, CACHE_SETTINGS_FETCH_INTERVAL)
    })
  }
  return settingsPromise
}

function getTTLForCategory(settings: CacheSettings, category: CacheCategory): number {
  const key = `cache_ttl_${category}` as keyof CacheSettings
  const value = settings[key]
  return typeof value === 'number' ? value : 0
}

function getCacheKey(url: string): string {
  return CACHE_PREFIX + btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 60)
}

/**
 * Get cached data if valid
 */
function getFromCache(url: string, ttlSeconds: number, cacheVersion: number): any | null {
  if (!isLocalStorageAvailable() || ttlSeconds <= 0) return null
  
  try {
    const key = getCacheKey(url)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    const entry: CacheEntry = JSON.parse(stored)
    
    // Check version - if admin purged cache, version will be higher
    if (entry.version < cacheVersion) {
      localStorage.removeItem(key)
      return null
    }
    
    // Check TTL
    const age = (Date.now() - entry.timestamp) / 1000
    if (age > ttlSeconds) {
      localStorage.removeItem(key)
      return null
    }
    
    return entry.data
  } catch {
    return null
  }
}

/**
 * Store data in cache
 */
function setInCache(url: string, data: any, cacheVersion: number): void {
  if (!isLocalStorageAvailable()) return
  
  try {
    const key = getCacheKey(url)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: cacheVersion
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (e) {
    // Storage full - clean old entries and retry
    cleanupCache()
    try {
      const key = getCacheKey(url)
      const entry: CacheEntry = { data, timestamp: Date.now(), version: cacheVersion }
      localStorage.setItem(key, JSON.stringify(entry))
    } catch {}
  }
}

/**
 * Remove old cache entries to free up space
 */
function cleanupCache(): void {
  if (!isLocalStorageAvailable()) return
  
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  
  // Remove oldest half of cache entries
  const entries = keysToRemove.map(key => {
    try {
      const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '{}')
      return { key, timestamp: entry.timestamp || 0 }
    } catch {
      return { key, timestamp: 0 }
    }
  }).sort((a, b) => a.timestamp - b.timestamp)
  
  const removeCount = Math.max(Math.ceil(entries.length / 2), 1)
  entries.slice(0, removeCount).forEach(e => localStorage.removeItem(e.key))
}

/**
 * Cached fetch - main API for components
 * 
 * Usage:
 *   const data = await cachedFetch('/api/articles/trending?limit=6', 'homepage')
 *   // Returns cached data if valid, otherwise fetches fresh
 * 
 * @param url - Full URL to fetch
 * @param category - Cache category for TTL lookup
 * @param fetchOptions - Optional fetch options (headers etc)
 * @returns The JSON response data
 */
export async function cachedFetch(
  url: string, 
  category: CacheCategory,
  fetchOptions?: RequestInit
): Promise<any> {
  const settings = await getCacheSettings()
  
  // If caching is disabled, fetch directly
  if (!settings.cache_enabled) {
    const res = await fetch(url, fetchOptions)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    return res.json()
  }
  
  const ttl = getTTLForCategory(settings, category)
  
  // Check cache first
  const cached = getFromCache(url, ttl, settings.cache_version)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const res = await fetch(url, fetchOptions)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const data = await res.json()
  
  // Store in cache (only if TTL > 0)
  if (ttl > 0) {
    setInCache(url, data, settings.cache_version)
  }
  
  return data
}

/**
 * Cached fetch that returns a default value on error instead of throwing
 */
export async function cachedFetchSafe<T = any>(
  url: string, 
  category: CacheCategory,
  defaultValue: T,
  fetchOptions?: RequestInit
): Promise<T> {
  try {
    return await cachedFetch(url, category, fetchOptions)
  } catch {
    return defaultValue
  }
}

/**
 * Clear all cached data entries (preserves settings cache for efficiency)
 * Called automatically when admin triggers "Clear Cache"
 */
function clearAllCacheEntries(): void {
  if (!isLocalStorageAvailable()) return
  
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

/**
 * Clear all cache entries (useful for logout, manual refresh etc.)
 */
export function clearAllCache(): void {
  if (!isLocalStorageAvailable()) return
  
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith(CACHE_PREFIX) || key === CACHE_SETTINGS_KEY)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
  settingsPromise = null
}

/**
 * Clear cache for a specific URL
 */
export function clearCacheForUrl(url: string): void {
  if (!isLocalStorageAvailable()) return
  try {
    localStorage.removeItem(getCacheKey(url))
  } catch {}
}
