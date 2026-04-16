'use client'
import { useState } from 'react'
import Link from 'next/link'

const ACCENT = '#D946EF'
const DARK = '#0B2140'
const GOLD = '#C8902A'

const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶',
    color: '#FF0000',
    bg: '#FFF0F0',
    followers: '2,341',
    growth: '+128 this month',
    posts: 8,
    reach: '18,400',
    engagement: '4.2%',
    connected: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '◈',
    color: '#E1306C',
    bg: '#FFF0F5',
    followers: '5,892',
    growth: '+312 this month',
    posts: 12,
    reach: '34,200',
    engagement: '6.8%',
    connected: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    bg: '#F0F5FF',
    followers: '3,120',
    growth: '+89 this month',
    posts: 10,
    reach: '21,000',
    engagement: '3.1%',
    connected: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    bg: '#F0F8FF',
    followers: '1,450',
    growth: '+67 this month',
    posts: 6,
    reach: '9,800',
    engagement: '5.4%',
    connected: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '♪',
    color: '#010101',
    bg: '#F5F5F5',
    followers: '8,230',
    growth: '+940 this month',
    posts: 14,
    reach: '62,500',
    engagement: '9.2%',
    connected: false,
  },
]

const SCHEDULED_POSTS = [
  { id: 1, platform: 'Instagram', date: 'Apr 17', time: '9:00 AM', caption: '5 ways AI is changing small business accounting in 2025 🤖💼 #SmallBusiness #AI', status: 'scheduled', type: 'Reel' },
  { id: 2, platform: 'LinkedIn', date: 'Apr 17', time: '11:00 AM', caption: 'How IEBC helped a logistics company reduce bookkeeping time by 80%...', status: 'scheduled', type: 'Article' },
  { id: 3, platform: 'Facebook', date: 'Apr 18', time: '2:00 PM', caption: 'Free trial starting today! Get 7 days of IEBC Efficient SaaS accounting — no card needed. 🎉', status: 'scheduled', type: 'Post' },
  { id: 4, platform: 'TikTok', date: 'Apr 18', time: '6:00 PM', caption: 'POV: Your business is running itself while you sleep 😴 #BusinessAutomation #IEBC', status: 'draft', type: 'Video' },
  { id: 5, platform: 'YouTube', date: 'Apr 20', time: '10:00 AM', caption: 'FULL TUTORIAL: Setting up automated invoicing in IEBC (under 5 minutes)', status: 'scheduled', type: 'Video' },
  { id: 6, platform: 'Instagram', date: 'Apr 21', time: '8:00 AM', caption: 'Client spotlight: Meet Maria, who scaled her trucking company using IEBC Hubs 🚛', status: 'draft', type: 'Story' },
]

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: '#FF0000', Instagram: '#E1306C', Facebook: '#1877F2',
  LinkedIn: '#0A66C2', TikTok: '#010101',
}

const ENGAGEMENT_FEED = [
  { platform: 'Instagram', type: 'comment', user: '@maria_logistics', message: 'This is exactly what my trucking business needs! DM\'d you 🙌', time: '2h ago', replied: false },
  { platform: 'LinkedIn', type: 'message', user: 'James Okafor', message: 'Loved your post on AI accounting. Would love to connect and learn more.', time: '4h ago', replied: true },
  { platform: 'Facebook', type: 'comment', user: 'Sandra P.', message: 'How does the 7-day free trial work? Do I need a credit card?', time: '6h ago', replied: false },
  { platform: 'YouTube', type: 'comment', user: 'TruckingPro22', message: 'Great tutorial! Can you do one specifically for owner-operators?', time: '1d ago', replied: false },
  { platform: 'TikTok', type: 'comment', user: '@startupvibes', message: 'Just signed up because of this video fr 🔥', time: '1d ago', replied: true },
]

type Tab = 'overview' | 'schedule' | 'engagement' | 'analytics'

