'use client'
import { useState } from 'react'

type Props = {
  initialName: string
  initialCompany: string
}

export default function ProfileForm({ initialName, initialCompany }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(initialName)
  const [company, setCompany] = useState(initialCompany)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, company_name: company }),
    })
    if (res.ok) {
      setSuccess(true)
      setEditing(false)
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save')
    }
    setSaving(false)
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
          <p className="mt-1 font-medium text-gray-800">{name || '—'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company Name</label>
          <p className="mt-1 font-medium text-gray-800">{company || '—'}</p>
        </div>
        {success && <p className="text-green-600 text-sm">Profile updated successfully.</p>}
        <button onClick={() => setEditing(true)} className="btn-secondary text-sm mt-2">Edit Profile</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Company Name</label>
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Your business name"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
      </div>
    </form>
  )
}
