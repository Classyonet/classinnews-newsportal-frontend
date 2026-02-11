"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
const API_URL = `${API_BASE}/api`

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')

        // Store auth token if provided
        if (data.token) {
          localStorage.setItem('reader_token', data.token)
          localStorage.setItem('reader_user', JSON.stringify(data.user))
        }

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to verify email. Please try again.')
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setResendEmail('')
      } else {
        alert(data.message || 'Failed to resend verification email')
      }
    } catch (error) {
      alert('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Email Verification
              </h1>
              <p className="text-gray-600">Verify your email address to continue</p>
            </div>

            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 text-red-600 animate-spin mb-4" />
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-20 w-20 text-green-600 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h3>
                  <p className="text-center text-gray-600 mb-4">{message}</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">You're all set!</h3>
                      <p className="mt-2 text-sm text-green-700">
                        Your account is now active. You can start reading news, bookmarking articles, and engaging with content.
                      </p>
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        Redirecting you to the homepage...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                      Go to Homepage
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <XCircle className="h-20 w-20 text-red-600 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
                  <p className="text-center text-gray-600 mb-4">{message}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Need a new verification link?</h3>
                      <p className="mt-2 text-sm text-blue-700 mb-4">
                        Enter your email address below to receive a new verification link.
                      </p>

                      {resendSuccess ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-700">✓ Verification email sent! Check your inbox.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleResendVerification} className="space-y-3">
                          <input
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={resending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resending ? (
                              <span className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </span>
                            ) : (
                              'Resend Verification Email'
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/login">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors">
                      Back to Login
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
