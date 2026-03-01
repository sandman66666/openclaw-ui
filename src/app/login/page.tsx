'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from   = params.get('from') || '/'

  const [token, setToken] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/ui/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: token }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.token) {
      // Store the session token for API requests
      localStorage.setItem('oc-token', data.token)
      router.push(from)
      router.refresh()
    } else {
      setError(data.error || 'Invalid token')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🦀</div>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
            OpenClaw
          </h1>
          <p style={{ color: '#666', fontSize: '13px', margin: '6px 0 0' }}>
            Enter your bridge token to continue
          </p>
          <p style={{ color: '#444', fontSize: '11px', margin: '4px 0 0' }}>
            Find it in your terminal where nav8claw is running
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value.trim())}
            placeholder="Bridge token (e.g. 57e4e1e50e504...)"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: `1px solid ${error ? '#ef4444' : '#2a2a2a'}`,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontFamily: 'monospace',
              padding: '10px 14px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: '100%',
              background: loading || !token ? '#222' : '#fff',
              color: loading || !token ? '#555' : '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              padding: '10px',
              cursor: loading || !token ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
