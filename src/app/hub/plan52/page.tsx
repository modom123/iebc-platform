'use client'
import { useState } from 'react'
import Link from 'next/link'

const QUARTERS = [
  {
    q: 'Q1', label: 'Foundation',
    focus: 'Build the infrastructure',
    weeks: [
      { n: '1–2',  goal: 'Complete all onboarding checklists for active clients' },
      { n: '3–4',  goal: 'Review and update pricing strategy' },
      { n: '5–6',  goal: 'Launch Efficient accounting marketing push' },
      { n: '7–8',  goal: 'Set Q1 revenue target and track weekly' },
      { n: '9–10', goal: 'Audit all active client accounts for upsell opportunities' },
      { n: '11–13',goal: 'Close Q1: review what worked, what didn\'t' },
    ],
  },
  {
    q: 'Q2', label: 'Growth',
    focus: 'Accelerate client acquisition',
    weeks: [
      { n: '14–15', goal: 'Launch outreach campaign to 50 new prospects' },
      { n: '16–17', goal: 'Add 2 new service offerings or bundles' },
      { n: '18–19', goal: 'Partner with 1 complementary business' },
      { n: '20–21', goal: 'Collect 10 client testimonials' },
      { n: '22–24', goal: 'Hit MRR milestone and evaluate team needs' },
      { n: '25–26', goal: 'Mid-year review — adjust 52-week plan' },
    ],
  },
  {
    q: 'Q3', label: 'Scale',
    focus: 'Systems and delegation',
    weeks: [
      { n: '27–28', goal: 'Document all core processes and SOPs' },
      { n: '29–30', goal: 'Automate 3+ recurring tasks using AI tools' },
      { n: '31–32', goal: 'Hire or contract for 1 key role' },
      { n: '33–34', goal: 'Expand into 1 new industry vertical' },
      { n: '35–37', goal: 'Run Q3 client satisfaction survey' },
      { n: '38–39', goal: 'Review and renegotiate vendor contracts' },
    ],
  },
  {
    q: 'Q4', label: 'Dominate',
    focus: 'Year-end push and planning',
    weeks: [
      { n: '40–41', goal: 'Launch Q4 promotional campaign' },
      { n: '42–43', goal: 'Close year-end client reviews and renewals' },
      { n: '44–45', goal: 'File/prepare year-end tax documents' },
      { n: '46–47', goal: 'Plan budget and revenue targets for next year' },
      { n: '48–50', goal: 'Send holiday outreach to all leads and clients' },
      { n: '51–52', goal: 'Year-end review — celebrate wins, set next 52-week plan' },
    ],
  },
]

export default function Plan52Page() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setChecked(c => ({ ...c, [key]: !c[key] }))
  const totalGoals     = QUARTERS.reduce((s, q) => s + q.weeks.length, 0)
  const completedGoals = Object.values(checked).filter(Boolean).length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">52-Week Business Plan</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{completedGoals}/{totalGoals} completed</span>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0F4C81] rounded-full transition-all" style={{ width: `${(completedGoals / totalGoals) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-[#0F4C81] rounded-2xl p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">IEBC 52-Week Growth Plan</p>
          <h2 className="text-xl font-extrabold mb-2">Your roadmap to a 7-figure business</h2>
          <p className="text-blue-200 text-sm">Check off each goal as you complete it. Stay on track, week by week.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUARTERS.map(q => (
            <div key={q.q} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-[#C9A02E] uppercase tracking-widest">{q.q} — {q.label}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{q.focus}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {q.weeks.filter(w => checked[`${q.q}-${w.n}`]).length}/{q.weeks.length}
                </span>
              </div>
              <div className="space-y-2">
                {q.weeks.map(w => {
                  const key  = `${q.q}-${w.n}`
                  const done = checked[key]
                  return (
                    <button key={key} onClick={() => toggle(key)}
                      className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition text-sm ${done ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <span className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                        {done ? '✓' : ''}
                      </span>
                      <span>
                        <span className="text-xs text-gray-400 font-mono mr-2">Wk {w.n}</span>
                        <span className={done ? 'line-through text-gray-400' : 'text-gray-700'}>{w.goal}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { href: '/hub/leads',   icon: '🔥', label: 'CRM / Leads',      desc: 'Track your pipeline' },
            { href: '/hub/revenue', icon: '💰', label: 'Revenue & MRR',     desc: 'Track your numbers' },
            { href: '/hub/outreach',icon: '📡', label: 'Outreach Engine',   desc: 'Email prospects' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#0F4C81] hover:shadow-sm transition text-center">
              <span className="text-2xl">{a.icon}</span>
              <p className="font-semibold text-gray-800 text-sm mt-2">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
