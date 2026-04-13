'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// All 60 departments organized by category
const CATEGORIES: { name: string; depts: string[] }[] = [
  { name: 'Finance & Accounting', depts: ['CFO Advisor','Tax Strategist','Bookkeeping Expert','Payroll Specialist','Cash Flow Analyst','Investment Advisor','Budget Planner','AR Specialist','AP Specialist','Financial Auditor'] },
  { name: 'Marketing & Sales',    depts: ['Brand Strategist','Digital Marketing','SEO Specialist','Social Media','Sales Coach','Lead Generation','Content Strategy','Email Marketing','Paid Advertising','Market Research'] },
  { name: 'Operations',           depts: ['Operations Manager','Supply Chain','Process Improvement','Quality Control','Project Manager','Logistics Coordinator','Inventory Specialist','Procurement Advisor'] },
  { name: 'Legal & Compliance',   depts: ['Business Attorney','Contract Specialist','IP Advisor','Compliance Officer','Employment Law','Data Privacy'] },
  { name: 'HR & People',          depts: ['HR Director','Recruiting Specialist','Culture Advisor','Training & Development','Benefits Consultant','Performance Coach'] },
  { name: 'Technology',           depts: ['CTO Advisor','Cybersecurity Expert','Software Architect','Data Analyst','AI Integration','IT Infrastructure','Product Manager','UX Consultant'] },
  { name: 'Strategy & Growth',    depts: ['Business Strategist','Growth Hacker','M&A Advisor','Franchise Consultant','Export/Import Advisor','Business Valuation'] },
  { name: 'Industry Specialists', depts: ['Real Estate Advisor','Healthcare Consultant','E-commerce Expert','Restaurant & Food','Construction Advisor','Retail Specialist'] },
]

const DEPT_ICONS: Record<string, string> = {
  'CFO Advisor':'💼','Tax Strategist':'🧮','Bookkeeping Expert':'📒','Payroll Specialist':'💳','Cash Flow Analyst':'💧','Investment Advisor':'📈','Budget Planner':'🎯','AR Specialist':'📬','AP Specialist':'📤','Financial Auditor':'🔍',
  'Brand Strategist':'🎨','Digital Marketing':'📱','SEO Specialist':'🔎','Social Media':'📣','Sales Coach':'🏆','Lead Generation':'🧲','Content Strategy':'✍️','Email Marketing':'📧','Paid Advertising':'💰','Market Research':'🔬',
  'Operations Manager':'⚙️','Supply Chain':'🔗','Process Improvement':'📋','Quality Control':'✅','Project Manager':'🗓️','Logistics Coordinator':'🚚','Inventory Specialist':'📦','Procurement Advisor':'🛒',
  'Business Attorney':'⚖️','Contract Specialist':'📝','IP Advisor':'💡','Compliance Officer':'🛡️','Employment Law':'👔','Data Privacy':'🔒',
  'HR Director':'👥','Recruiting Specialist':'🎯','Culture Advisor':'🌱','Training & Development':'🎓','Benefits Consultant':'❤️','Performance Coach':'🚀',
  'CTO Advisor':'💻','Cybersecurity Expert':'🔐','Software Architect':'🏗️','Data Analyst':'📊','AI Integration':'🤖','IT Infrastructure':'🖥️','Product Manager':'📌','UX Consultant':'🎭',
  'Business Strategist':'♟️','Growth Hacker':'⚡','M&A Advisor':'🤝','Franchise Consultant':'🏪','Export/Import Advisor':'🌍','Business Valuation':'💎',
  'Real Estate Advisor':'🏠','Healthcare Consultant':'🏥','E-commerce Expert':'🛍️','Restaurant & Food':'🍽️','Construction Advisor':'🏗️','Retail Specialist':'🏬',
}

type Message = { role: 'user' | 'assistant'; content: string; ts: number }
type Assignment = { department: string }

