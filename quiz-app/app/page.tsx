'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBegin(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your first and last name.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: dbError } = await getClient()
      .from('session_1_finance_sessions')
      .insert({ first_name: firstName.trim(), last_name: lastName.trim() })
      .select('id')
      .single()

    if (dbError || !data) {
      setError('Could not start session. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/quiz?session=${data.id}`)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      padding: '1rem',
    }}>
      <div style={{
        background: '#12121a',
        border: '1px solid #1e1e2e',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '1.75rem',
            color: '#f0f0ff',
            marginBottom: '0.4rem',
            lineHeight: 1.2,
          }}>
            Finance — Session 1
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#8888aa',
            fontSize: '1rem',
          }}>
            Attention Check
          </p>
        </div>

        <form onSubmit={handleBegin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              color: '#8888aa',
              fontSize: '0.85rem',
              marginBottom: '0.4rem',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              autoComplete="given-name"
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#f0f0ff',
                fontSize: '1rem',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#6c63ff')}
              onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#8888aa',
              fontSize: '0.85rem',
              marginBottom: '0.4rem',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter your last name"
              autoComplete="family-name"
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#f0f0ff',
                fontSize: '1rem',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#6c63ff')}
              onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
            />
          </div>

          {error && (
            <p style={{ color: '#ff4f4f', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#4a4580' : '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '1rem',
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Starting…' : 'Begin'}
          </button>
        </form>
      </div>
    </main>
  )
}
