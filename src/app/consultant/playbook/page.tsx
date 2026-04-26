'use client'

import { useState } from 'react'

const SECTIONS = [
  {
    id: 'process',
    icon: '◆',
    title: 'Sales Process',
    content: [
      {
        heading: '5-Step IEBC Sales Process',
        items: [
          '1. Identify — Find businesses that need consulting, accounting, or advisor services',
          '2. Outreach — First contact via email or LinkedIn. Keep it short, value-first',
          '3. Qualify — Book a discovery call. Understand their pain points and budget',
          '4. Propose — Send a tailored proposal within 24 hours of the discovery call',
          '5. Close — Follow up within 48 hours. Address objections. Ask for the business',
        ],
      },
      {
        heading: 'Qualification Questions (Discovery Call)',
        items: [
          '"What\'s your biggest operational challenge right now?"',
          '"Are you currently working with any consultants or advisors?"',
          '"What would a successful outcome look like for you in 90 days?"',
          '"What\'s your timeline for making a decision?"',
          '"Do you have budget allocated for this?"',
        ],
      },
    ],
  },
  {
    id: 'objections',
    icon: '⚡',
    title: 'Objection Handling',
    content: [
      {
        heading: 'Common Objections & Responses',
        items: [
          '"Too expensive" → "What\'s the cost of NOT solving this problem? Our clients typically see ROI within 90 days."',
          '"Need to think about it" → "Absolutely. What specific questions can I answer to help you decide?"',
          '"Already have someone" → "Great — we often work alongside existing teams. What gaps are you still facing?"',
          '"Not the right time" → "I understand. When would be a better time? Can we pencil in a follow-up?"',
          '"Need to check with my partner" → "Of course. Would it help to have a short call together?"',
        ],
      },
    ],
  },
  {
    id: 'services',
    icon: '▤',
    title: 'IEBC Services to Sell',
    content: [
      {
        heading: 'Core Offerings',
        items: [
          'AI Advisor Workforce — Fractional advisors (CFO, CMO, COO, etc.) 20-60 hrs/mo',
          'Dedicated Advisors — Full-time dedicated AI advisors for enterprise clients',
          'Accounting App (Efficient) — Full accounting platform with 3 tiers (Silver/Gold/Platinum)',
          'Business Formation — LLC, Corp setup with ongoing compliance',
          'Master Hub — Operations platform for growing businesses',
          'Website & Digital Presence — Build + host + optimize',
        ],
      },
      {
        heading: 'Starter Packages (Easy Entry Points)',
        items: [
          'Starter Bundle — $299/mo + $1,500 setup · 5 fractional advisors · 20 hrs/advisor',
          'Growth Bundle — $499/mo + $3,500 setup · 10 advisors · 40 hrs/advisor',
          'Pro Bundle — $799/mo + $6,500 setup · 20 advisors · 60 hrs/advisor',
          'Silver Accounting — Entry tier for small businesses',
          'Gold Accounting — Mid-size companies needing full accounting suite',
        ],
      },
    ],
  },
  {
    id: 'scripts',
    icon: '✉',
    title: 'Call Scripts',
    content: [
      {
        heading: 'Cold Call Opener (30 seconds)',
        items: [
          '"Hi [Name], this is [Your Name] from IEBC Business Consultants. I\'ll be brief — I work with [industry] businesses helping them [outcome]. I had a quick question: are you currently [pain point]?"',
          'If yes → "That\'s exactly what we solve. Do you have 15 minutes Thursday or Friday to learn how?"',
          'If no → "That\'s great. Actually, how are you handling [adjacent pain point]? We might still be able to help."',
        ],
      },
      {
        heading: 'Voicemail Script',
        items: [
          '"Hi [Name], this is [Your Name] from IEBC Business Consultants. I\'m reaching out because I work with businesses in [industry] and noticed [observation]. I have a quick idea that could help with [specific benefit]. I\'ll send you a short email — look out for it from [your email]. Thanks!"',
        ],
      },
    ],
  },
  {
    id: 'targets',
    icon: '◎',
    title: 'Target Profiles',
    content: [
      {
        heading: 'Ideal Client Profile (ICP)',
        items: [
          'Revenue: $500K – $10M annually',
          'Employees: 5 – 100 (growth stage)',
          'Industries: Professional services, healthcare, construction, retail, real estate',
          'Pain points: Disorganized finances, no clear growth strategy, founder doing everything',
          'Decision maker: Owner, CEO, or COO — not a committee',
          'Buying signals: Recently funded, hiring fast, just launched, struggling with compliance',
        ],
      },
      {
        heading: 'Where to Find Leads',
        items: [
          'LinkedIn — search by title + industry + company size',
          'Google Maps — local businesses with 3-star reviews (opportunity)',
          'Chamber of Commerce directories',
          'Trade associations in target industries',
          'Referrals from existing clients — always ask',
          'Local business networking events',
        ],
      },
    ],
  },
]

export default function PlaybookPage() {
  const [active, setActive] = useState('process')
  const section = SECTIONS.find(s => s.id === active)!

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Sales Playbook</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Scripts, objections, service offerings, and target profiles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        {/* Section nav */}
        <div className="space-y-1">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition border-l-[3px] ${
                active === s.id
                  ? 'bg-blue-50 text-[#1a3a5c] font-semibold border-[#1a3a5c]'
                  : 'text-gray-600 hover:bg-gray-50 border-transparent'
              }`}>
              <span className="text-[15px]">{s.icon}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="sm:col-span-3 space-y-4">
          {section.content.map(block => (
            <div key={block.heading} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-bold text-[14px] text-[#1a3a5c] mb-3">{block.heading}</h2>
              <ul className="space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] text-gray-700 leading-snug">
                    <span className="text-[#1a3a5c] font-bold mt-0.5 shrink-0">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
