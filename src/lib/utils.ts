export function getWeekCode(): string {
  const now = new Date()
  const year = now.getFullYear()
  const week = Math.ceil(
    (now.getTime() - new Date(year, 0, 1).getTime()) /
    (7 * 24 * 60 * 60 * 1000),
  )
  return `${year}-W${String(week).padStart(2, '0')}`
}
