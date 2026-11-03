export interface CalendarWindow { start: string; end: string; timezone: string }

function timezoneParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit' }).formatToParts(date)
  const year = Number(parts.find(part => part.type === 'year')?.value)
  const month = Number(parts.find(part => part.type === 'month')?.value)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('Could not resolve the calendar month')
  return { year, month }
}

export function nextTwelveMonthWindow(now = new Date(), requestedTimezone?: string): CalendarWindow {
  let timezone = requestedTimezone || 'UTC'
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }) }
  catch { timezone = 'UTC' }
  const current = timezoneParts(now, timezone)
  const startMonth = current.month === 12 ? 1 : current.month + 1
  const startYear = current.year + (current.month === 12 ? 1 : 0)
  const endMonth = startMonth === 1 ? 12 : startMonth - 1
  const endYear = startMonth === 1 ? startYear : startYear + 1
  const key = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`
  return { start: key(startYear, startMonth), end: key(endYear, endMonth), timezone }
}

export function parseCalendarMonth(value: string): { year: number; month: number } | undefined {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value)
  if (!match) return undefined
  return { year: Number(match[1]), month: Number(match[2]) }
}

export function endTwelveMonthWindow(start: string): string | undefined {
  const parsed = parseCalendarMonth(start)
  if (!parsed) return undefined
  const index = parsed.year * 12 + parsed.month - 1 + 11
  const year = Math.floor(index / 12), month = index % 12 + 1
  return `${year}-${String(month).padStart(2, '0')}`
}
