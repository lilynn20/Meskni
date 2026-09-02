import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getMessages, replyToMessage } from '../api/messages'
import { useAuth } from '../hooks/useAuth'
import type { Conversation } from '../types/message'

export function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    void getMessages()
      .then(setConversations)
      .catch((requestError: unknown) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load messages right now.'))
      .finally(() => setLoading(false))
  }, [])

  async function sendReply(conversation: Conversation) {
    const body = reply[conversation.thread_id]?.trim()
    const lastMessage = conversation.messages.at(-1)
    if (!body || !lastMessage) return
    setSending(conversation.thread_id)
    setError(null)
    try {
      const newMessage = await replyToMessage(lastMessage.id, body)
      setConversations((current) => current.map((item) => item.thread_id === conversation.thread_id ? { ...item, messages: [...item.messages, newMessage] } : item))
      setReply((current) => ({ ...current, [conversation.thread_id]: '' }))
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to send your reply.')
    } finally {
      setSending(null)
    }
  }

  if (loading) return <main className="page-state">Loading messages...</main>

  return <main className="messages-page site-shell"><nav className="topbar" aria-label="Messages navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav><header className="messages-header"><p className="eyebrow">Your conversations</p><h1>Keep the conversation going.</h1><p className="welcome-copy">Questions, answers, and the details that help a move come together.</p></header>{error && <p className="form-error" role="alert">{error}</p>}{!error && conversations.length === 0 && <section className="saved-empty"><span className="empty-heart" aria-hidden="true">□</span><h2>No messages yet.</h2><p>When you find the right place, you can contact its owner here.</p><Link className="button button-dark" to="/listings">Browse listings</Link></section>}<div className="conversation-list">{conversations.map((conversation) => <article className="conversation-card" key={conversation.thread_id}><div className="conversation-heading"><div><p className="listing-location">{conversation.listing.city} · {conversation.listing.neighborhood}</p><h2>{conversation.listing.title}</h2></div><span className="participant-name">{conversation.participant.name}</span></div><div className="message-list">{conversation.messages.map((message) => <div className={message.sender_id === user?.id ? 'message-bubble own' : 'message-bubble'} key={message.id}><p>{message.body}</p><small>{message.sender_id === user?.id ? 'You' : conversation.participant.name}</small></div>)}</div><div className="reply-row"><textarea rows={2} value={reply[conversation.thread_id] ?? ''} onChange={(event) => setReply((current) => ({ ...current, [conversation.thread_id]: event.target.value }))} placeholder="Write a reply..." /><button className="button button-dark" type="button" disabled={sending === conversation.thread_id || !reply[conversation.thread_id]?.trim()} onClick={() => void sendReply(conversation)}>{sending === conversation.thread_id ? 'Sending...' : 'Reply'}</button></div></article>)}</div></main>
}