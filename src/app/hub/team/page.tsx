'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Member = {
  id: string
  invited_email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'pending' | 'active' | 'revoked'
  created_at: string
}

const ROLE_STYLES: Record<string, string> = {
  admin:  'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const STATUS_STYLES: Record<string, string> = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  revoked: 'bg-red-100 text-red-500',
}

const ROLE_DESC: Record<string, string> = {
  admin:  'Can manage everything including billing',
  editor: 'Can add/edit data but not billing',
  viewer: 'Read-only access',
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ invited_email: '', role: 'viewer' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/team')
    const data = await res.json()
    setMembers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (res.ok) {
      setShowForm(false)
      setForm({ invited_email: '', role: 'viewer' })
      setSuccess(`Invite sent to ${form.invited_email}`)
      load()
    } else {
      setError(data.error || 'Failed to invite')
    }
    setSaving(false)
  }

  const updateRole = async (id: string, role: string) => {
    await fetch('/api/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    load()
  }

  const removeMember = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from your team?`)) return
    await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
    load()
  }

  const activeCount = members.filter(m => m.status === 'active').length
  const pendingCount = members.filter(m => m.status === 'pending').length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Team Management</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
          className="btn-primary text-sm"
        >
          + Invite Member
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Members', value: String(members.length + 1), note: 'including you', color: 'text-[#0F4C81]' },
            { label: 'Active', value: String(activeCount + 1), note: 'with access', color: 'text-green-700' },
            { label: 'Pending Invites', value: String(pendingCount), note: 'awaiting signup', color: pendingCount > 0 ? 'text-yellow-600' : 'text-gray-400' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>

        {/* Success / Error banners */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex justify-between">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {/* Plan notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-[#0F4C81]">
          <strong>Seat limits by plan:</strong> Silver (1 user) · Gold (up to 5 users) · Platinum (up to 10 users).{' '}
          <Link href="/accounting/checkout" className="font-semibold underline">Upgrade your plan →</Link>
        </div>

        {/* Invite Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">Invite Team Member</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={form.invited_email}
                    onChange={e => setForm({ ...form, invited_email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  >
                    <option value="viewer">Viewer — Read-only</option>
                    <option value="editor">Editor — Add &amp; edit data</option>
                    <option value="admin">Admin — Full access</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400">{ROLE_DESC[form.role]}</p>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Sending...' : 'Send Invite'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Owner row (always shown) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-sm">Team Members</h2>
            <span className="text-xs text-gray-400">{members.length + 1} total</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="p-3 text-left">Member</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* Owner row */}
              <tr className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0F4C81] flex items-center justify-center text-white text-xs font-bold">
                      You
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Account Owner</p>
                      <p className="text-xs text-gray-400">Full control</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0F4C81] text-white">owner</span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">active</span>
                </td>
                <td className="p-3 text-gray-400 text-xs">—</td>
                <td className="p-3 text-center text-xs text-gray-300">—</td>
              </tr>

              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    <p className="text-gray-400 text-sm mb-2">No team members yet</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                      Invite Your First Member
                    </button>
                  </td>
                </tr>
              ) : members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold uppercase">
                        {m.invited_email[0]}
                      </div>
                      <span className="font-medium text-gray-700">{m.invited_email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={m.role}
                      onChange={e => updateRole(m.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${ROLE_STYLES[m.role]}`}
                    >
                      <option value="viewer">viewer</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeMember(m.id, m.invited_email)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(ROLE_DESC).map(([role, desc]) => (
              <div key={role} className="flex items-start gap-2">
                <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${ROLE_STYLES[role]}`}>{role}</span>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
