"use client"

import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; avatarUrl?: string }
  replies?: Comment[]
}

export default function ArticleComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/articles/${slug}/comments`)
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Load comments error', err)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [slug])

  const postComment = async () => {
    const token = localStorage.getItem('reader_token')
    if (!token) {
      alert('Please login to post a comment')
      return
    }
    if (!newComment.trim()) return
    try {
      const res = await fetch(`${API_URL}/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newComment })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post')
      setNewComment('')
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to post comment')
    }
  }

  if (loading) return <div className="py-6 text-center text-gray-500">Loading comments...</div>

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      <div className="space-y-4">
        {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet. Be the first to comment.</div>}
        {comments.map(c => (
          <div key={c.id} className="p-4 bg-gray-50 rounded">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">{c.user.username.charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-sm font-semibold">{c.user.username}</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-2 text-gray-800">{c.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full border p-3 rounded" rows={4} placeholder="Write a comment..." />
        <div className="mt-2 flex justify-end">
          <button onClick={postComment} className="bg-red-600 text-white px-4 py-2 rounded">Post Comment</button>
        </div>
      </div>
    </div>
  )
}
