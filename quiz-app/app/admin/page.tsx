'use client'

import { useState } from 'react'
import { getClient } from '@/lib/supabase'
import { QUIZZES, QuizConfig } from '@/lib/quiz-config'

// Groups that have independently managed passcodes
const PASSCODE_GROUPS = [
  { id: 'finance', label: 'Finance' },
  { id: 'double-degree', label: 'Double Degree' },
]

type Session = {
  id: string
  first_name: string
  last_name: string
  score: number | null
  completed_at: string | null
  started_at: string
}

function grade(score: number | null): string {
  if (score === null) return 'Incomplete'
  if (score >= 9) return 'A'
  if (score >= 7) return 'B'
  if (score >= 5) return 'C'
  if (score >= 3) return 'D'
  return 'F'
}

function gradeLabel(g: string): string {
  const map: Record<string, string> = {
    A: 'Excellent', B: 'Good', C: 'Satisfactory', D: 'Poor', F: 'Fail', Incomplete: 'Incomplete',
  }
  return map[g] ?? g
}

function gradeColor(g: string): string {
  if (g === 'A') return '#4ade80'
  if (g === 'B') return '#60a5fa'
  if (g === 'C') return '#facc15'
  if (g === 'D') return '#f97316'
  if (g === 'F') return '#f87171'
  return '#8888aa'
}

function downloadTxt(sessions: Session[], quizLabel: string) {
  const lines = sessions.map(s => {
    const g = grade(s.score)
    const scoreStr = s.score !== null ? `${s.score}/10` : 'N/A'
    return `${s.first_name} ${s.last_name} | Score: ${scoreStr} | Grade: ${g} (${gradeLabel(g)})`
  })
  const header = `${quizLabel} — Results\n` + '='.repeat(40) + '\n\n'
  const content = header + lines.join('\n') + '\n'
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${quizLabel.toLowerCase().replace(/\s+/g, '-')}-results.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid #2a2a3e',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#f0f0ff',
  fontSize: '1rem',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
}