const WELCOME: Record<string, string> = {
  'CFO Advisor':        'Hi! I\'m your CFO Advisor. Ask me anything about financial strategy, cash management, fundraising, or scaling your finances.',
  'Tax Strategist':     'Hello! I\'m your Tax Strategist. I can help you plan for taxes, identify deductions, and structure your business for maximum tax efficiency.',
  'Brand Strategist':   'Hey there! I\'m your Brand Strategist. Let\'s talk about your brand identity, positioning, and messaging.',
  'Sales Coach':        'Ready to close more deals? I\'m your Sales Coach — ask me about your sales process, handling objections, or building a pipeline.',
  'CTO Advisor':        'Hi! I\'m your CTO Advisor. Whether it\'s tech stack decisions, vendor evaluation, or software projects, I\'m here to help.',
  'Business Strategist':'Hello! I\'m your Business Strategist. Let\'s work on your goals, competitive positioning, and growth plan.',
  'HR Director':        'Hi! I\'m your HR Director. I can help with hiring, retention, compensation, or any people-related challenges.',
  'Operations Manager': 'Hey! I\'m your Operations Manager. Tell me about your current operations and I\'ll help you streamline and scale.',
}

function getWelcome(dept: string): string {
  return WELCOME[dept] ?? `Hi! I'm your ${dept} consultant. How can I help your business today?`
}