export default function SocialOptimizePage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const connectedCount = PLATFORMS.filter(p => p.connected).length
  const totalFollowers = PLATFORMS.filter(p => p.connected).reduce((sum, p) => sum + parseInt(p.followers.replace(/,/g, '')), 0)
  const totalReach = PLATFORMS.filter(p => p.connected).reduce((sum, p) => sum + parseInt(p.reach.replace(/,/g, '')), 0)
  const pendingReplies = ENGAGEMENT_FEED.filter(e => !e.replied).length

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Platforms' },
    { id: 'schedule', label: 'Content Calendar' },
    { id: 'engagement', label: `Engagement ${pendingReplies > 0 ? `(${pendingReplies})` : ''}` },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: ACCENT }}>📱</div>
            <h1 className="text-2xl font-extrabold" style={{ color: DARK }}>Social Optimize</h1>
          </div>
          <p className="text-gray-500 text-sm">{connectedCount} platforms active · {PLATFORMS.filter(p => p.connected).map(p => p.name).join(', ')}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/checkout/social-optimize"
            className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            + Add Platform
          </Link>
          <a
            href="https://calendly.com/new56money/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-colors hover:text-white"
            style={{ borderColor: DARK, color: DARK }}
          >
            Strategy Call
          </a>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Followers', value: totalFollowers.toLocaleString(), sub: 'across active platforms', icon: '◉' },
          { label: 'Monthly Reach', value: totalReach.toLocaleString(), sub: 'unique accounts reached', icon: '▲' },
          { label: 'Posts This Month', value: PLATFORMS.filter(p => p.connected).reduce((s, p) => s + p.posts, 0).toString(), sub: 'published & scheduled', icon: '◻' },
          { label: 'Pending Replies', value: pendingReplies.toString(), sub: 'comments & messages', icon: '◆' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold" style={{ color: DARK }}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 min-w-max py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={activeTab === tab.id ? { background: '#fff', color: DARK, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#6b7280' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Platforms Overview ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border p-5 transition-all ${p.connected ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ background: p.color }}>
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: DARK }}>{p.name}</p>
                    <p className="text-xs" style={{ color: p.connected ? '#16a34a' : '#9ca3af' }}>
                      {p.connected ? '● Active' : '○ Not connected'}
                    </p>
                  </div>
                </div>
                {!p.connected && (
                  <Link href="/checkout/social-optimize"
                    className="text-xs font-bold px-3 py-1 rounded-lg text-white" style={{ background: ACCENT }}>
                    Add
                  </Link>
                )}
              </div>

              {p.connected ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: p.bg }}>
                    <p className="text-xs text-gray-500 mb-0.5">Followers</p>
                    <p className="text-lg font-extrabold" style={{ color: DARK }}>{p.followers}</p>
                    <p className="text-xs font-medium" style={{ color: '#16a34a' }}>{p.growth}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: p.bg }}>
                    <p className="text-xs text-gray-500 mb-0.5">Engagement</p>
                    <p className="text-lg font-extrabold" style={{ color: DARK }}>{p.engagement}</p>
                    <p className="text-xs text-gray-400">{p.reach} reach</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-4 text-center" style={{ background: '#f9fafb' }}>
                  <p className="text-sm text-gray-500">Connect this platform to see analytics and schedule content.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Content Calendar ── */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold" style={{ color: DARK }}>Upcoming & Scheduled Posts</h2>
            <button className="text-sm font-bold px-4 py-2 rounded-lg text-white" style={{ background: ACCENT }}>
              + New Post
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {SCHEDULED_POSTS.map(post => (
              <div key={post.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
                  style={{ background: PLATFORM_COLORS[post.platform] || '#6b7280' }}>
                  {post.platform[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: PLATFORM_COLORS[post.platform] }}>{post.platform}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-gray-500">{post.date} at {post.time}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{post.type}</span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{post.caption}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                  post.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Your IEBC Social team manages content creation and scheduling. <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ACCENT }}>Book a call</a> to discuss your content strategy.</p>
          </div>
        </div>
      )}

      {/* ── TAB: Engagement ── */}
      {activeTab === 'engagement' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold" style={{ color: DARK }}>Comments & Messages</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>
              {pendingReplies} need reply
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {ENGAGEMENT_FEED.map((item, i) => (
              <div key={i} className={`px-6 py-4 flex items-start gap-4 transition-colors ${!item.replied ? 'bg-purple-50/40' : 'hover:bg-gray-50'}`}>
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                  style={{ background: PLATFORM_COLORS[item.platform] || '#6b7280' }}>
                  {item.platform[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{item.user}</span>
                    <span className="text-xs text-gray-400">{item.platform} · {item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.message}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                  item.replied ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.replied ? 'Replied' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Your IEBC team handles engagement replies on Growth and Pro plans. <a href="https://calendly.com/new56money/30min" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ACCENT }}>Upgrade your plan</a> for daily moderation.</p>
          </div>
        </div>
      )}

      {/* ── TAB: Analytics ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Growth chart placeholder */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold mb-1" style={{ color: DARK }}>Follower Growth — Last 30 Days</h2>
            <p className="text-xs text-gray-400 mb-6">Across all connected platforms</p>
            <div className="flex items-end gap-2 h-32">
              {[420, 480, 510, 495, 560, 590, 620, 580, 650, 700, 680, 740, 800, 850].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${(v / 850) * 100}%`, background: `${ACCENT}${i === 13 ? 'ff' : '80'}` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Apr 1</span><span>Apr 8</span><span>Apr 15</span><span>Today</span>
            </div>
          </div>

          {/* Per-platform stats table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold" style={{ color: DARK }}>Platform Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Platform', 'Followers', 'Growth', 'Posts', 'Reach', 'Eng. Rate'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PLATFORMS.filter(p => p.connected).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[9px] font-black" style={{ background: p.color }}>{p.icon}</div>
                          <span className="font-semibold" style={{ color: DARK }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-bold" style={{ color: DARK }}>{p.followers}</td>
                      <td className="px-6 py-3 font-semibold text-green-600">{p.growth}</td>
                      <td className="px-6 py-3 text-gray-600">{p.posts}</td>
                      <td className="px-6 py-3 text-gray-600">{p.reach}</td>
                      <td className="px-6 py-3">
                        <span className="font-bold" style={{ color: ACCENT }}>{p.engagement}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI suggestions */}
          <div className="rounded-2xl p-6" style={{ background: DARK }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤖</span>
              <p className="font-bold text-white">AI Growth Recommendations</p>
            </div>
            <div className="space-y-3">
              {[
                { platform: 'TikTok', tip: 'Your TikTok engagement is 9.2% — well above average. Increasing post frequency from 14 to 20/mo could add ~600 followers.' },
                { platform: 'LinkedIn', tip: 'LinkedIn posts published Tuesday–Thursday at 10am see 35% higher reach. Your current schedule is suboptimal.' },
                { platform: 'Instagram', tip: 'Reels are outperforming static posts 3:1. Shifting 50% of your posts to Reels is recommended.' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[9px] font-black text-white mt-0.5"
                    style={{ background: PLATFORM_COLORS[r.platform] }}>
                    {r.platform[0]}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA for disconnected platforms */}
      {PLATFORMS.some(p => !p.connected) && (
        <div className="mt-8 rounded-2xl p-6 border-2 border-dashed text-center" style={{ borderColor: ACCENT + '40', background: ACCENT + '08' }}>
          <p className="text-2xl mb-2">📱</p>
          <p className="font-bold mb-1" style={{ color: DARK }}>
            You have {PLATFORMS.filter(p => !p.connected).length} platform{PLATFORMS.filter(p => !p.connected).length > 1 ? 's' : ''} not yet connected
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Add {PLATFORMS.filter(p => !p.connected).map(p => p.name).join(' and ')} to maximize your social reach.
          </p>
          <Link href="/checkout/social-optimize"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}>
            Upgrade Your Plan →
          </Link>
        </div>
      )}
    </div>
  )
}