async function fetchSessions(quiz: QuizConfig): Promise<Session[] | null> {
  const { data, error } = await getClient()
    .from(quiz.sessionsTable)
    .select('id, first_name, last_name, score, completed_at, started_at')
    .order('started_at', { ascending: false })
  if (error) return null
  return (data as Session[]) ?? []
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pwError, setPwError] = useState('')
  const [activeQuiz, setActiveQuiz] = useState<QuizConfig>(QUIZZES[0])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // passcode management — one entry per group
  const [passcodes, setPasscodes] = useState<Record<string, string>>({})
  const [newPasscodes, setNewPasscodes] = useState<Record<string, string>>({})
  const [passcodeMsgs, setPasscodeMsgs] = useState<Record<string, string>>({})
  const [passcodeLoadings, setPasscodeLoadings] = useState<Record<string, boolean>>({})
  const [showPasscodes, setShowPasscodes] = useState<Record<string, boolean>>({})

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password !== 'ny26unav') {
      setPwError('Incorrect password.')
      return
    }
    setLoading(true)
    setPwError('')
    const [sessData, pcData] = await Promise.all([
      fetchSessions(QUIZZES[0]),
      getClient().from('app_settings').select('key, value').like('key', 'passcode_%'),
    ])
    if (!sessData) {
      setFetchError('Failed to load results. Please try again.')
      setLoading(false)
      return
    }
    setSessions(sessData)
    const map: Record<string, string> = {}
    for (const row of pcData.data ?? []) {
      map[row.key.replace('passcode_', '')] = row.value
    }
    setPasscodes(map)
    setAuthed(true)
    setLoading(false)
  }

  async function handleUpdatePasscode(groupId: string, e: React.FormEvent) {
    e.preventDefault()
    const val = newPasscodes[groupId] ?? ''
    if (!/^\d{6}$/.test(val)) {
      setPasscodeMsgs(m => ({ ...m, [groupId]: 'Must be exactly 6 digits.' }))
      return
    }
    setPasscodeLoadings(l => ({ ...l, [groupId]: true }))
    setPasscodeMsgs(m => ({ ...m, [groupId]: '' }))
    const { error } = await getClient()
      .from('app_settings')
      .update({ value: val })
      .eq('key', `passcode_${groupId}`)
    if (error) {
      setPasscodeMsgs(m => ({ ...m, [groupId]: 'Failed to update.' }))
    } else {
      setPasscodes(p => ({ ...p, [groupId]: val }))
      setNewPasscodes(n => ({ ...n, [groupId]: '' }))
      setPasscodeMsgs(m => ({ ...m, [groupId]: 'Updated.' }))
      setTimeout(() => setPasscodeMsgs(m => ({ ...m, [groupId]: '' })), 3000)
    }
    setPasscodeLoadings(l => ({ ...l, [groupId]: false }))
  }

  async function handleTabSwitch(quiz: QuizConfig) {
    if (quiz.id === activeQuiz.id) return
    setTabLoading(true)
    setFetchError('')
    const data = await fetchSessions(quiz)
    if (!data) {
      setFetchError('Failed to load results.')
      setTabLoading(false)
      return
    }
    setActiveQuiz(quiz)
    setSessions(data)
    setTabLoading(false)
  }

  if (!authed) {
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
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '1.5rem',
              color: '#f0f0ff',
              marginBottom: '0.3rem',
            }}>
              Admin
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#8888aa', fontSize: '0.9rem' }}>
              Enter password to view results
            </p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6c63ff')}
              onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
            />
            {pwError && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>
                {pwError}
              </p>
            )}
            {fetchError && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>
                {fetchError}
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
              }}
            >
              {loading ? 'Loading…' : 'Enter'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const completed = sessions.filter(s => s.completed_at !== null)
  const incomplete = sessions.filter(s => s.completed_at === null)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      padding: '2rem 1rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '1.5rem', color: '#f0f0ff', marginBottom: '0.2rem' }}>
              Results
            </h1>
            <p style={{ color: '#8888aa', fontSize: '0.9rem' }}>
              {completed.length} completed · {incomplete.length} incomplete
            </p>
          </div>
          <button
            onClick={() => downloadTxt(sessions, activeQuiz.label)}
            style={{
              background: '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.7rem 1.4rem',
              fontSize: '0.95rem',
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ↓ Download .txt
          </button>
        </div>

        {/* Quiz selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ color: '#8888aa', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
            Viewing results for:
          </label>
          <select
            value={activeQuiz.id}
            onChange={e => {
              const quiz = QUIZZES.find(q => q.id === e.target.value)
              if (quiz) handleTabSwitch(quiz)
            }}
            disabled={tabLoading}
            style={{
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: '8px',
              padding: '0.6rem 2.5rem 0.6rem 1rem',
              color: '#f0f0ff',
              fontSize: '0.95rem',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              cursor: tabLoading ? 'not-allowed' : 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238888aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.9rem center',
              minWidth: '220px',
            }}
          >
            {QUIZZES.map(q => (
              <option key={q.id} value={q.id} style={{ background: '#12121a' }}>
                {q.label}
              </option>
            ))}
          </select>
          {tabLoading && (
            <span style={{ color: '#8888aa', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>Loading…</span>
          )}
        </div>
        {fetchError && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>{fetchError}</p>
        )}

        {/* Passcode management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, color: '#f0f0ff', fontSize: '0.95rem' }}>
            Session Passcodes
          </span>
          {PASSCODE_GROUPS.map(group => {
            const current = passcodes[group.id] ?? ''
            const shown = showPasscodes[group.id] ?? false
            const newVal = newPasscodes[group.id] ?? ''
            const msg = passcodeMsgs[group.id] ?? ''
            const busy = passcodeLoadings[group.id] ?? false
            return (
              <div key={group.id} style={{
                background: '#12121a',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#8888aa', fontSize: '0.9rem' }}>
                    {group.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      color: '#6c63ff',
                      letterSpacing: '0.2em',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '6px',
                      padding: '0.2rem 0.7rem',
                    }}>
                      {shown ? (current || '—') : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowPasscodes(m => ({ ...m, [group.id]: !shown }))}
                      style={{
                        background: 'none',
                        border: '1px solid #2a2a3e',
                        borderRadius: '6px',
                        color: '#8888aa',
                        cursor: 'pointer',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.8rem',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {shown ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <form onSubmit={e => handleUpdatePasscode(group.id, e)} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={newVal}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '')
                      setNewPasscodes(m => ({ ...m, [group.id]: v }))
                      setPasscodeMsgs(m => ({ ...m, [group.id]: '' }))
                    }}
                    placeholder="New 6-digit code"
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      padding: '0.6rem 0.9rem',
                      color: '#f0f0ff',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.2em',
                      outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#6c63ff')}
                    onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    style={{
                      background: busy ? '#4a4580' : '#6c63ff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem 1.2rem',
                      fontSize: '0.9rem',
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                      cursor: busy ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {busy ? 'Saving…' : 'Update'}
                  </button>
                </form>
                {msg && (
                  <p style={{
                    fontSize: '0.85rem',
                    fontFamily: "'DM Sans', sans-serif",
                    color: msg === 'Updated.' ? '#4ade80' : '#f87171',
                    margin: 0,
                  }}>
                    {msg}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Grade legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(['A','B','C','D','F'] as const).map(g => (
            <span key={g} style={{
              background: '#12121a',
              border: `1px solid ${gradeColor(g)}`,
              borderRadius: '6px',
              padding: '0.25rem 0.7rem',
              fontSize: '0.8rem',
              color: gradeColor(g),
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {g} — {gradeLabel(g)} ({g === 'A' ? '9–10' : g === 'B' ? '7–8' : g === 'C' ? '5–6' : g === 'D' ? '3–4' : '0–2'})
            </span>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #1e1e2e' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#12121a', borderBottom: '1px solid #1e1e2e' }}>
                {['#', 'First Name', 'Last Name', 'Score', 'Grade', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    color: '#8888aa',
                    fontSize: '0.8rem',
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#8888aa' }}>
                    No sessions found.
                  </td>
                </tr>
              )}
              {sessions.map((s, i) => {
                const g = grade(s.score)
                const gc = gradeColor(g)
                const isComplete = s.completed_at !== null
                return (
                  <tr key={s.id} style={{
                    borderBottom: '1px solid #1e1e2e',
                    background: i % 2 === 0 ? '#0a0a0f' : '#0d0d14',
                  }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#8888aa', fontSize: '0.85rem' }}>{i + 1}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#f0f0ff' }}>{s.first_name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#f0f0ff' }}>{s.last_name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: isComplete ? '#f0f0ff' : '#8888aa', fontVariantNumeric: 'tabular-nums' }}>
                      {isComplete ? `${s.score ?? 0}/10` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {isComplete ? (
                        <span style={{
                          color: gc,
                          background: `${gc}18`,
                          border: `1px solid ${gc}55`,
                          borderRadius: '6px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}>
                          {g} — {gradeLabel(g)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        color: isComplete ? '#4ade80' : '#facc15',
                        background: isComplete ? '#4ade8015' : '#facc1515',
                        border: `1px solid ${isComplete ? '#4ade8055' : '#facc1555'}`,
                        borderRadius: '6px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.8rem',
                      }}>
                        {isComplete ? 'Completed' : 'In progress'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
