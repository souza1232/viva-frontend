'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPosts, createPost, replyPost } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import BottomNav from '../../components/BottomNav'

const THEMES = {
  corpo: { label: 'O Corpo', emoji: '🌿', color: '#6BAE75' },
  mente: { label: 'A Mente', emoji: '💭', color: '#7B6EA8' },
  vida_pratica: { label: 'Vida Prática', emoji: '🌟', color: '#E8A87C' },
  reinvencao: { label: 'Reinvenção', emoji: '🦋', color: '#C96A8A' },
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function ComunidadePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [currentTheme, setCurrentTheme] = useState('corpo')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [replyTarget, setReplyTarget] = useState(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState({})

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) loadPosts()
  }, [user])

  async function loadPosts() {
    setLoadingPosts(true)
    try {
      const { data } = await getPosts()
      setPosts(data.posts)
      setCurrentTheme(data.currentTheme)
    } catch {}
    finally { setLoadingPosts(false) }
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      if (replyTarget) await replyPost(replyTarget.id, content.trim())
      else await createPost(content.trim())
      setContent('')
      setShowModal(false)
      setReplyTarget(null)
      await loadPosts()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao publicar.')
    } finally { setSubmitting(false) }
  }

  const themeInfo = THEMES[currentTheme] || THEMES.corpo

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }} className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-text-main mb-2">👭 Comunidade</h1>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-bold"
          style={{ borderColor: themeInfo.color, color: themeInfo.color }}
        >
          {themeInfo.emoji} Esta semana: {themeInfo.label}
        </span>
      </div>

      {/* Posts */}
      <div className="px-4 py-4 space-y-4">
        {loadingPosts ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse">
              <div className="h-3 bg-border rounded w-1/3 mb-3" />
              <div className="h-3 bg-border rounded w-full mb-2" />
              <div className="h-3 bg-border rounded w-2/3" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">🌸</span>
            <p className="font-bold text-text-main">Seja a primeira a compartilhar!</p>
            <p className="text-text-secondary text-sm mt-1">Conta como está sendo esta semana.</p>
          </div>
        ) : (
          posts.map(post => {
            const theme = THEMES[post.theme] || THEMES.corpo
            const showReplies = expandedReplies[post.id]
            return (
              <div key={post.id} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: theme.color + '22', color: theme.color }}
                  >
                    {theme.emoji} {theme.label}
                  </span>
                  <span className="text-xs text-text-light">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-primary font-bold text-sm mb-1">{post.user.name.split(' ')[0]}</p>
                <p className="text-text-main text-sm leading-relaxed mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedReplies(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="text-xs text-text-secondary hover:text-primary transition"
                  >
                    💬 {post._count?.replies || post.replies?.length || 0} respostas
                  </button>
                  <button
                    onClick={() => { setReplyTarget(post); setShowModal(true) }}
                    className="bg-pink-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition"
                  >
                    Responder
                  </button>
                </div>
                {showReplies && post.replies?.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3 space-y-2">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-background rounded-xl p-3">
                        <p className="text-secondary font-bold text-xs mb-1">{reply.user.name.split(' ')[0]}</p>
                        <p className="text-text-main text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setReplyTarget(null); setShowModal(true) }}
        className="fixed bottom-20 right-5 bg-primary text-white font-bold px-5 py-3 rounded-full shadow-lg hover:bg-primary-dark transition"
      >
        + Compartilhar
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-text-main">
                {replyTarget ? `Responder: ${replyTarget.user.name.split(' ')[0]}` : 'Compartilhar com a comunidade'}
              </h3>
              <button onClick={() => { setShowModal(false); setReplyTarget(null); setContent('') }} className="text-text-light text-xl">✕</button>
            </div>
            {replyTarget && (
              <div className="bg-background border-l-4 border-primary rounded-xl p-3 mb-4">
                <p className="text-xs text-text-secondary italic">{replyTarget.content}</p>
              </div>
            )}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={replyTarget ? 'Sua resposta...' : 'Compartilhe como você está se sentindo...'}
              maxLength={2000}
              rows={4}
              autoFocus
              className="w-full border-2 border-border rounded-2xl px-4 py-3 text-sm text-text-main placeholder-text-light focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-right text-xs text-text-light mb-4">{content.length}/2000</p>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
