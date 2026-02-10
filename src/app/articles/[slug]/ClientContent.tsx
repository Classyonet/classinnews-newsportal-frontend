'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, ThumbsUp, ThumbsDown, Facebook, Twitter, Linkedin, UserPlus, Users } from 'lucide-react';
import AdDisplay from '@/components/AdDisplay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  featuredImageUrl?: string | null;
  publishedAt: string;
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  authorId: string;
  // category can be null if an article was created without one
  category?: {
    name: string;
    slug: string;
    color: string;
  } | null;
  author: {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string | null;
  };
  tags: string[];
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    liked?: boolean;
    user: {
      id: string;
      username: string;
      avatarUrl?: string | null;
    };
    replies?: Array<{
      id: string;
      content: string;
      createdAt: string;
      likesCount: number;
      liked?: boolean;
      user: {
        id: string;
        username: string;
        avatarUrl?: string | null;
      };
    }>;
  }>;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('reader_token');
    const userStr = localStorage.getItem('reader_user');
    if (token && userStr) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!slug) return;

    // Fetch article details
    fetch(`${API_URL}/api/articles/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(data => {
        // Backend returns article directly, not wrapped
        setArticle(data);
        
        // Set comments if available
        if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
          // Auto-open comments section if there are comments
          if (data.comments.length > 0) {
            setShowComments(true);
          }
        }
        
        // If authenticated, fetch like and follow status
        if (isAuthenticated) {
          const token = localStorage.getItem('reader_token');
          
          // Fetch like status
          fetch(`${API_URL}/api/articles/${data.id}/like-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(likeData => setLiked(likeData.liked))
            .catch(err => console.error('Error fetching like status:', err));
          
          // Fetch follow status
          fetch(`${API_URL}/api/users/${data.author.id}/follow-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(followData => {
              setIsFollowing(followData.following);
              setFollowersCount(followData.followersCount);
            })
            .catch(err => console.error('Error fetching follow status:', err));
        }
        
        // Fetch related articles
        return fetch(`${API_URL}/api/articles/${slug}/related?limit=4`);
      })
      .then(res => res.json())
      .then(data => {
        // Backend returns array directly, not wrapped in object
        console.log('Related articles data:', data);
        const articles = Array.isArray(data) ? data : [];
        console.log('Setting related articles:', articles);
        setRelatedArticles(articles);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug, isAuthenticated]);

  // Handle Like - Allow unlimited likes, with unlike option
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like articles');
      router.push('/login');
      return;
    }

    console.log('🔄 Attempting to like article:', article?.id);

    try {
      const token = localStorage.getItem('reader_token');
      console.log('📝 Token exists:', !!token);
      
      const res = await fetch(`${API_URL}/api/articles/${article?.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', res.status);
      const data = await res.json();
      console.log('📊 Response data:', data);

      if (res.ok) {
        setLiked(data.liked);
        if (article) {
          setArticle({
            ...article,
            likesCount: data.likesCount
          });
        }
      } else {
        alert(`Failed to like article: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('❌ Failed to like article:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle Share
  const handleShare = async (platform?: string) => {
    if (!isAuthenticated) {
      alert('Please login to share articles');
      router.push('/login');
      return;
    }

    console.log('🔄 Attempting to share article:', article?.id, 'platform:', platform);

    try {
      const token = localStorage.getItem('reader_token');
      const res = await fetch(`${API_URL}/api/articles/${article?.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform: platform || 'direct' })
      });

      console.log('📊 Share response status:', res.status);
      const data = await res.json();
      console.log('📊 Share response data:', data);

      if (res.ok && article) {
        setArticle({
          ...article,
          sharesCount: article.sharesCount + 1
        });

        // If platform specific, open share dialog
        if (platform && article) {
          const shareUrl = `${window.location.origin}/articles/${article.slug}`;
          const shareText = article.title;

          switch(platform) {
            case 'facebook':
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
              break;
            case 'twitter':
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
              break;
            case 'linkedin':
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
              break;
          }
        }
        alert(`Shared on ${platform || 'platform'}!`);
      } else {
        alert(`Failed to share: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('❌ Failed to share article:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle Follow
  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please login to follow authors');
      router.push('/login');
      return;
    }

    console.log('🔄 Attempting to follow author:', article?.author.id);

    try {
      const token = localStorage.getItem('reader_token');
      const res = await fetch(`${API_URL}/api/users/${article?.author.id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Follow response status:', res.status);
      const data = await res.json();
      console.log('📊 Follow response data:', data);

      if (res.ok) {
        setIsFollowing(data.following);
        setFollowersCount(data.followersCount);
      } else {
        alert(`Failed to follow: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('❌ Failed to follow author:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Article not found</p>
          <Link href="/" className="text-red-600 hover:text-red-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Banner Ad - Desktop only */}
      <div className="hidden md:block bg-white border-b border-gray-200 py-3">
        <AdDisplay position="top" pageType="article" className="flex justify-center" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <article className="bg-white shadow-sm p-6 lg:p-8">
              {/* Category Badge - Enhanced Styling */}
              {article.category ? (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-sm font-bold uppercase mb-4 rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {article.category.name}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 text-sm font-bold uppercase mb-4 rounded-full shadow-md">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Uncategorized
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta Information - Enhanced Styling with Follow Button */}
              <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {article.author.avatarUrl ? (
                      <Image
                        src={article.author.avatarUrl}
                        alt={article.author.name || article.author.username || ''}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-red-200 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg border-2 border-red-200 shadow-md">
                        {(article.author.name || article.author.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 hover:text-red-600 transition-colors cursor-pointer">
                        {article.author.name || article.author.username}
                      </p>
                      {isAuthenticated && (
                        <button
                          onClick={handleFollow}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            isFollowing 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                              : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-sm'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Users className="w-3 h-3" />
                              Followers ({followersCount})
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{article.viewsCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Featured Image */}
              {article.featuredImageUrl && (
                <div className="relative w-full h-96 mb-6 bg-gray-200">
                  <Image
                    src={article.featuredImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Inline Ad 2 - After content, desktop only */}
              <div className="hidden md:block my-8 py-4 bg-gray-50 border-y border-gray-200">
                <AdDisplay position="inline_2" pageType="article" className="flex justify-center" />
              </div>

              {/* Like, Comment, Share Buttons - Only visible to authenticated users */}
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200 mb-8">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-sm hover:shadow-md ${
                        liked 
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 border border-red-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${liked ? 'fill-red-600' : ''}`} />
                      <span>{article.likesCount}</span>
                    </button>

                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-semibold border border-gray-200 shadow-sm hover:shadow-md"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </button>

                    <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                      <Share2 className="h-5 w-5" />
                      <span>{article.sharesCount} Shares</span>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Share this article:</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Facebook className="h-4 w-4" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button 
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Message for non-authenticated users */}
              {!isAuthenticated && (
                <div className="py-8 border-t border-b border-gray-200 mb-8">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 text-center">
                    <Heart className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Like, Comment & Share</h3>
                    <p className="text-gray-600 mb-4">Join our community to interact with this article and connect with other readers</p>
                    <div className="flex gap-3 justify-center">
                      <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">
                        Sign In
                      </Link>
                      <Link href="/register" className="px-6 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {showComments && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
                  <div className="mb-6">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      rows={4}
                    />
                    <button 
                      onClick={async () => {
                        if (!commentText.trim()) {
                          alert('Please write a comment');
                          return;
                        }
                        
                        try {
                          const token = localStorage.getItem('reader_token');
                          const res = await fetch(`${API_URL}/api/articles/${article?.id}/comments`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ content: commentText })
                          });
                          
                          const data = await res.json();
                          
                          if (res.ok) {
                            alert('Comment posted successfully!');
                            setCommentText('');
                            // Reload article to show new comment
                            window.location.reload();
                          } else {
                            if (data.prohibitedWords && data.prohibitedWords.length > 0) {
                              alert(`⚠️ Your comment contains inappropriate language.\n\nProhibited words: ${data.prohibitedWords.join(', ')}\n\nPlease remove these words and try again.`);
                            } else {
                              alert(`Failed to post comment: ${data.error || 'Unknown error'}`);
                            }
                          }
                        } catch (err: any) {
                          alert(`Error: ${err.message}`);
                        }
                      }}
                      className="mt-3 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Post Comment
                    </button>
                  </div>
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                              {comment.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{comment.user.username}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                              
                              {/* Action Buttons: Like and Reply */}
                              <div className="flex items-center gap-4 mt-2">
                                {/* Like Button */}
                                {isAuthenticated && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem('reader_token');
                                        const res = await fetch(`${API_URL}/api/comments/${comment.id}/like`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                          }
                                        });
                                        
                                        const data = await res.json();
                                        
                                        if (res.ok) {
                                          // Update the comment likes count in state
                                          setComments(comments.map(c => 
                                            c.id === comment.id 
                                              ? { ...c, likesCount: data.likesCount, liked: data.liked }
                                              : c
                                          ));
                                        } else {
                                          alert(`Failed to like comment: ${data.error || 'Unknown error'}`);
                                        }
                                      } catch (err: any) {
                                        alert(`Error: ${err.message}`);
                                      }
                                    }}
                                    className={`text-sm font-semibold flex items-center gap-1 ${
                                      comment.liked 
                                        ? 'text-red-600' 
                                        : 'text-gray-600 hover:text-red-600'
                                    }`}
                                  >
                                    <ThumbsUp className={`h-4 w-4 ${comment.liked ? 'fill-red-600' : ''}`} />
                                    <span>{comment.likesCount || 0}</span>
                                  </button>
                                )}

                                {/* Reply Button - Only show for OTHER readers' comments */}
                                {isAuthenticated && currentUser && (() => {
                                  const isOwnComment = String(comment.user.id) === String(currentUser.id);
                                  console.log('Comment check:', {
                                    commentUserId: comment.user.id,
                                    commentUsername: comment.user.username,
                                    currentUserId: currentUser.id,
                                    currentUsername: currentUser.username,
                                    isOwnComment,
                                    shouldShowReply: !isOwnComment
                                  });
                                  return !isOwnComment;
                                })() && (
                                  <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-sm text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                  </button>
                                )}
                              </div>

                              {/* Reply Form */}
                              {replyingTo === comment.id && (
                                <div className="mt-3 mb-3">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                    rows={3}
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!replyText.trim()) {
                                        alert('Please write a reply');
                                        return;
                                      }
                                      
                                      try {
                                        const token = localStorage.getItem('reader_token');
                                        const res = await fetch(`${API_URL}/api/articles/${article?.id}/comments`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({ 
                                            content: replyText,
                                            parentId: comment.id
                                          })
                                        });
                                        
                                        const data = await res.json();
                                        
                                        if (res.ok) {
                                          alert('Reply posted successfully!');
                                          setReplyText('');
                                          setReplyingTo(null);
                                          window.location.reload();
                                        } else {
                                          if (data.prohibitedWords && data.prohibitedWords.length > 0) {
                                            alert(`⚠️ Your reply contains inappropriate language.\n\nProhibited words: ${data.prohibitedWords.join(', ')}\n\nPlease remove these words and try again.`);
                                          } else {
                                            alert(`Failed to post reply: ${data.error || 'Unknown error'}`);
                                          }
                                        }
                                      } catch (err: any) {
                                        alert(`Error: ${err.message}`);
                                      }
                                    }}
                                    className="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                                  >
                                    Post Reply
                                  </button>
                                </div>
                              )}
                              
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 ml-6 space-y-3 border-l-2 border-gray-300 pl-4">
                                  {comment.replies.map((reply: any) => (
                                    <div key={reply.id} className="bg-white rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                          {reply.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-900">{reply.user.username}</span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(reply.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700">{reply.content}</p>
                                          
                                          {/* Like Button for Replies */}
                                          {isAuthenticated && (
                                            <button
                                              onClick={async () => {
                                                try {
                                                  const token = localStorage.getItem('reader_token');
                                                  const res = await fetch(`${API_URL}/api/comments/${reply.id}/like`, {
                                                    method: 'POST',
                                                    headers: {
                                                      'Authorization': `Bearer ${token}`,
                                                      'Content-Type': 'application/json'
                                                    }
                                                  });
                                                  
                                                  const data = await res.json();
                                                  
                                                  if (res.ok) {
                                                    // Update the reply likes count in state
                                                    setComments(comments.map(c => 
                                                      c.id === comment.id 
                                                        ? {
                                                            ...c,
                                                            replies: c.replies?.map((r: any) =>
                                                              r.id === reply.id
                                                                ? { ...r, likesCount: data.likesCount, liked: data.liked }
                                                                : r
                                                            )
                                                          }
                                                        : c
                                                    ));
                                                  } else {
                                                    alert(`Failed to like reply: ${data.error || 'Unknown error'}`);
                                                  }
                                                } catch (err: any) {
                                                  alert(`Error: ${err.message}`);
                                                }
                                              }}
                                              className={`mt-1 text-xs font-semibold flex items-center gap-1 ${
                                                reply.liked 
                                                  ? 'text-red-600' 
                                                  : 'text-gray-600 hover:text-red-600'
                                              }`}
                                            >
                                              <ThumbsUp className={`h-3 w-3 ${reply.liked ? 'fill-red-600' : ''}`} />
                                              <span>{reply.likesCount || 0}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tags - Enhanced Styling */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-900">Tags:</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-pink-50 border border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <span className="text-red-400 group-hover:text-red-600">#</span>
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Similar Articles Section - Enhanced Styling */}
            {relatedArticles.length > 0 && (
              <div className="mt-8 bg-white shadow-sm p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gradient-to-r from-red-600 to-pink-600">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-pink-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Similar Articles
                  </h2>
                  <svg className="w-6 h-6 text-red-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/articles/${relatedArticle.slug}`}
                      className="group block bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-300 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-gray-200">
                        {relatedArticle.featuredImageUrl && (
                          <Image
                            src={relatedArticle.featuredImageUrl}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mb-2 transition-colors">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {new Date(relatedArticle.publishedAt).toLocaleDateString()}
                          </p>
                          <span className="text-red-600 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Read more
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sidebar Top Ad - Desktop only, sticky */}
            <div className="hidden lg:block lg:sticky lg:top-6">
              <AdDisplay position="sidebar_top" pageType="article" className="flex justify-center mb-6" />
              
              {/* Optional: Sidebar Bottom Ad with spacing */}
              <div className="mt-6">
                <AdDisplay position="sidebar_bottom" pageType="article" className="flex justify-center" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad - Desktop only */}
        <div className="hidden md:block mt-8 py-4 bg-white border-y border-gray-200">
          <AdDisplay position="bottom" pageType="article" className="flex justify-center" />
        </div>
      </div>
    </div>
  );
}
