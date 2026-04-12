'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  client_name: string
  status: 'active' | 'completed' | 'on_hold' | 'canceled'
  budget: number
  start_date: string
  end_date: string | null
  income?: number
  expenses?: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  canceled: 'bg-gray-100 text-gray-400',
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', client_name: '', budget: '', start_date: new Date().toISOString().split('T')[0], end_date: '' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/accounting/projects')
    const data = await res.json()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/accounting/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', client_name: '', budget: '', start_date: new Date().toISOString().split('T')[0], end_date: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/accounting/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/accounting/projects?id=${id}`, { method: 'DELETE' })
    load()
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0)
  const totalRevenue = projects.reduce((s, p) => s + (p.income || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Projects</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ New Project</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Projects', value: String(activeProjects.length), color: 'text-green-600' },
            { label: 'Total Budget', value: fmt(totalBudget), color: 'text-[#0F4C81]' },
            { label: 'Revenue Tracked', value: fmt(totalRevenue), color: 'text-gray-800' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Project</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Project Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Website Redesign" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Client Name</label>
                <input type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Budget ($)</label>
                <input type="number" min="0" step="100" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="10000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Create Project'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Project Cards */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 mb-2">No projects yet</p>
            <p className="text-sm text-gray-400 mb-4">Track revenue and costs per project or client engagement.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create First Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => {
              const income = p.income || 0
              const expenses = p.expenses || 0
              const profit = income - expenses
              const budgetUsed = p.budget > 0 ? (expenses / p.budget) * 100 : 0
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{p.name}</h3>
                      {p.client_name && <p className="text-sm text-gray-500">{p.client_name}</p>}
                    </div>
                    <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[p.status]}`}>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-bold text-green-700 text-sm">{fmt(income)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Costs</p>
                      <p className="font-bold text-red-600 text-sm">{fmt(expenses)}</p>
                    </div>
                    <div className={`${profit >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-2`}>
                      <p className="text-xs text-gray-500">Profit</p>
                      <p className={`font-bold text-sm ${profit >= 0 ? 'text-[#0F4C81]' : 'text-red-600'}`}>{fmt(profit)}</p>
                    </div>
                  </div>

                  {p.budget > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Budget used</span>
                        <span>{fmt(expenses)} / {fmt(p.budget)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(budgetUsed, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    <span>{p.start_date}{p.end_date ? ` → ${p.end_date}` : ''}</span>
                    <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
