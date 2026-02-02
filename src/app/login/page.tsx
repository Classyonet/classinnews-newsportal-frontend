"use client"

export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle, Phone } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
const API_URL = `${API_BASE}/api`

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [oauthProviders, setOauthProviders] = useState({ google: false, facebook: false, twitter: false })
  const router = useRouter()

  // Check for OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam) {
      setError(errorParam.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }

    // Fetch available OAuth providers
    fetch(`${API_URL}/auth/oauth-providers`)
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          setOauthProviders(data.providers)
        }
      })
      .catch(console.error)
  }, [])

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/auth/facebook`
  }

  const handleResendVerification = async () => {
    setResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
      } else {
        alert(data.message || 'Failed to resend verification email')
      }
    } catch (error) {
      alert('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Implement actual OTP sending
      console.log('📱 Sending OTP to:', phoneNumber)

      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      setOtpSent(true)
      alert('OTP sent to your phone number!')
    } catch (err: any) {
      console.error('❌ OTP error:', err)
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrorCode('')
    setResendSuccess(false)

    console.log('🔄 Starting login with method:', loginMethod)
    
    try {
      const url = `${API_URL}/auth/login`
      console.log('📡 Sending request to:', url)
      
      let requestBody: any = {};
      
      if (loginMethod === 'email') {
        if (!email || !password) {
          setError('Email and password are required')
          setLoading(false)
          return
        }
        requestBody = { email, password };
        console.log('📝 Email login:', email)
      } else if (loginMethod === 'phone') {
        if (!phoneNumber || !otp) {
          setError('Phone number and OTP are required')
          setLoading(false)
          return
        }
        // TODO: Implement OTP verification endpoint
        requestBody = { phoneNumber, otp, authProvider: 'phone' };
        console.log('📝 Phone login:', phoneNumber)
        
        // Temporary: Show message that OTP login is not yet implemented
        setError('OTP verification is not yet implemented on the backend. Please use email login.')
        setLoading(false)
        return
      } else if (loginMethod === 'social') {
        setError('Social login is not yet implemented')
        setLoading(false)
        return
      }
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📊 Response status:', res.status)
      const data = await res.json()
      console.log('📊 Response data:', data)

      if (!res.ok) {
        const err = new Error(data.error || data.message || 'Login failed')
        if (data.code) {
          setErrorCode(data.code)
        }
        throw err
      }
      
      // Store token and user
      const token = data.token || data.data?.token || ''
      const user = data.user || data.data?.user || {}
      
      console.log('💾 Storing token and user...')
      localStorage.setItem('reader_token', token)
      localStorage.setItem('reader_user', JSON.stringify(user))
      
      console.log('✅ Login successful! Redirecting...')
      
      // Show success message with better styling
      setLoading(false)
      setError('')
      
      // Create success overlay
      const successOverlay = document.createElement('div')
      successOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      successOverlay.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-bounce-in">
          <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
            <p class="text-gray-600 mb-1">Hello, <span class="font-semibold text-red-600">${user.username || 'Reader'}</span>!</p>
            <p class="text-sm text-gray-500">You have successfully logged in.</p>
            <p class="text-sm text-gray-400 mt-4">Redirecting you to the homepage...</p>
          </div>
        </div>
      `
      document.body.appendChild(successOverlay)
      
      // Redirect after 2.5 seconds - use window.location for full page refresh
      setTimeout(() => {
        document.body.removeChild(successOverlay)
        window.location.href = '/'
      }, 2500)
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-700 hover:text-red-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back to <span className="text-red-600">ClassinNews</span>
            </h1>
            <p className="text-gray-600">Sign in to access your personalized news experience</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                {errorCode === 'EMAIL_NOT_VERIFIED' && (
                  <div className="mt-3">
                    {resendSuccess ? (
                      <p className="text-sm text-green-600">
                        ✓ Verification email sent! Please check your inbox.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {resending ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Login Method Selection */}
            <div className="mb-6 flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone')
                  setOtpSent(false)
                  setOtp('')
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  loginMethod === 'phone'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Phone className="h-4 w-4 inline mr-2" />
                Phone
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('social')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  loginMethod === 'social'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Social
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Login */}
              {loginMethod === 'email' && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Phone Login (OTP-based) */}
              {loginMethod === 'phone' && (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                        placeholder="+1234567890"
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  ) : (
                    <div>
                      <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Social Login */}
              {loginMethod === 'social' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={!oauthProviders.google}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={!oauthProviders.facebook}
                    className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#0d65d9] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>

                  <button
                    type="button"
                    onClick={() => setError('Twitter login is coming soon')}
                    disabled={!oauthProviders.twitter}
                    className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Continue with Twitter
                  </button>
                </div>
              )}

              {/* Submit Button - only show for email and phone with OTP */}
              {(loginMethod === 'email' || (loginMethod === 'phone' && otpSent)) && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Extra Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/forgot-password" className="hover:text-red-600 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
