'use client'
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary text-sm py-2">
      Print / Save PDF
    </button>
  )
}
