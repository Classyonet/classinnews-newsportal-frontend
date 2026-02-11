"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
const API_URL = `${API_BASE}/api`

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your login...')

  useEffect(() => {
    const token = searchParams.get('token')
    const provider = searchParams.get('provider')
    const isNew = searchParams.get('isNew')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(error.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    if (!token) {
      setStatus('error')
      setMessage('No authentication token received')
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    // Store the token
    localStorage.setItem('reader_token', token)

    // Fetch user data
    fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user || data.data?.user) {
          const user = data.user || data.data.user
          localStorage.setItem('reader_user', JSON.stringify(user))
          setStatus('success')
          setMessage(`Welcome${isNew === 'true' ? '' : ' back'}, ${user.username || user.email}!`)
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        } else {
          throw new Error('Failed to get user data')
        }
      })
      .catch(err => {
        console.error('Error fetching user:', err)
        setStatus('error')
        setMessage('Failed to complete login. Please try again.')
        setTimeout(() => router.push('/login'), 3000)
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecting you to the homepage...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
