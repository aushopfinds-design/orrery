import { describe, expect, it } from 'vitest'
import { endTwelveMonthWindow, nextTwelveMonthWindow, parseCalendarMonth } from './calendar-window.ts'

describe('next twelve calendar months', () => {
  it('starts the month after the purchase date and crosses a year boundary', () => {
    expect(nextTwelveMonthWindow(new Date('2026-10-30T12:00:00.000Z'), 'Australia/Sydney')).toEqual({ start: '2026-11', end: '2027-10', timezone: 'Australia/Sydney' })
    expect(nextTwelveMonthWindow(new Date('2026-12-31T23:30:00.000Z'), 'UTC')).toEqual({ start: '2027-01', end: '2027-12', timezone: 'UTC' })
  })
  it('validates persisted year-month keys and falls back explicitly to UTC for an invalid zone', () => {
    expect(parseCalendarMonth('2027-02')).toEqual({ year: 2027, month: 2 })
    expect(parseCalendarMonth('2027-13')).toBeUndefined()
    expect(endTwelveMonthWindow('2026-11')).toBe('2027-10')
    expect(nextTwelveMonthWindow(new Date('2026-12-31T12:00:00Z'), 'Not/A-Timezone').timezone).toBe('UTC')
  })
})
