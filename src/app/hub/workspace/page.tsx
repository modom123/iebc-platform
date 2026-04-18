'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Advisor = {
  id: string
  name: string
  title: string
  deptName: string
  rate?: number
  negotiatedRate?: number
  bio?: string
  skills?: string[]
  exp?: string
}

type Message = { id: string; from: 'client' | 'advisor'; text: string; ts: Date }
type Tab = 'chat' | 'voice' | 'docs' | 'meetings' | 'email' | 'team'

const DARK = '#0B2140'
const GOLD = '#C9A02E'

const DEMO_ADVISORS: Advisor[] = [
  { id: 'f1', name: 'Marcus Webb',  title: 'CFO Advisor',      deptName: 'Finance & Accounting', rate: 2800, exp: '18 yrs', bio: 'Former Big 4 CFO who has helped 40+ companies scale from $1M to $20M ARR. Expert in financial modeling, fundraising, and exit strategy.', skills: ['Financial Modeling','Fundraising','Exit Strategy'] },
  { id: 'm1', name: 'Sofia Reyes',  title: 'Brand Strategist', deptName: 'Marketing & Sales',    rate: 2200, exp: '14 yrs', bio: 'Built brand identities for 80+ companies. Former creative director at Ogilvy. Expert in brand positioning and visual identity systems.', skills: ['Brand Identity','Positioning','Visual Design'] },
  { id: 't1', name: 'Alex Morgan',  title: 'CTO Advisor',      deptName: 'Technology',            rate: 3500, exp: '22 yrs', bio: 'Former CTO at two $100M+ companies. Expert in technology strategy, engineering org design, and scaling infrastructure.', skills: ['Tech Strategy','Engineering Orgs','Architecture'] },
]

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat',     label: 'Chat',      icon: '💬' },
  { id: 'voice',    label: 'Voice',     icon: '🎙️' },
  { id: 'docs',     label: 'Documents', icon: '📁' },
  { id: 'meetings', label: 'Meetings',  icon: '📅' },
  { id: 'email',    label: 'Email',     icon: '✉️' },
  { id: 'team',     label: 'Team',      icon: '👥' },
]

