'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClient, Question } from '@/lib/supabase'

type ShuffledQuestion = {
  id: number
  question_text: string
  options: { text: string; originalLetter: string }[]
  correctShuffledLetter: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

function buildShuffledQuestion(q: Question): ShuffledQuestion {
  const original = [
    { text: q.option_a, originalLetter: 'A' },
    { text: q.option_b, originalLetter: 'B' },
    { text: q.option_c, originalLetter: 'C' },
    { text: q.option_d, originalLetter: 'D' },
  ]
  const options = shuffle(original)
  const letters = ['A', 'B', 'C', 'D']
  const correctShuffledLetter = letters[options.findIndex(o => o.originalLetter === q.correct_option)]
  return { id: q.id, question_text: q.question_text, options, correctShuffledLetter }
}

const QUESTION_TIME = 30

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')

  const [questions, setQuestions] = useState<ShuffledQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const advancingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) { router.replace('/'); return }

    async function init() {
      const { data: sess } = await getClient()
        .from('session_1_finance_sessions')
        .select('completed_at')
        .eq('id', sessionId)
        .single()

      if (!sess) { router.replace('/'); return }
      if (sess.completed_at) { router.replace('/thank-you'); return }

      const cacheKey = `quiz_${sessionId}`
      const cached = sessionStorage.getItem(cacheKey)
      let qs: ShuffledQuestion[]

      if (cached) {
        qs = JSON.parse(cached)
      } else {
        const { data } = await getClient().from('session_1_finance_questions').select('*')
        if (!data) { router.replace('/'); return }
        qs = pickRandom(data as Question[], 10).map(buildShuffledQuestion)
        sessionStorage.setItem(cacheKey, JSON.stringify(qs))
      }

      const { data: answers } = await getClient()
        .from('session_1_finance_answers')
        .select('id')
        .eq('session_id', sessionId)

      const answered = answers?.length ?? 0
      if (answered >= qs.length) { router.replace('/thank-you'); return }

      setQuestions(qs)
      setCurrent(answered)
      setLoading(false)
    }

    init()
  }, [sessionId, router])

  const advance = useCallback(async (selectedOption: string | null, q: ShuffledQuestion, isTimeout: boolean) => {
    if (advancingRef.current) return
    advancingRef.current = true

    if (timerRef.current) clearInterval(timerRef.current)

    const isCorrect = selectedOption !== null ? selectedOption === q.correctShuffledLetter : null

    await getClient().from('session_1_finance_answers').insert({
      session_id: sessionId,
      question_id: q.id,
      selected_option: selectedOption,
      is_correct: isCorrect,
    })

    if (current + 1 >= questions.length) {
      const score = await getClient()
        .from('session_1_finance_answers')
        .select('is_correct')
        .eq('session_id', sessionId)
        .eq('is_correct', true)

      const count = score.data?.length ?? 0

      await getClient()
        .from('session_1_finance_sessions')
        .update({ completed_at: new Date().toISOString(), score: count })
        .eq('id', sessionId)

      router.push('/thank-you')
      return
    }

    setTimeout(() => {
      setCurrent(c => c + 1)
      setSelected(null)
      setTimeLeft(QUESTION_TIME)
      advancingRef.current = false
    }, isTimeout ? 0 : 300)
  }, [current, questions.length, sessionId, router])

  useEffect(() => {
    if (loading || questions.length === 0) return
    advancingRef.current = false
    setTimeLeft(QUESTION_TIME)

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          advance(null, questions[current], true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current, loading, questions.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(letter: string) {
    if (selected || advancingRef.current) return
    setSelected(letter)
    advance(letter, questions[current], false)
  }

  if (loading || questions.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8888aa', fontFamily: "'DM Sans', sans-serif" }}>Loading questions…</p>
      </main>
    )
  }

  const q = questions[current]
  const timerPct = (timeLeft / QUESTION_TIME) * 100
  const timerColor = timeLeft <= 8 ? '#ff4f4f' : '#6c63ff'
  const letters = ['A', 'B', 'C', 'D']

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
    }}>
      {/* Top bar */}
      <div style={{
        background: '#12121a',
        borderBottom: '1px solid #1e1e2e',
        padding: '1rem 1.5rem 0',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          maxWidth: '700px',
          margin: '0 auto 0.75rem',
        }}>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            color: '#8888aa',
            fontSize: '0.9rem',
          }}>
            Question {current + 1} of {questions.length}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            color: timerColor,
            fontSize: '0.9rem',
            fontWeight: 500,
            minWidth: '2rem',
            textAlign: 'right',
          }}>
            {timeLeft}s
          </span>
        </div>
        {/* Timer bar */}
        <div style={{
          height: '4px',
          background: '#1e1e2e',
          borderRadius: '2px',
          overflow: 'hidden',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          <div style={{
            height: '100%',
            width: `${timerPct}%`,
            background: timerColor,
            transition: 'width 1s linear, background 0.5s',
            borderRadius: '2px',
          }} />
        </div>
      </div>

      {/* Question + answers */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '700px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.25rem',
        gap: '2rem',
      }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
          color: '#f0f0ff',
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          {q.question_text}
        </h2>

        {/* 2×2 grid */}
        <div className="answer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}>
          {q.options.map((opt, i) => {
            const letter = letters[i]
            const isSelected = selected === letter
            const isHovered = hoveredOption === letter && !selected

            let bg = '#12121a'
            let borderColor = '#2a2a3e'
            let boxShadow = 'none'

            if (isSelected) {
              bg = '#1e1a3e'
              borderColor = '#6c63ff'
            } else if (isHovered) {
              borderColor = '#6c63ff'
              boxShadow = '0 0 0 3px rgba(108,99,255,0.15)'
            }

            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                onMouseEnter={() => setHoveredOption(letter)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={!!selected || advancingRef.current}
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '1.1rem 1rem',
                  color: '#f0f0ff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  lineHeight: 1.5,
                  cursor: selected ? 'default' : 'pointer',
                  textAlign: 'left',
                  boxShadow,
                  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                  wordBreak: 'break-word',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {opt.text}
              </button>
            )
          })}
        </div>
      </div>

    </main>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8888aa', fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
      </main>
    }>
      <QuizContent />
    </Suspense>
  )
}