export default function ConsultantsPage() {
  const [assignments, setAssignments]   = useState<Assignment[]>([])
  const [plan, setPlan]                 = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<string | null>(null)
  const [histories, setHistories]       = useState<Record<string, Message[]>>({})
  const [input, setInput]               = useState('')
  const [sending, setSending]           = useState(false)
  const [browseOpen, setBrowseOpen]     = useState(false)
  const bottomRef                       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/hub/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments ?? [])
        setPlan(data.plan ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [histories, selected])

  // When a consultant is selected, inject welcome if no history
  function selectConsultant(dept: string) {
    setSelected(dept)
    setBrowseOpen(false)
    if (!histories[dept]) {
      setHistories(h => ({
        ...h,
        [dept]: [{ role: 'assistant', content: getWelcome(dept), ts: Date.now() }],
      }))
    }
  }

  async function sendMessage() {
    if (!input.trim() || !selected || sending) return
    const userMsg: Message = { role: 'user', content: input.trim(), ts: Date.now() }
    const current = histories[selected] ?? []
    const next = [...current, userMsg]
    setHistories(h => ({ ...h, [selected]: next }))
    setInput('')
    setSending(true)

    try {
      const apiHistory = current
        .filter(m => m.role !== 'assistant' || m.ts !== current[0]?.ts) // exclude welcome
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/hub/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, department: selected, history: apiHistory }),
      })
      const data = await res.json()
      if (data.reply) {
        setHistories(h => ({
          ...h,
          [selected]: [...(h[selected] ?? []), { role: 'assistant', content: data.reply, ts: Date.now() }],
        }))
      }
    } catch {
      setHistories(h => ({
        ...h,
        [selected]: [...(h[selected] ?? []), { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.', ts: Date.now() }],
      }))
    } finally {
      setSending(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const maxConsultants = plan === 'platinum' ? 5 : plan === 'gold' ? 3 : 0
  const messages = selected ? (histories[selected] ?? []) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Consultant Workforce</h1>
          <p className="text-sm text-gray-400 mt-0.5">60 specialized consultants — your on-demand expert team</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBrowseOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-[#0F4C81] border-2 border-[#0F4C81] rounded-lg hover:bg-blue-50 transition"
          >
            Browse All 60
          </button>
          {maxConsultants === 0 && (
            <Link href="/accounting/checkout"
              className="px-4 py-2 text-sm font-bold bg-[#C02020] hover:bg-[#A01818] text-white rounded-lg transition shadow-sm">
              Upgrade to Unlock
            </Link>
          )}
        </div>
      </div>

      {maxConsultants === 0 ? (
        /* ── Upgrade prompt ── */
        <div className="space-y-6">
          <div className="bg-[#0F4C81] rounded-2xl p-8 text-white text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h2 className="text-2xl font-extrabold mb-2">Unlock Your AI Consultant Team</h2>
            <p className="text-blue-200 max-w-md mx-auto mb-6">
              Gold plan gives you 3 consultants. Platinum gives you 5. Each one is a specialist AI ready to advise your business.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/accounting/checkout"
                className="bg-[#C02020] hover:bg-[#A01818] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg">
                Upgrade — From $22/mo
              </Link>
            </div>
          </div>

          {/* Preview all 60 */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">All 60 Available Consultants</p>
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="mb-5">
                <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mb-2">{cat.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {cat.depts.map(d => (
                    <div key={d} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2 opacity-60">
                      <span className="text-lg">{DEPT_ICONS[d] ?? '🧑‍💼'}</span>
                      <span className="text-xs font-medium text-gray-500">{d}</span>
                      <span className="ml-auto text-gray-300">🔒</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Active consultants ── */
        <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">

          {/* Sidebar: assigned consultants */}
          <div className="w-56 shrink-0 flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Your Consultants ({assignments.length}/{maxConsultants})
            </p>

            {assignments.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-400 mb-3">No consultants assigned yet.</p>
                <p className="text-xs text-gray-400">Contact IEBC support to get your {maxConsultants} consultant{maxConsultants > 1 ? 's' : ''} assigned.</p>
              </div>
            ) : (
              assignments.map(a => {
                const isActive = selected === a.department
                const hasChat  = (histories[a.department]?.length ?? 0) > 1
                return (
                  <button
                    key={a.department}
                    onClick={() => selectConsultant(a.department)}
                    className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition ${
                      isActive
                        ? 'bg-[#0F4C81] border-[#0F4C81] text-white shadow-md'
                        : 'bg-white border-gray-200 hover:border-[#0F4C81] hover:shadow-sm'
                    }`}
                  >
                    <span className="text-xl shrink-0">{DEPT_ICONS[a.department] ?? '🧑‍💼'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>{a.department}</p>
                      {hasChat && <p className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>Active chat</p>}
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-300' : 'bg-green-400'}`} />
                  </button>
                )
              })
            )}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, maxConsultants - assignments.length) }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl shrink-0 opacity-30">🧑‍💼</span>
                <p className="text-xs text-gray-400">Slot available</p>
              </div>
            ))}

            <button
              onClick={() => setBrowseOpen(true)}
              className="mt-2 text-xs text-[#0F4C81] hover:underline font-medium text-center"
            >
              Browse all 60 →
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="text-5xl mb-4">🤖</div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Select a consultant to start</h2>
                <p className="text-sm text-gray-400 max-w-sm">Choose one of your assigned consultants on the left to begin a conversation.</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                  <span className="text-2xl">{DEPT_ICONS[selected] ?? '🧑‍💼'}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selected}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <span className="text-xs text-gray-400">Online · IEBC AI Consultant</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setHistories(h => ({ ...h, [selected]: [] }))}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    Clear chat
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && (
                        <div className="w-8 h-8 bg-[#0F4C81] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">{DEPT_ICONS[selected] ?? '🤖'}</span>
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#0F4C81] text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {m.content}
                      </div>
                      {m.role === 'user' && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-[#0F4C81] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm">{DEPT_ICONS[selected] ?? '🤖'}</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={`Ask your ${selected}…`}
                      rows={2}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="bg-[#0F4C81] hover:bg-[#082D4F] disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 h-[52px]"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Browse All 60 Modal ── */}
      {browseOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setBrowseOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">All 60 Consultants</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click any consultant to start a chat{maxConsultants === 0 ? ' (upgrade required)' : ''}</p>
              </div>
              <button onClick={() => setBrowseOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              {CATEGORIES.map(cat => (
                <div key={cat.name}>
                  <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mb-3">{cat.name}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {cat.depts.map(d => {
                      const assigned = assignments.some(a => a.department === d)
                      const canChat  = assigned || maxConsultants === 0
                      return (
                        <button
                          key={d}
                          disabled={maxConsultants === 0 && !assigned}
                          onClick={() => assigned ? selectConsultant(d) : null}
                          className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center transition ${
                            assigned
                              ? 'bg-blue-50 border-[#0F4C81] hover:shadow-md cursor-pointer'
                              : maxConsultants > 0
                              ? 'bg-white border-gray-200 opacity-50 cursor-default'
                              : 'bg-white border-gray-200 opacity-50 cursor-default'
                          }`}
                        >
                          <span className="text-2xl">{DEPT_ICONS[d] ?? '🧑‍💼'}</span>
                          <span className="text-xs font-medium text-gray-700 leading-tight">{d}</span>
                          {assigned && <span className="text-[10px] text-[#0F4C81] font-bold">Assigned</span>}
                          {!assigned && maxConsultants === 0 && <span className="text-[10px] text-gray-400">🔒 Upgrade</span>}
                          {!assigned && maxConsultants > 0 && <span className="text-[10px] text-gray-400">Not assigned</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
