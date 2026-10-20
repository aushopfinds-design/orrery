import { useEffect, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'

export default function SandboxCheckout({ input }: { input: BirthInput }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('session_id')
    if (params.get('checkout') !== 'success' || !id) return
    let active = true
    setChecking(true)
    fetch('/api/stripe-verify?session_id=' + encodeURIComponent(id))
      .then(response => response.json())
      .then(result => {
        if (!active) return
        setChecking(false)
        setVerified(result.verified === true)
        setMessage(result.verified ? 'Sandbox payment verified. Your test purchase was successful.' : 'Payment not verified. No paid report has been unlocked.')
      })
      .catch(() => { if (active) { setChecking(false); setMessage('Could not verify the payment. Please try again later.') } })
    return () => { active = false }
  }, [])
  async function checkout() {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/stripe-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'complete', birthDraft: JSON.stringify(input) }),
      })
      const result = await response.json()
      if (!response.ok || !/^https:\/\/checkout\.stripe\.com\//.test(result.url ?? '')) throw new Error(result.error || 'Checkout is unavailable.')
      window.location.assign(result.url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout is unavailable.')
      setBusy(false)
    }
  }
  if (!window.location.hostname.endsWith('.vercel.app')) return <p role="status">Secure checkout is not available yet.</p>
  return <div className="fate-personal-delivery">
    <p><strong>Sandbox checkout — US$14.99</strong></p>
    <p>Test payments only. No real charge will be made. Paid report delivery is not active yet.</p>
    <button type="button" className="fate-complete-primary" onClick={checkout} disabled={busy}>{busy ? 'Opening test checkout…' : 'Test checkout — $14.99'}</button>
    {checking && <p role="status">Verifying your test payment…</p>}
    {message && <p role="status">{message}</p>}
    {verified && <p role="status">Payment confirmation complete. Report fulfillment remains in development.</p>}
  </div>
}
