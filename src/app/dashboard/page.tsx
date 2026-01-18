'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, Calendar, Heart, Share2, MessageSquare, Users, Settings, ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    articlesLiked: 0,
    articlesShared: 0,
    commentsPosted: 0,
    followingCount: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('reader_token')
    const userStr = localStorage.getItem('reader_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      // TODO: Fetch user stats from backend
      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/login')
    }
  }, [router])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-gray-700 hover:text-red-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{currentUser?.username}</h2>
                <p className="text-sm text-gray-500 mt-1">Reader</p>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 border-t border-gray-100 pt-4">
                {currentUser?.email && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 truncate">{currentUser.email}</span>
                  </div>
                )}
                
                {currentUser?.phoneNumber && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{currentUser.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">Joined {formatDate(currentUser?.createdAt)}</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Link
                href="/dashboard/settings"
                className="mt-6 w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.articlesLiked}</span>
                </div>
                <p className="text-sm text-gray-600">Articles Liked</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Share2 className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.articlesShared}</span>
                </div>
                <p className="text-sm text-gray-600">Articles Shared</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.commentsPosted}</span>
                </div>
                <p className="text-sm text-gray-600">Comments</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.followingCount}</span>
                </div>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Welcome to ClassinNews! Start exploring articles and engage with content.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(currentUser?.createdAt)}</p>
                  </div>
                </div>

                {/* Placeholder for future activities */}
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No recent activity yet</p>
                  <Link href="/" className="text-red-600 hover:text-red-700 text-sm font-semibold mt-2 inline-block">
                    Explore Articles
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Browse Articles</p>
                    <p className="text-xs text-gray-500">Discover latest news</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Account Settings</p>
                    <p className="text-xs text-gray-500">Manage your profile</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
