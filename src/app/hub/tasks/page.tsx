'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done' | 'canceled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  created_at: string
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  canceled: 'bg-gray-100 text-gray-400',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '',
  })

  const load = async () => {
    setLoading(true)
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await fetch(`/api/tasks${params}`)
    const data = await res.json()
    setTasks(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium', due_date: '' })
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    load()
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done' && t.status !== 'canceled').length
  const doneCount = tasks.filter(t => t.status === 'done').length
  const activeCount = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Tasks</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Task</button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active', value: String(activeCount), color: 'text-[#0F4C81]' },
            { label: 'Completed', value: String(doneCount), color: 'text-green-600' },
            { label: 'Overdue', value: String(overdue), color: overdue > 0 ? 'text-red-600' : 'text-gray-400' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['', 'todo', 'in_progress', 'done', 'canceled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterStatus === s ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 hover:border-[#0F4C81]'}`}>
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0F4C81] p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0F4C81]">New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="What needs to get done?" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Additional details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Task'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 mb-3">No tasks yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Task</button>
            </div>
          ) : tasks.map(task => (
            <div key={task.id} className={`bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-sm transition ${task.status === 'done' ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => updateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0F4C81] cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[task.status]}`}>{task.status.replace('_', ' ')}</span>
                  {task.due_date && (
                    <span className={`text-xs ${task.due_date < todayStr && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      Due {task.due_date}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                {task.status !== 'in_progress' && task.status !== 'done' && (
                  <button onClick={() => updateStatus(task.id, 'in_progress')} className="text-xs text-blue-600 hover:underline">Start</button>
                )}
                <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