export default function AdvisorWorkspace() {
  const [advisors, setAdvisors]   = useState<Advisor[]>(DEMO_ADVISORS)
  const [selected, setSelected]   = useState<Advisor>(DEMO_ADVISORS[0])
  const [tab, setTab]             = useState<Tab>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Chat ──
  const [chats, setChats]     = useState<Record<string, Message[]>>({})
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)

  // ── Voice ──
  const [listening, setListening]   = useState(false)
  const [voiceText, setVoiceText]   = useState('')
  const [voiceReply, setVoiceReply] = useState('')
  const [speaking, setSpeaking]     = useState(false)
  const recRef = useRef<unknown>(null)

  // ── Documents ──
  const [docs, setDocs]       = useState<{ name: string; size: string; fileType: string; date: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Email ──
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' })
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('infra_cart')
      if (raw) {
        const data = JSON.parse(raw)
        const list: Advisor[] = data.contractors ?? data.advisors ?? []
        if (list.length > 0) { setAdvisors(list); setSelected(list[0]) }
      }
    } catch { /* use demo */ }
  }, [])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chats, selected.id])

  const messages = chats[selected.id] ?? []

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || thinking) return
    setInput('')
    const userMsg: Message = { id: Date.now().toString(), from: 'client', text: msg, ts: new Date() }
    const thread = [...messages, userMsg]
    setChats(c => ({ ...c, [selected.id]: thread }))
    setThinking(true)
    try {
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorName: selected.name,
          advisorTitle: selected.title,
          advisorDept: selected.deptName,
          message: msg,
          history: thread.slice(-12).map(m => ({ from: m.from === 'client' ? 'user' : 'advisor', text: m.text })),
        }),
      })
      const data = await res.json()
      const reply: Message = { id: (Date.now()+1).toString(), from: 'advisor', text: data.reply ?? "I'm temporarily unavailable.", ts: new Date() }
      setChats(c => ({ ...c, [selected.id]: [...thread, reply] }))
    } catch {
      setChats(c => ({ ...c, [selected.id]: [...thread, { id: Date.now().toString(), from: 'advisor', text: "I'm temporarily unavailable. Try again shortly.", ts: new Date() }] }))
    }
    setThinking(false)
  }

  function startVoice() {
    type SR = { new(): { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null } }
    const w = window as unknown as Record<string, unknown>
    const SRClass = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SR | undefined
    if (!SRClass) { alert('Voice input requires Chrome or Edge.'); return }
    const rec = new SRClass()
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US'
    recRef.current = rec
    rec.onresult = async (e) => {
      const transcript = e.results[0][0].transcript
      setVoiceText(transcript)
      setListening(false)
      setThinking(true)
      try {
        const res = await fetch('/api/advisor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advisorName: selected.name, advisorTitle: selected.title, advisorDept: selected.deptName, message: transcript, history: [] }),
        })
        const data = await res.json()
        const reply = data.reply ?? 'Sorry, I could not process that.'
        setVoiceReply(reply)
        setSpeaking(true)
        const utt = new SpeechSynthesisUtterance(reply)
        utt.rate = 0.95; utt.pitch = 1
        utt.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utt)
      } catch { setVoiceReply('Could not reach the advisor. Please try again.') }
      setThinking(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend   = () => setListening(false)
    rec.start(); setListening(true)
  }

  function stopAll() {
    (recRef.current as { stop(): void } | null)?.stop()
    window.speechSynthesis?.cancel()
    setListening(false); setSpeaking(false)
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      setDocs(d => [...d, { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', fileType: file.type || 'file', date: new Date().toLocaleDateString() }])
      setUploading(false)
    }, 900)
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault()
    setSendingEmail(true)
    await new Promise(r => setTimeout(r, 800))
    setSendingEmail(false)
    setEmailSent(true)
    setTimeout(() => { setEmailSent(false); setEmailForm({ to: '', subject: '', body: '' }) }, 3000)
  }

  const avatarUrl = (name: string) =>
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}&backgroundColor=0B2140`

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">

      {/* ── Advisor sidebar ── */}
      <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0`}>
        <div className="h-14 flex items-center px-4 gap-2 border-b border-gray-100" style={{ background: DARK }}>
          <Link href="/hub" className="text-blue-300 text-xs hover:text-white mr-1">←</Link>
          <p className="text-white font-bold text-sm">Advisor Workspace</p>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-white/60 hover:text-white text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">Your Advisors</p>
          {advisors.map(a => (
            <button key={a.id} onClick={() => { setSelected(a); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${selected.id === a.id ? 'bg-blue-50 border-r-2 border-[#0B2140]' : 'hover:bg-gray-50'}`}>
              <img src={avatarUrl(a.name)} alt={a.name} className="w-9 h-9 rounded-full border border-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${selected.id === a.id ? 'text-[#0B2140]' : 'text-gray-800'}`}>{a.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{a.title}</p>
              </div>
              {(chats[a.id]?.length ?? 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100">
          <Link href="/infrastructure" className="block w-full text-center py-2 rounded-xl text-xs font-bold border-2 transition hover:bg-gray-50" style={{ borderColor: DARK, color: DARK }}>
            + Hire More Advisors
          </Link>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800 text-xl mr-1">☰</button>
          <img src={avatarUrl(selected.name)} alt={selected.name} className="w-9 h-9 rounded-full border border-gray-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight">{selected.name}</p>
            <p className="text-xs text-gray-400 leading-tight">{selected.title} · {selected.deptName}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-600 font-semibold">Online</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-gray-200 px-4 flex gap-1 overflow-x-auto shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-[#0B2140] text-[#0B2140]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* CHAT */}
          {tab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <img src={avatarUrl(selected.name)} alt={selected.name} className="w-20 h-20 rounded-full border-2 border-gray-100 mb-4" />
                    <p className="font-bold text-gray-800 mb-1">Start a conversation with {selected.name}</p>
                    <p className="text-sm text-gray-400 max-w-sm mb-6">Ask anything about {selected.deptName.toLowerCase()}, your business, or get specific advice.</p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                      {[
                        'What should I focus on this quarter?',
                        'Review my cash flow situation',
                        'Help me set goals for next month',
                        'What risks should I be aware of?',
                      ].map(q => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 hover:border-[#0B2140] hover:text-[#0B2140] text-gray-600 transition bg-white">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.from === 'client' ? 'flex-row-reverse' : ''}`}>
                    {m.from === 'advisor' && (
                      <img src={avatarUrl(selected.name)} alt={selected.name} className="w-8 h-8 rounded-full border border-gray-100 shrink-0 mt-0.5" />
                    )}
                    <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.from === 'client'
                        ? 'bg-[#0B2140] text-white rounded-tr-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {m.text}
                      <p className={`text-[10px] mt-1 ${m.from === 'client' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex gap-3">
                    <img src={avatarUrl(selected.name)} alt={selected.name} className="w-8 h-8 rounded-full border border-gray-100 shrink-0" />
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message ${selected.name}…`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] focus:border-transparent"
                  />
                  <button type="submit" disabled={!input.trim() || thinking}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition" style={{ background: GOLD }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VOICE */}
          {tab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
              <img src={avatarUrl(selected.name)} alt={selected.name} className={`w-28 h-28 rounded-full border-4 mb-6 transition-all duration-300 ${speaking ? 'border-green-400 shadow-lg shadow-green-100' : listening ? 'border-[#C9A02E] shadow-lg shadow-yellow-100' : 'border-gray-200'}`} />
              <p className="font-bold text-xl text-gray-900 mb-1">{selected.name}</p>
              <p className="text-sm text-gray-400 mb-8">{selected.title}</p>

              {/* Status */}
              <div className="mb-6 text-center min-h-[48px]">
                {listening && <p className="text-[#C9A02E] font-semibold animate-pulse">🎙️ Listening…</p>}
                {thinking && !listening && <p className="text-gray-500 animate-pulse">💭 {selected.name.split(' ')[0]} is thinking…</p>}
                {speaking && <p className="text-green-600 font-semibold animate-pulse">🔊 Speaking…</p>}
                {!listening && !thinking && !speaking && <p className="text-gray-400 text-sm">Press the mic to speak to {selected.name.split(' ')[0]}</p>}
              </div>

              {/* Mic button */}
              <button
                onClick={listening || speaking ? stopAll : startVoice}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${
                  listening ? 'bg-red-500 scale-110' : speaking ? 'bg-green-500' : 'hover:scale-105'
                } text-white`}
                style={{ background: listening ? '#ef4444' : speaking ? '#22c55e' : DARK }}
              >
                {listening ? '⏹' : speaking ? '🔊' : '🎙️'}
              </button>
              <p className="text-xs text-gray-400 mt-3">{listening ? 'Tap to stop' : speaking ? 'Tap to stop speaking' : 'Tap to speak'}</p>

              {/* Transcript & reply */}
              {voiceText && (
                <div className="mt-8 w-full max-w-lg space-y-3">
                  <div className="bg-[#0B2140] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm ml-8">
                    <p className="text-[10px] text-blue-300 mb-1">You said</p>
                    {voiceText}
                  </div>
                  {voiceReply && (
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 text-sm mr-8">
                      <p className="text-[10px] text-gray-400 mb-1">{selected.name}</p>
                      {voiceReply}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'docs' && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                    <p className="text-sm text-gray-400">Share files with {selected.name}</p>
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white transition" style={{ background: GOLD }}>
                    {uploading ? 'Uploading…' : '+ Upload File'}
                  </button>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                </div>

                {docs.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-3">📁</p>
                    <p className="text-gray-500 font-medium mb-1">No documents yet</p>
                    <p className="text-xs text-gray-400 mb-4">Upload financials, contracts, or reports for {selected.name.split(' ')[0]} to review</p>
                    <button onClick={() => fileRef.current?.click()} className="text-sm font-semibold underline" style={{ color: DARK }}>Upload your first file</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {docs.map((d, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: '#f3f4f6' }}>
                          {d.fileType.includes('pdf') ? '📄' : d.fileType.includes('image') ? '🖼️' : d.fileType.includes('sheet') || d.name.endsWith('.xlsx') ? '📊' : '📎'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.size} · {d.date}</p>
                        </div>
                        <button className="text-xs text-blue-600 hover:underline shrink-0">Download</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#0B2140] mb-1">💡 What to share with your advisor</p>
                  <ul className="text-xs text-blue-700 space-y-0.5">
                    <li>· Last 3 months of bank/financial statements</li>
                    <li>· Key contracts or vendor agreements</li>
                    <li>· Business plan or pitch deck</li>
                    <li>· Tax returns or P&L reports</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* MEETINGS */}
          {tab === 'meetings' && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Meetings</h2>
                <p className="text-sm text-gray-400 mb-6">Schedule time with {selected.name}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer"
                    className="bg-white border-2 border-gray-100 hover:border-[#0B2140] rounded-2xl p-5 transition group">
                    <p className="text-2xl mb-3">📅</p>
                    <p className="font-bold text-gray-900 mb-1">Book a 30-min Call</p>
                    <p className="text-xs text-gray-400">Schedule a strategy session with {selected.name.split(' ')[0]} via Calendly</p>
                    <p className="text-xs font-semibold mt-3 group-hover:underline" style={{ color: DARK }}>Open Calendly →</p>
                  </a>
                  <a href="https://zoom.us/start/videomeeting" target="_blank" rel="noopener noreferrer"
                    className="bg-white border-2 border-gray-100 hover:border-[#2D8CFF] rounded-2xl p-5 transition group">
                    <p className="text-2xl mb-3">🎥</p>
                    <p className="font-bold text-gray-900 mb-1">Start Zoom Meeting</p>
                    <p className="text-xs text-gray-400">Launch an instant Zoom session and share the link with your advisor</p>
                    <p className="text-xs font-semibold mt-3 text-[#2D8CFF] group-hover:underline">Launch Zoom →</p>
                  </a>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="font-bold text-sm text-gray-900">Upcoming Sessions</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm text-gray-400">No meetings scheduled yet</p>
                    <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold underline mt-2 inline-block" style={{ color: DARK }}>
                      Book your first session →
                    </a>
                  </div>
                </div>

                <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="font-bold text-sm text-gray-900 mb-3">Meeting Tips</p>
                  <div className="space-y-2">
                    {[
                      { icon: '📋', tip: 'Send your agenda 24hrs before — advisors prepare specific analysis in advance' },
                      { icon: '📊', tip: 'Share relevant documents in the Documents tab before the call' },
                      { icon: '🎯', tip: 'Come with 2–3 specific questions for the best use of your time' },
                      { icon: '📝', tip: 'After the call, follow up in chat to continue the conversation' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMAIL */}
          {tab === 'email' && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Email</h2>
                <p className="text-sm text-gray-400 mb-6">Send a message to {selected.name} or your IEBC account manager</p>

                {emailSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <p className="text-3xl mb-3">✅</p>
                    <p className="font-bold text-green-800">Email sent!</p>
                    <p className="text-sm text-green-600 mt-1">Your message is on its way. Expect a reply within 2 business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={sendEmail} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100" style={{ background: DARK }}>
                      <p className="text-white font-bold text-sm">New Message to {selected.name}</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">To</label>
                        <input value={emailForm.to || `${selected.name.toLowerCase().replace(' ', '.')}@iebusinessconsultants.com`}
                          onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
                        <input required value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140]"
                          placeholder="e.g. Q3 Financial Review" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Message</label>
                        <textarea required value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                          rows={6} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2140] resize-none"
                          placeholder={`Hi ${selected.name.split(' ')[0]},\n\n`} />
                      </div>
                      <button type="submit" disabled={sendingEmail}
                        className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition" style={{ background: GOLD }}>
                        {sendingEmail ? 'Sending…' : 'Send Email →'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TEAM */}
          {tab === 'team' && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Your AI Advisor Team</h2>
                <p className="text-sm text-gray-400 mb-6">{advisors.length} advisor{advisors.length !== 1 ? 's' : ''} hired · click any advisor to start working</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advisors.map(a => (
                    <div key={a.id} className={`bg-white border-2 rounded-2xl p-5 transition cursor-pointer ${selected.id === a.id ? 'border-[#0B2140] shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                      onClick={() => { setSelected(a); setTab('chat') }}>
                      <div className="flex items-start gap-4 mb-3">
                        <img src={avatarUrl(a.name)} alt={a.name} className="w-14 h-14 rounded-full border-2 border-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.title}</p>
                          <p className="text-xs text-gray-400">{a.deptName}</p>
                          {a.exp && <p className="text-xs text-gray-400 mt-0.5">{a.exp} experience</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Online
                          </span>
                          {(a.negotiatedRate ?? a.rate) && (
                            <span className="text-xs font-bold" style={{ color: GOLD }}>${(a.negotiatedRate ?? a.rate)?.toLocaleString()}/mo</span>
                          )}
                        </div>
                      </div>
                      {a.bio && <p className="text-xs text-gray-500 leading-relaxed mb-3">{a.bio}</p>}
                      {a.skills && (
                        <div className="flex flex-wrap gap-1">
                          {a.skills.map(s => (
                            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={e => { e.stopPropagation(); setSelected(a); setTab('chat') }}
                        className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition" style={{ background: DARK }}>
                        Chat with {a.name.split(' ')[0]} →
                      </button>
                    </div>
                  ))}
                  <Link href="/infrastructure"
                    className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:border-[#0B2140] transition group min-h-[180px]">
                    <p className="text-3xl mb-2">+</p>
                    <p className="font-bold text-gray-500 group-hover:text-[#0B2140] transition text-sm">Hire Another Advisor</p>
                    <p className="text-xs text-gray-400 mt-1">Browse all departments</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
