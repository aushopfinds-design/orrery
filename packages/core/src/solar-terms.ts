import { getEquationOfTimeMinutes } from './timezone.ts'
import {
  SOLAR_TERM_FIRST_YEAR,
  SOLAR_TERM_LAST_YEAR,
  SOLAR_TERM_UTC_SECONDS,
} from './solar-term-data.ts'

export const MIN_SUPPORTED_SAJU_YEAR = 1900
export const MAX_SUPPORTED_SAJU_YEAR = 2100

/** A non-Seoul chart is evaluated on local apparent solar time. */
export interface SolarTermClock {
  longitude: number
}

export interface SolarTermEvent {
  year: number
  index: number
  localClockMs: number
}

function utcInstant(year: number, index: number): number {
  if (year < SOLAR_TERM_FIRST_YEAR || year > SOLAR_TERM_LAST_YEAR) {
    throw new RangeError(`Solar-term ephemeris does not cover ${year}`)
  }
  const seconds = SOLAR_TERM_UTC_SECONDS[year - SOLAR_TERM_FIRST_YEAR]?.[index]
  if (seconds == null) throw new RangeError(`Missing solar term ${index} for ${year}`)
  return seconds * 1000
}

/**
 * Convert an astronomical instant to the clock used for this chart.
 * Korea uses its traditional KST wall clock. Other locations use apparent
 * solar time, matching the birth-time normalization in timezone.ts.
 */
function eventClockMs(year: number, index: number, clock?: SolarTermClock): number {
  const instant = utcInstant(year, index)
  const localOffsetMinutes = clock
    ? clock.longitude * 4 + getEquationOfTimeMinutes(
      new Date(instant).getUTCFullYear(),
      new Date(instant).getUTCMonth() + 1,
      new Date(instant).getUTCDate(),
    )
    : 9 * 60
  // The input form records minutes. Round the second-level ephemeris event
  // to the nearest minute, matching published almanac minute tables.
  return Math.round((instant + localOffsetMinutes * 60_000) / 60_000) * 60_000
}

function event(year: number, index: number, clock?: SolarTermClock): SolarTermEvent {
  let eventYear = year
  let eventIndex = index
  while (eventIndex < 0) { eventYear--; eventIndex += 24 }
  while (eventIndex >= 24) { eventYear++; eventIndex -= 24 }
  return { year: eventYear, index: eventIndex, localClockMs: eventClockMs(eventYear, eventIndex, clock) }
}

export function getSolarCalendarPosition(
  year: number, month: number, day: number, hour: number, minute: number,
  clock?: SolarTermClock,
): { sajuYear: number; monthIndex: number; ingress: SolarTermEvent } {
  if (year < MIN_SUPPORTED_SAJU_YEAR || year > MAX_SUPPORTED_SAJU_YEAR) {
    throw new RangeError(`Choose a valid Saju birth year from ${MIN_SUPPORTED_SAJU_YEAR} to ${MAX_SUPPORTED_SAJU_YEAR}`)
  }
  const birthClockMs = Date.UTC(year, month - 1, day, hour, minute)
  const events: SolarTermEvent[] = []
  for (let eventYear = year - 1; eventYear <= year + 1; eventYear++) {
    for (let index = 0; index < 24; index += 2) events.push(event(eventYear, index, clock))
  }
  const priorIngresses = events.filter(item => item.localClockMs <= birthClockMs)
  priorIngresses.sort((a, b) => a.localClockMs - b.localClockMs)
  const ingress = priorIngresses.at(-1)
  if (!ingress) throw new RangeError('Could not resolve the preceding solar-term boundary')

  const lichunEvents = [event(year - 1, 0, clock), event(year, 0, clock), event(year + 1, 0, clock)]
    .filter(item => item.localClockMs <= birthClockMs)
    .sort((a, b) => a.localClockMs - b.localClockMs)
  const lichun = lichunEvents.at(-1)
  if (!lichun) throw new RangeError('Could not resolve the preceding Li Chun boundary')

  return { sajuYear: lichun.year, monthIndex: ingress.index / 2, ingress }
}

export function getSolarTermEvent(year: number, index: number, clock?: SolarTermClock): SolarTermEvent {
  return event(year, index, clock)
}
