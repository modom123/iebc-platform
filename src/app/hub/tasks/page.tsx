'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done' | 'canceled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  assigned_to: string | null
  user_id: string
  created_at: string
}

type Worker = { id: string; full_name: string | null; email: string | null }

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-gray-100 text-gray-500',
  medium: 'bg-blue-100 text-blue-600',
  high:   'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-orange-500', urgent: 'bg-red-500',
}

const STATUS_STYLES: Record<string, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-green-100 text-green-700',
  canceled:    'bg-gray-100 text-gray-400',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function workerLabel(w: Worker) { return w.full_name || w.email || w.id }

function initials(name: string | null, email: string | null) {
  if (name) return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (email || '?').slice(0, 2).toUpperCase()
}

function calendarDays(year: number, month: number): (Date | null)[] {
  const first  = new Date(year, month, 1)
  const last   = new Date(year, month + 1, 0)
  const days: (Date | null)[] = Array(first.getDay()).fill(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(null)
  return days
}

export default function TasksPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState<'list' | 'calendar'>('list')

  // List filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMine, setFilterMine]     = useState(false)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '', assigned_to: '',
  })

  // Calendar state
  const now = new Date()
  const [calYear, setCalYear]   = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const workerMap = Object.fromEntries(workers.map(w => [w.id, w]))

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ workers: 'true' })
    if (filterStatus) params.set('status', filterStatus)
    if (filterMine)   params.set('assigned_to', 'me')
    const res  = await fetch(`/api/tasks?${params}`)
    const data = await res.json()
    setTasks(data.tasks   || [])
    setWorkers(data.workers || [])
    setLoading(false)
  }, [filterStatus, filterMine])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        assigned_to: form.assigned_to || null,
        due_date:    form.due_date    || null,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })
      load()
    } else {
      const d = await res.json()
      setFormError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    load()
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    load()
  }

  const todayStr   = now.toISOString().split('T')[0]
  const overdue    = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done' && t.status !== 'canceled').length
  const doneCount  = tasks.filter(t => t.status === 'done').length
  const activeCount = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length
  const mineCount  = tasks.filter(t => t.assigned_to && workers.find(w => w.id === t.assigned_to)).length

  // Tasks keyed by due_date for calendar
  const tasksByDate: Record<string, Task[]> = {}
  for (const t of tasks) {
    if (t.due_date) {
      tasksByDate[t.due_date] = tasksByDate[t.due_date] || []
      tasksByDate[t.due_date].push(t)
    }
  }

  const calDays     = calendarDays(calYear, calMonth)
  const selectedTasks = selectedDay ? (tasksByDate[selectedDay] || []) : []

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
    setSelectedDay(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/hub" className="text-gray-400 hover:text-gray-600 text-sm">← Hub</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Tasks</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${view === 'list' ? 'bg-[#0B2140] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              ☰ List
            </button>
            <button onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${view === 'calendar' ? 'bg-[#0B2140] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              ▦ Calendar
            </button>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Task</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active',    value: activeCount, color: 'text-[#0B2140]' },
            { label: 'Completed', value: doneCount,   color: 'text-green-600' },
            { label: 'Overdue',   value: overdue,     color: overdue > 0 ? 'text-red-600' : 'text-gray-400' },
            { label: 'Assigned',  value: mineCount,   color: 'text-amber-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Add Task form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0B2140]/30 p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-[#0B2140]">New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B2140]"
                  placeholder="What needs to get done?" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B2140]"
                  placeholder="Additional details..." />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B2140]">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Due Date</label>
                  <input type="date" value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B2140]" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Assign To</label>
                  <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B2140]">
                    <option value="">Unassigned</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{workerLabel(w)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Saving...' : 'Save Task'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────── */}
        {view === 'list' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <button onClick={() => setFilterMine(!filterMine)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition border ${filterMine ? 'bg-[#0B2140] text-white border-[#0B2140]' : 'bg-white border-gray-300 text-gray-600 hover:border-[#0B2140]'}`}>
                {filterMine ? '★ Mine' : '☆ Mine'}
              </button>
              <div className="w-px h-5 bg-gray-200" />
              {['', 'todo', 'in_progress', 'done', 'canceled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterStatus === s ? 'bg-[#0B2140] text-white' : 'bg-white border border-gray-200 hover:border-[#0B2140]'}`}>
                  {s === '' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Task list */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-400 mb-3">No tasks yet</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add First Task</button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => {
                  const assignee = task.assigned_to ? workerMap[task.assigned_to] : null
                  const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'done' && task.status !== 'canceled'
                  return (
                    <div key={task.id}
                      className={`bg-white rounded-xl border p-4 flex items-start gap-3 hover:shadow-sm transition ${task.status === 'done' ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
                      {/* Checkbox */}
                      <input type="checkbox" checked={task.status === 'done'}
                        onChange={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer shrink-0" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          {task.due_date && (
                            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                              {isOverdue ? '⚠ Overdue · ' : 'Due '}
                              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignee + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Assignee avatar / picker */}
                        <select
                          value={task.assigned_to || ''}
                          onChange={e => updateTask(task.id, { assigned_to: e.target.value || null })}
                          title="Assign to worker"
                          className={`text-xs rounded-lg px-2 py-1 border cursor-pointer focus:outline-none max-w-[130px] truncate ${
                            assignee ? 'bg-amber-50 border-amber-200 text-amber-800 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                          <option value="">Unassigned</option>
                          {workers.map(w => (
                            <option key={w.id} value={w.id}>{workerLabel(w)}</option>
                          ))}
                        </select>
                        {task.status !== 'in_progress' && task.status !== 'done' && (
                          <button onClick={() => updateTask(task.id, { status: 'in_progress' })}
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                            Start
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.id)}
                          className="text-xs text-red-400 hover:text-red-600">Del</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR VIEW ─────────────────────────────────────── */}
        {view === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            {/* Calendar grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                  ‹
                </button>
                <h2 className="font-bold text-gray-800">
                  {MONTHS[calMonth]} {calYear}
                </h2>
                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calDays.map((day, i) => {
                  if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/50" />
                  const dateStr  = day.toISOString().split('T')[0]
                  const dayTasks = tasksByDate[dateStr] || []
                  const isToday  = dateStr === todayStr
                  const isSelected = dateStr === selectedDay
                  const hasOverdue = dayTasks.some(t => t.status !== 'done' && t.status !== 'canceled' && dateStr < todayStr)
                  return (
                    <div key={i}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition ${
                        isSelected ? 'bg-[#0B2140]/5 border-[#0B2140]/20' :
                        isToday ? 'bg-amber-50' :
                        hasOverdue ? 'bg-red-50/60' :
                        'hover:bg-gray-50'
                      }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        isToday ? 'bg-[#0B2140] text-white' : 'text-gray-700'
                      }`}>
                        {day.getDate()}
                      </div>
                      {/* Task dots */}
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 3).map(t => (
                          <div key={t.id} className="flex items-center gap-1 group">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                            <span className={`text-[10px] leading-tight truncate ${
                              t.status === 'done' ? 'text-gray-300 line-through' : 'text-gray-600 group-hover:text-gray-800'
                            }`}>
                              {t.title}
                            </span>
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <p className="text-[10px] text-gray-400 font-medium">+{dayTasks.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4">
                {[
                  { color: 'bg-red-500',    label: 'Urgent' },
                  { color: 'bg-orange-500', label: 'High' },
                  { color: 'bg-blue-500',   label: 'Medium' },
                  { color: 'bg-gray-400',   label: 'Low' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-xs text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day panel */}
            <div className="space-y-4">
              {/* Today's tasks shortcut */}
              {!selectedDay && (
                <button onClick={() => setSelectedDay(todayStr)}
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left hover:bg-amber-100 transition">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Today</p>
                  <p className="text-sm font-semibold text-amber-900">
                    {(tasksByDate[todayStr] || []).length} task{(tasksByDate[todayStr] || []).length !== 1 ? 's' : ''} due
                  </p>
                </button>
              )}

              {selectedDay ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                  </div>

                  {selectedTasks.length === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-sm text-gray-400 mb-3">No tasks due this day.</p>
                      <button onClick={() => {
                        setForm(f => ({ ...f, due_date: selectedDay }))
                        setShowForm(true)
                      }} className="text-xs text-[#0B2140] font-semibold hover:underline">
                        + Add task for this date
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {selectedTasks.map(task => {
                        const assignee = task.assigned_to ? workerMap[task.assigned_to] : null
                        return (
                          <div key={task.id} className="p-3 flex items-start gap-2.5">
                            <input type="checkbox" checked={task.status === 'done'}
                              onChange={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 cursor-pointer shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                                  {task.priority}
                                </span>
                                {assignee && (
                                  <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <span className="w-3 h-3 rounded-full bg-amber-200 flex items-center justify-center text-[8px] font-bold">
                                      {initials(assignee.full_name, assignee.email)[0]}
                                    </span>
                                    {workerLabel(assignee).split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_STYLES[task.status]}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="px-4 py-2 border-t border-gray-50">
                    <button onClick={() => {
                      setForm(f => ({ ...f, due_date: selectedDay }))
                      setShowForm(true)
                    }} className="text-xs text-[#0B2140] font-semibold hover:underline">
                      + Add task for this date
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Upcoming</p>
                  {loading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks
                        .filter(t => t.due_date && t.due_date >= todayStr && t.status !== 'done' && t.status !== 'canceled')
                        .slice(0, 6)
                        .map(task => (
                          <div key={task.id} className="flex items-center gap-2 text-sm cursor-pointer"
                            onClick={() => setSelectedDay(task.due_date!)}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                            <span className="flex-1 text-gray-700 truncate">{task.title}</span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {new Date(task.due_date! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      {tasks.filter(t => t.due_date && t.due_date >= todayStr && t.status !== 'done').length === 0 && (
                        <p className="text-sm text-gray-400">No upcoming tasks with due dates.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
