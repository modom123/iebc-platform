'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type BankAccount = {
  id: string; name: string; official_name: string; type: string;
  subtype: string; mask: string; current_balance: number; available_balance: number; is_active: boolean
}
type Connection = {
  id: string; institution_name: string; plaid_item_id: string;
  last_synced_at: string; created_at: string; bank_accounts: BankAccount[]
}

const fmt = (n: number | null) => n != null ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'
const ACCOUNT_ICONS: Record<string, string> = { depository: '🏦', credit: '💳', investment: '📈', loan: '🏠', other: '💰' }

declare global {
  interface Window {
    Plaid: {
      create: (config: {
        token: string;
        onSuccess: (public_token: string, metadata: { institution: { name: string; institution_id: string } }) => void;
        onExit: () => void;
        onLoad?: () => void;
      }) => { open: () => void };
    }
  }
}

export default function ConnectPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [plaidReady, setPlaidReady] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<{ added: number; modified: number } | null>(null)
  const [error, setError] = useState('')

  const loadConnections = useCallback(async () => {
    const res = await fetch('/api/accounting/plaid/accounts')
    const data = await res.json()
    setConnections(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadConnections()
    // Load Plaid Link script
    const script = document.createElement('script')
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    script.onload = () => setPlaidReady(true)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [loadConnections])

  const handleConnect = async () => {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch('/api/accounting/plaid/link', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to initialize connection'); setConnecting(false); return }

      const handler = window.Plaid.create({
        token: data.link_token,
        onSuccess: async (public_token, metadata) => {
          const exchRes = await fetch('/api/accounting/plaid/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_token,
              institution_name: metadata.institution.name,
              institution_id: metadata.institution.institution_id,
            }),
          })
          const exchData = await exchRes.json()
          if (exchRes.ok) {
            await loadConnections()
            // Auto-sync on connect
            await handleSync(exchData.connection_id)
          } else {
            setError(exchData.error || 'Failed to connect account')
          }
          setConnecting(false)
        },
        onExit: () => setConnecting(false),
      })
      handler.open()
    } catch {
      setError('Failed to load Plaid. Check your configuration.')
      setConnecting(false)
    }
  }

  const handleSync = async (connectionId?: string) => {
    setSyncing(connectionId || 'all')
    setLastSyncResult(null)
    const res = await fetch('/api/accounting/plaid/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId }),
    })
    const data = await res.json()
    if (res.ok) {
      setLastSyncResult({ added: data.added, modified: data.modified })
      await loadConnections()
    }
    setSyncing(null)
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this institution? Existing transactions will remain.')) return
    await fetch(`/api/accounting/plaid/accounts?id=${id}`, { method: 'DELETE' })
    loadConnections()
  }

  const totalBalance = connections.flatMap(c => c.bank_accounts || [])
    .filter(a => a.type === 'depository' && a.is_active)
    .reduce((s, a) => s + (a.current_balance || 0), 0)
  const totalCredit = connections.flatMap(c => c.bank_accounts || [])
    .filter(a => a.type === 'credit' && a.is_active)
    .reduce((s, a) => s + Math.abs(a.current_balance || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Bank & Card Connections</h1>
        </div>
        <div className="flex gap-2">
          {connections.length > 0 && (
            <button onClick={() => handleSync()} disabled={!!syncing} className="btn-secondary text-sm py-2">
              {syncing === 'all' ? 'Syncing...' : '↻ Sync All'}
            </button>
          )}
          <button onClick={handleConnect} disabled={connecting || !plaidReady} className="btn-primary text-sm">
            {connecting ? 'Opening...' : '+ Connect Account'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Balance Summary */}
        {connections.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Total Bank Balance</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{fmt(totalBalance)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Credit Card Balance</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{fmt(totalCredit)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Connected Institutions</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{connections.length}</p>
            </div>
          </div>
        )}

        {/* Sync result banner */}
        {lastSyncResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex gap-2 items-center">
            <span className="text-green-600 font-semibold">✓ Sync complete:</span>
            <span className="text-green-700 text-sm">{lastSyncResult.added} transactions imported, {lastSyncResult.modified} updated</span>
            <button onClick={() => setLastSyncResult(null)} className="ml-auto text-green-400 hover:text-green-600 text-xs">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">
            {error}
            {error.includes('not configured') && (
              <p className="text-xs mt-1 text-red-500">Add PLAID_CLIENT_ID and PLAID_SECRET to your Vercel environment variables. Get credentials at <strong>plaid.com/docs</strong></p>
            )}
          </div>
        )}

        {/* Connection list */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-14 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Connect Your Bank</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Securely connect your bank accounts and credit cards via Plaid. Transactions sync automatically, matching to your books in real-time.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-gray-400">
              {['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One', '10,000+ more'].map(b => (
                <span key={b} className="bg-gray-100 px-3 py-1 rounded-full">{b}</span>
              ))}
            </div>
            <button onClick={handleConnect} disabled={connecting || !plaidReady} className="btn-primary">
              {connecting ? 'Launching...' : '+ Connect Your First Account'}
            </button>
            <p className="text-xs text-gray-400 mt-4">Bank-grade 256-bit encryption · Read-only access · Powered by Plaid</p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map(conn => (
              <div key={conn.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{conn.institution_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last synced: {conn.last_synced_at ? new Date(conn.last_synced_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(conn.id)}
                      disabled={!!syncing}
                      className="text-xs bg-[#0F4C81] text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {syncing === conn.id ? 'Syncing...' : '↻ Sync'}
                    </button>
                    <button onClick={() => handleDisconnect(conn.id)} className="text-xs text-red-400 hover:text-red-600 px-2">Disconnect</button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {(conn.bank_accounts || []).map(acc => (
                    <div key={acc.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ACCOUNT_ICONS[acc.type] || '💰'}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{acc.name}</p>
                          <p className="text-xs text-gray-400">{acc.subtype?.replace('_', ' ')} {acc.mask ? `···${acc.mask}` : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-mono text-sm ${acc.type === 'credit' ? 'text-red-600' : 'text-gray-800'}`}>
                          {fmt(acc.current_balance)}
                        </p>
                        {acc.available_balance != null && acc.type !== 'credit' && (
                          <p className="text-xs text-gray-400">{fmt(acc.available_balance)} available</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
          <p className="font-semibold">🔒 Bank-grade security</p>
          <p>IEBC uses Plaid to connect to your financial institutions. We never store your bank credentials. All data is encrypted in transit and at rest. Plaid holds SOC 2 Type II certification.</p>
        </div>
      </div>
    </main>
  )
}
