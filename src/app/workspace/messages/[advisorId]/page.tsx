'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

type Message = {
  id: string
  sender_role: 'client' | 'advisor'
  content: string
  created_at: string
  advisor_name: string
}

const DARK = '#0B2140'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdvisorThreadPage() {
  const { advisorId } = useParams<{ advisorId: string }>()
  const searchParams = useSearchParams()
  const advisorName = searchParams.get('name') ?? 'Advisor'
  const advisorTitle = searchParams.get('title') ?? 'Business Advisor'
  const orderId = searchParams.get('order_id') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [advisorId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    setLoading(true)
    try {
      const res = await fetch(`/api/workspace/messages?advisor_id=${advisorId}`)
      if (res.ok) {
        const d = await res.json()
        setMessages(d.messages ?? [])
      }
    } catch { /* non-blocking */ }
    setLoading(false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    // Optimistically add client message
    const tempId = `temp_${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      sender_role: 'client',
      content,
      created_at: new Date().toISOString(),
      advisor_name: advisorName,
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/workspace/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, advisor_id: advisorId, advisor_name: advisorName, advisor_title: advisorTitle, content }),
      })
      if (res.ok) {
        const d = await res.json()
        // Replace temp message with real + add advisor reply
        setMessages(prev => {
          const without = prev.filter(m => m.id !== tempId)
          const appended = [
            ...(d.clientMessage ? [d.clientMessage] : []),
            ...(d.advisorReply ? [d.advisorReply] : []),
          ]
          return [...without, ...appended]
        })
      }
    } catch { /* non-blocking */ }
    setSending(false)
  }

  // Group messages by date
  function groupByDate(msgs: Message[]) {
    const groups: { date: string; messages: Message[] }[] = []
    for (const msg of msgs) {
      const dateLabel = formatDate(msg.created_at)
      const last = groups[groups.length - 1]
      if (last && last.date === dateLabel) {
        last.messages.push(msg)
      } else {
        groups.push({ date: dateLabel, messages: [msg] })
      }
    }
    return groups
  }

  const groups = groupByDate(messages)

  return (
    <div className="flex flex-col h-full max-h-screen">

      {/* Thread header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-3 shrink-0">
        <Link href="/workspace/messages" className="text-gray-400 hover:text-gray-600 transition mr-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <img
          src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisorName)}&backgroundColor=0B2140`}
          alt={advisorName}
          className="w-9 h-9 rounded-full border border-gray-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900">{advisorName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-xs text-gray-400">{advisorTitle}</p>
          </div>
        </div>
        <Link
          href={`/workspace/documents?advisor_id=${advisorId}&advisor_name=${encodeURIComponent(advisorName)}&order_id=${orderId}`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Documents
        </Link>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-[#0B2140] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <img
              src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisorName)}&backgroundColor=0B2140`}
              alt={advisorName}
              className="w-14 h-14 rounded-full border-2 border-white shadow mb-3"
            />
            <p className="font-semibold text-gray-800 text-sm">{advisorName}</p>
            <p className="text-xs text-gray-400 mt-1">{advisorTitle}</p>
            <p className="text-xs text-gray-400 mt-3 max-w-xs">
              Send a message to start the conversation. Your advisor will respond shortly.
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <p className="text-[11px] text-gray-400 font-medium">{group.date}</p>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {group.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_role === 'client' ? 'justify-end' : 'justify-start'} gap-2.5`}>
                  {msg.sender_role === 'advisor' && (
                    <img
                      src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisorName)}&backgroundColor=0B2140`}
                      alt={advisorName}
                      className="w-7 h-7 rounded-full border border-gray-100 shrink-0 self-end"
                    />
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender_role === 'client'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                    }`}
                    style={msg.sender_role === 'client' ? { background: DARK } : {}}
                  >
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${msg.sender_role === 'client' ? 'text-white/50' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start gap-2.5">
            <img
              src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(advisorName)}&backgroundColor=0B2140`}
              alt={advisorName}
              className="w-7 h-7 rounded-full border border-gray-100 shrink-0 self-end"
            />
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 px-5 py-3.5 shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e as unknown as React.FormEvent)
              }
            }}
            placeholder={`Message ${advisorName.split(' ')[0]}…`}
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent transition"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40"
            style={{ background: DARK }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
      </form>
    </div>
  )
}
