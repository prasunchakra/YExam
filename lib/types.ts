import { User, Role, QuestionType, Difficulty } from "@prisma/client"

export type { User, Role, QuestionType, Difficulty }

export interface ExtendedUser extends User {
  role: Role
}

export interface QuestionWithOptions {
  id: string
  question: string
  type: QuestionType
  marks: number
  difficulty: Difficulty
  explanation?: string
  options: {
    id: string
    text: string
    isCorrect: boolean
  }[]
}

export interface TestAttemptWithDetails {
  id: string
  startedAt: Date
  submittedAt?: Date
  timeSpent?: number
  totalMarks: number
  obtainedMarks: number
  percentage: number
  rank?: number
  isCompleted: boolean
  testPaper: {
    id: string
    title: string
    subject: {
      name: string
      exam: {
        name: string
        category: string
      }
    }
  }
}

export interface PerformanceStats {
  totalTests: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  accuracy: number
  subjectWiseStats: {
    subject: string
    tests: number
    averageScore: number
    accuracy: number
  }[]
}

export interface ExamCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  examCount: number
}

export interface NavigationItem {
  name: string
  href: string
  icon: string
  current?: boolean
}
