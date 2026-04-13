'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Employee = {
  id: string
  name: string
  email: string
  title: string
  pay_type: 'salary' | 'hourly'
  pay_rate: number
  filing_status: string
  allowances: number
  status: 'active' | 'inactive'
}

type PayRun = {
  id: string
  period_start: string
  period_end: string
  pay_date: string
  total_gross: number
  total_taxes: number
  total_net: number
  status: 'draft' | 'processed' | 'paid'
  employee_count: number
}

type PayStub = {
  employee_id: string
  employee_name: string
  gross_pay: number
  federal_tax: number
  state_tax: number
  social_security: number
  medicare: number
  net_pay: number
  hours?: number
}

const FED_TAX_RATE = 0.22
const STATE_TAX_RATE = 0.05
const SS_RATE = 0.062
const MEDICARE_RATE = 0.0145

function calcTaxes(gross: number) {
  const federal = gross * FED_TAX_RATE
  const state = gross * STATE_TAX_RATE
  const ss = gross * SS_RATE
  const medicare = gross * MEDICARE_RATE
  const total_taxes = federal + state + ss + medicare
  return { federal, state, ss, medicare, total_taxes, net: gross - total_taxes }
}

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PayrollPage() {
  const [tab, setTab] = useState<'employees' | 'runs' | 'run_payroll'>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payRuns, setPayRuns] = useState<PayRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEmp, setShowAddEmp] = useState(false)
  const [empForm, setEmpForm] = useState({
    name: '', email: '', title: '', pay_type: 'salary' as 'salary' | 'hourly',
    pay_rate: '', filing_status: 'single', allowances: '1',
  })

  // Run payroll state
  const [runPeriodStart, setRunPeriodStart] = useState('')
  const [runPeriodEnd, setRunPeriodEnd] = useState('')
  const [runPayDate, setRunPayDate] = useState('')
  const [runHours, setRunHours] = useState<Record<string, string>>({})
  const [stubs, setStubs] = useState<PayStub[]>([])
  const [runPreview, setRunPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [empRes, runsRes] = await Promise.all([
      fetch('/api/accounting/payroll?type=employees'),
      fetch('/api/accounting/payroll?type=runs'),
    ])
    const [empData, runsData] = await Promise.all([empRes.json(), runsRes.json()])
    setEmployees(empData.employees || [])
    setPayRuns(runsData.runs || [])
    setLoading(false)
  }

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/accounting/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_employee', ...empForm, pay_rate: Number(empForm.pay_rate), allowances: Number(empForm.allowances) }),
    })
    if (res.ok) {
      setMsg('Employee added!')
      setShowAddEmp(false)
      setEmpForm({ name: '', email: '', title: '', pay_type: 'salary', pay_rate: '', filing_status: 'single', allowances: '1' })
      fetchData()
    } else {
      setMsg('Error adding employee')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleEmployee(id: string, status: string) {
    await fetch('/api/accounting/payroll', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: status === 'active' ? 'inactive' : 'active' }),
    })
    fetchData()
  }

  function previewPayroll() {
    const activeEmps = employees.filter(e => e.status === 'active')
    const computed: PayStub[] = activeEmps.map(emp => {
      let gross = 0
      if (emp.pay_type === 'salary') {
        gross = emp.pay_rate / 26 // bi-weekly
      } else {
        const hrs = Number(runHours[emp.id] || 80)
        gross = emp.pay_rate * hrs
      }
      const taxes = calcTaxes(gross)
      return {
        employee_id: emp.id,
        employee_name: emp.name,
        gross_pay: gross,
        federal_tax: taxes.federal,
        state_tax: taxes.state,
        social_security: taxes.ss,
        medicare: taxes.medicare,
        net_pay: taxes.net,
        hours: emp.pay_type === 'hourly' ? Number(runHours[emp.id] || 80) : undefined,
      }
    })
    setStubs(computed)
    setRunPreview(true)
  }

  async function processPayroll() {
    setSaving(true)
    const res = await fetch('/api/accounting/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'run_payroll',
        period_start: runPeriodStart,
        period_end: runPeriodEnd,
        pay_date: runPayDate,
        stubs,
      }),
    })
    if (res.ok) {
      setMsg('Payroll processed!')
      setRunPreview(false)
      setRunPeriodStart('')
      setRunPeriodEnd('')
      setRunPayDate('')
      setRunHours({})
      setStubs([])
      setTab('runs')
      fetchData()
    } else {
      setMsg('Error processing payroll')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const activeCount = employees.filter(e => e.status === 'active').length
  const ytdGross = payRuns.reduce((s, r) => s + Number(r.total_gross), 0)
  const ytdTax = payRuns.reduce((s, r) => s + Number(r.total_taxes), 0)

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/accounting" className="text-gray-400 hover:text-gray-600 text-sm">← Accounting</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Payroll</span>
        </div>
        <div className="flex gap-3 text-sm items-center">
          <button onClick={() => { setTab('run_payroll'); setRunPreview(false) }}
            className="bg-[#0F4C81] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-800 transition">
            Run Payroll
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Employees', value: String(activeCount), color: 'text-[#0F4C81]' },
            { label: 'Pay Runs (YTD)', value: String(payRuns.length), color: 'text-gray-700' },
            { label: 'Gross Paid (YTD)', value: fmt(ytdGross), color: 'text-green-700' },
            { label: 'Taxes Withheld (YTD)', value: fmt(ytdTax), color: 'text-orange-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['employees', 'runs', 'run_payroll'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'run_payroll' ? 'Run Payroll' : t === 'runs' ? 'Pay History' : 'Employees'}
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {tab === 'employees' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Employees</h2>
              <button onClick={() => setShowAddEmp(true)}
                className="bg-[#0F4C81] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 transition">
                + Add Employee
              </button>
            </div>

            {/* Add Employee Form */}
            {showAddEmp && (
              <div className="p-5 border-b border-gray-100 bg-blue-50">
                <h3 className="font-semibold text-gray-800 mb-4">New Employee</h3>
                <form onSubmit={addEmployee} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label-sm">Full Name*</label>
                    <input className="input-field" required value={empForm.name}
                      onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-sm">Email</label>
                    <input className="input-field" type="email" value={empForm.email}
                      onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-sm">Job Title</label>
                    <input className="input-field" value={empForm.title}
                      onChange={e => setEmpForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-sm">Pay Type*</label>
                    <select className="input-field" value={empForm.pay_type}
                      onChange={e => setEmpForm(p => ({ ...p, pay_type: e.target.value as 'salary' | 'hourly' }))}>
                      <option value="salary">Salary (Annual)</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-sm">{empForm.pay_type === 'salary' ? 'Annual Salary ($)*' : 'Hourly Rate ($)*'}</label>
                    <input className="input-field" type="number" required min="0" step="0.01" value={empForm.pay_rate}
                      onChange={e => setEmpForm(p => ({ ...p, pay_rate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-sm">Filing Status</label>
                    <select className="input-field" value={empForm.filing_status}
                      onChange={e => setEmpForm(p => ({ ...p, filing_status: e.target.value }))}>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="married_separately">Married Filing Separately</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-3 flex gap-3">
                    <button type="submit" disabled={saving}
                      className="bg-[#0F4C81] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                      {saving ? 'Saving...' : 'Add Employee'}
                    </button>
                    <button type="button" onClick={() => setShowAddEmp(false)}
                      className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm mb-3">No employees yet</p>
                <button onClick={() => setShowAddEmp(true)} className="btn-primary text-sm">Add First Employee</button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Pay Type</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Net/Period (est.)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => {
                    const gross = emp.pay_type === 'salary' ? emp.pay_rate / 26 : emp.pay_rate * 80
                    const { net } = calcTaxes(gross)
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium">{emp.name}</p>
                          {emp.email && <p className="text-xs text-gray-400">{emp.email}</p>}
                        </td>
                        <td className="p-3 text-gray-600">{emp.title || '—'}</td>
                        <td className="p-3 capitalize text-gray-600">{emp.pay_type}</td>
                        <td className="p-3 text-right font-mono">
                          {fmt(emp.pay_rate)}{emp.pay_type === 'hourly' ? '/hr' : '/yr'}
                        </td>
                        <td className="p-3 text-right font-mono text-green-700">{fmt(net)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => toggleEmployee(emp.id, emp.status)}
                            className="text-xs text-gray-400 hover:text-gray-700 underline">
                            {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pay History Tab */}
        {tab === 'runs' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Pay Run History</h2>
            </div>
            {payRuns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm mb-3">No pay runs yet</p>
                <button onClick={() => setTab('run_payroll')} className="btn-primary text-sm">Run First Payroll</button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-3 text-left">Pay Period</th>
                  <th className="p-3 text-left">Pay Date</th>
                  <th className="p-3 text-center">Employees</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Taxes</th>
                  <th className="p-3 text-right">Net</th>
                  <th className="p-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {payRuns.map(run => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{run.period_start} – {run.period_end}</td>
                      <td className="p-3 text-gray-600">{run.pay_date}</td>
                      <td className="p-3 text-center text-gray-600">{run.employee_count}</td>
                      <td className="p-3 text-right font-mono">{fmt(run.total_gross)}</td>
                      <td className="p-3 text-right font-mono text-orange-600">{fmt(run.total_taxes)}</td>
                      <td className="p-3 text-right font-mono text-green-700 font-semibold">{fmt(run.total_net)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          run.status === 'paid' ? 'bg-green-100 text-green-700' :
                          run.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{run.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold text-sm">
                    <td className="p-3" colSpan={3}>YTD Total</td>
                    <td className="p-3 text-right font-mono">{fmt(ytdGross)}</td>
                    <td className="p-3 text-right font-mono text-orange-600">{fmt(ytdTax)}</td>
                    <td className="p-3 text-right font-mono text-green-700">{fmt(ytdGross - ytdTax)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* Run Payroll Tab */}
        {tab === 'run_payroll' && !runPreview && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Run New Payroll</h2>
              <p className="text-sm text-gray-500 mt-0.5">Taxes auto-calculated (22% fed, 5% state, SS 6.2%, Medicare 1.45%)</p>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-sm">Period Start*</label>
                  <input className="input-field" type="date" value={runPeriodStart}
                    onChange={e => setRunPeriodStart(e.target.value)} />
                </div>
                <div>
                  <label className="label-sm">Period End*</label>
                  <input className="input-field" type="date" value={runPeriodEnd}
                    onChange={e => setRunPeriodEnd(e.target.value)} />
                </div>
                <div>
                  <label className="label-sm">Pay Date*</label>
                  <input className="input-field" type="date" value={runPayDate}
                    onChange={e => setRunPayDate(e.target.value)} />
                </div>
              </div>

              {activeCount === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm">No active employees. Add employees first.</p>
                </div>
              ) : (
                <>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Active Employees</div>
                    {employees.filter(e => e.status === 'active').map(emp => {
                      const hrs = Number(runHours[emp.id] || 80)
                      const gross = emp.pay_type === 'salary' ? emp.pay_rate / 26 : emp.pay_rate * hrs
                      const { net } = calcTaxes(gross)
                      return (
                        <div key={emp.id} className="p-4 border-t border-gray-100 flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{emp.pay_type} · {emp.title || 'Employee'}</p>
                          </div>
                          {emp.pay_type === 'hourly' && (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-500">Hours:</label>
                              <input type="number" min="0" step="0.5" value={runHours[emp.id] || '80'}
                                onChange={e => setRunHours(p => ({ ...p, [emp.id]: e.target.value }))}
                                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center" />
                            </div>
                          )}
                          <div className="text-right min-w-[120px]">
                            <p className="text-sm font-mono font-semibold">Gross: {fmt(gross)}</p>
                            <p className="text-xs text-green-600 font-mono">Net: {fmt(net)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={!runPeriodStart || !runPeriodEnd || !runPayDate}
                      onClick={previewPayroll}
                      className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-800 transition disabled:opacity-40">
                      Preview Payroll
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview / Confirm */}
        {tab === 'run_payroll' && runPreview && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Payroll Preview</h2>
              <p className="text-sm text-gray-500 mt-0.5">{runPeriodStart} – {runPeriodEnd} · Pay date: {runPayDate}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Federal</th>
                  <th className="p-3 text-right">State</th>
                  <th className="p-3 text-right">SS</th>
                  <th className="p-3 text-right">Medicare</th>
                  <th className="p-3 text-right font-bold">Net Pay</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {stubs.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.employee_name}{s.hours !== undefined && <span className="text-xs text-gray-400 ml-1">({s.hours}h)</span>}</td>
                      <td className="p-3 text-right font-mono">{fmt(s.gross_pay)}</td>
                      <td className="p-3 text-right font-mono text-orange-600">({fmt(s.federal_tax)})</td>
                      <td className="p-3 text-right font-mono text-orange-600">({fmt(s.state_tax)})</td>
                      <td className="p-3 text-right font-mono text-orange-600">({fmt(s.social_security)})</td>
                      <td className="p-3 text-right font-mono text-orange-600">({fmt(s.medicare)})</td>
                      <td className="p-3 text-right font-mono text-green-700 font-bold">{fmt(s.net_pay)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold">
                    <td className="p-3">TOTAL ({stubs.length} employees)</td>
                    <td className="p-3 text-right font-mono">{fmt(stubs.reduce((s, r) => s + r.gross_pay, 0))}</td>
                    <td className="p-3 text-right font-mono text-orange-600">({fmt(stubs.reduce((s, r) => s + r.federal_tax, 0))})</td>
                    <td className="p-3 text-right font-mono text-orange-600">({fmt(stubs.reduce((s, r) => s + r.state_tax, 0))})</td>
                    <td className="p-3 text-right font-mono text-orange-600">({fmt(stubs.reduce((s, r) => s + r.social_security, 0))})</td>
                    <td className="p-3 text-right font-mono text-orange-600">({fmt(stubs.reduce((s, r) => s + r.medicare, 0))})</td>
                    <td className="p-3 text-right font-mono text-green-700">{fmt(stubs.reduce((s, r) => s + r.net_pay, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-5 flex gap-3 border-t border-gray-100">
              <button onClick={processPayroll} disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-50">
                {saving ? 'Processing...' : 'Confirm & Process Payroll'}
              </button>
              <button onClick={() => setRunPreview(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Back
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
