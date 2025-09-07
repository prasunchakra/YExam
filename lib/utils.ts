import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function calculatePercentage(obtained: number, total: number): number {
  if (total === 0) return 0
  return Math.round((obtained / total) * 100 * 100) / 100
}

export function calculateRank(score: number, allScores: number[]): number {
  const sortedScores = allScores.sort((a, b) => b - a)
  return sortedScores.indexOf(score) + 1
}
