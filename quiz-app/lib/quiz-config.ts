export type QuizConfig = {
  id: string
  label: string
  questionsTable: string
  sessionsTable: string
  answersTable: string
  group: string
}

export const QUIZZES: QuizConfig[] = [
  {
    id: 'finance',
    label: 'Session 1 Finance',
    questionsTable: 'session_1_finance_questions',
    sessionsTable: 'session_1_finance_sessions',
    answersTable: 'session_1_finance_answers',
    group: 'finance',
  },
  {
    id: 'double-degree',
    label: 'Session 1 – Double Degree',
    questionsTable: 'session_1_doble_grado',
    sessionsTable: 'session_1_doble_grado_sessions',
    answersTable: 'session_1_doble_grado_answers',
    group: 'double-degree',
  },
  {
    id: 'finance-2',
    label: 'Session 2 Finance',
    questionsTable: 'session_2_finance_questions',
    sessionsTable: 'session_2_finance_sessions',
    answersTable: 'session_2_finance_answers',
    group: 'finance',
  },
  {
    id: 'double-degree-2',
    label: 'Session 2 – Double Degree',
    questionsTable: 'session_2_doble_grado',
    sessionsTable: 'session_2_doble_grado_sessions',
    answersTable: 'session_2_doble_grado_answers',
    group: 'double-degree',
  },
  {
    id: 'finance-3',
    label: 'Session 3 Finance',
    questionsTable: 'session_3_finance_questions',
    sessionsTable: 'session_3_finance_sessions',
    answersTable: 'session_3_finance_answers',
    group: 'finance',
  },
]

export function getQuiz(id: string | null): QuizConfig | undefined {
  return QUIZZES.find(q => q.id === id)
}
