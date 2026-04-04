'use client'

import { NEWS_API_ROOT } from './api-config'

export type ReaderUser = {
  id: string
  email?: string | null
  username?: string | null
  phoneNumber?: string | null
  role?: string | null
  authProvider?: string | null
  avatarUrl?: string | null
  createdAt?: string | null
  lastLoginAt?: string | null
  isVerified?: boolean
}

export const READER_AUTH_EVENT = 'reader-auth-changed'
const READER_USER_KEY = 'reader_user'
const LEGACY_READER_TOKEN_KEY = 'reader_token'

export function getStoredReaderUser(): ReaderUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(READER_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ReaderUser
  } catch {
    window.localStorage.removeItem(READER_USER_KEY)
    return null
  }
}

function notifyReaderAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(READER_AUTH_EVENT))
  }
}

export function storeReaderUser(user: ReaderUser) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(READER_USER_KEY, JSON.stringify(user))
  window.localStorage.removeItem(LEGACY_READER_TOKEN_KEY)
  notifyReaderAuthChanged()
}

export function clearStoredReaderSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(READER_USER_KEY)
  window.localStorage.removeItem(LEGACY_READER_TOKEN_KEY)
  notifyReaderAuthChanged()
}

export async function fetchCurrentReader(): Promise<ReaderUser | null> {
  try {
    const response = await fetch(`${NEWS_API_ROOT}/auth/me`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearStoredReaderSession()
      }
      return null
    }

    const data = await response.json()
    const user = (data?.user || data?.data?.user || data?.data) as ReaderUser | undefined
    if (!user?.id) {
      return null
    }

    storeReaderUser(user)
    return user
  } catch {
    return getStoredReaderUser()
  }
}

export async function logoutReaderSession() {
  try {
    await fetch(`${NEWS_API_ROOT}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Clear local state even if the network call fails.
  } finally {
    clearStoredReaderSession()
  }
}

export async function readerAuthFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = input.startsWith('http://') || input.startsWith('https://')
    ? input
    : `${NEWS_API_ROOT}${input.startsWith('/') ? input : `/${input}`}`

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers || {}),
    },
  })
}
