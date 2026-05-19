'use client'

import { useState } from 'react'
import { getClient } from '@/lib/supabase'
import { QUIZZES, QuizConfig } from '@/lib/quiz-config'

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password !== '331011') {
      setPwError('Incorrect password.')
      return
    }
    setLoading(true)
    setPwError('')
    const data = await fetchSessions(QUIZZES[0])
    if (!data) {
      setFetchError('Failed to load results. Please try again.')
      setLoading(false)
      return
    }
    setSessions(data)
    setAuthed(true)
    setLoading(false)
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
              {activeQuiz.label} — Results
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

        {/* Quiz tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {QUIZZES.map(q => {
            const isActive = q.id === activeQuiz.id
            return (
              <button
                key={q.id}
                onClick={() => handleTabSwitch(q)}
                disabled={tabLoading}
                style={{
                  background: isActive ? '#6c63ff' : '#12121a',
                  color: isActive ? '#fff' : '#8888aa',
                  border: `1px solid ${isActive ? '#6c63ff' : '#2a2a3e'}`,
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  cursor: tabLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {q.label}
              </button>
            )
          })}
        </div>
        {fetchError && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>{fetchError}</p>
        )}

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
