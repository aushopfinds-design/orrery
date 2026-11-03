import { describe, expect, it } from 'vitest'
import { resolveLocalDateTimeToUtc } from '@orrery/core/timezone'
import { inferTimeZoneFromCoordinates, validateBirthLocalTime, isDaylightSavingInEffect } from './timezones'

describe('Birthplace time zone and DST safety across four countries', () => {
  const places = [
    { name: 'Seoul', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul' },
    { name: 'New York', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
    { name: 'London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  ]
  it.each(places)('$name resolves to the correct IANA zone', ({ lat, lon, tz }) => {
    expect(inferTimeZoneFromCoordinates(lat, lon)).toBe(tz)
  })
  it('rejects missing spring-forward clock times in New York, London and Sydney', () => {
    const gaps = [
      { lat: 40.7128, lon: -74.006, y: 2026, m: 3, d: 8, h: 2, min: 30 },
      { lat: 51.5074, lon: -0.1278, y: 2026, m: 3, d: 29, h: 1, min: 30 },
      { lat: -33.8688, lon: 151.2093, y: 2026, m: 10, d: 4, h: 2, min: 30 },
    ]
    for (const c of gaps) {
      expect(validateBirthLocalTime(c.lat, c.lon, c.y, c.m, c.d, c.h, c.min)).toEqual({ ok: false, reason: 'dst-gap' })
    }
  })
  it('accepts ordinary local times in all four cities', () => {
    for (const c of places) {
      expect(validateBirthLocalTime(c.lat, c.lon, 2026, 6, 15, 12, 0).ok).toBe(true)
    }
  })
  it('detects opposite summer seasons in the northern and southern hemispheres', () => {
    expect(isDaylightSavingInEffect('America/New_York', 2026, 7, 15, 12, 0)).toBe(true)
    expect(isDaylightSavingInEffect('Europe/London', 2026, 7, 15, 12, 0)).toBe(true)
    expect(isDaylightSavingInEffect('Australia/Sydney', 2026, 7, 15, 12, 0)).toBe(false)
    expect(isDaylightSavingInEffect('Australia/Sydney', 2026, 1, 15, 12, 0)).toBe(true)
    expect(isDaylightSavingInEffect('Asia/Seoul', 2026, 7, 15, 12, 0)).toBe(false)
  })
  it('resolves repeated fall-back hours to the first real UTC instant', () => {
    const overlaps = [
      { tz: 'America/New_York', y: 2026, m: 11, d: 1, h: 1, min: 30, utc: '2026-11-01T05:30:00.000Z' },
      { tz: 'Europe/London', y: 2026, m: 10, d: 25, h: 1, min: 30, utc: '2026-10-25T00:30:00.000Z' },
      { tz: 'Australia/Sydney', y: 2026, m: 4, d: 5, h: 2, min: 30, utc: '2026-04-04T15:30:00.000Z' },
    ]
    for (const c of overlaps) {
      expect(resolveLocalDateTimeToUtc(c.y, c.m, c.d, c.h, c.min, c.tz).toISOString()).toBe(c.utc)
    }
  })

  it('matches independent historical DST transition instants', () => {
    const historical = [
      // US emergency year-round DST began in January 1974.
      { tz: 'America/New_York', y: 1974, m: 1, d: 6, h: 1, min: 59, utc: '1974-01-06T06:59:00.000Z' },
      { tz: 'America/New_York', y: 1974, m: 1, d: 6, h: 3, min: 0, utc: '1974-01-06T07:00:00.000Z' },
      // Australia/Sydney spring-forward on 1986-10-19.
      { tz: 'Australia/Sydney', y: 1986, m: 10, d: 19, h: 1, min: 59, utc: '1986-10-18T15:59:00.000Z' },
      { tz: 'Australia/Sydney', y: 1986, m: 10, d: 19, h: 3, min: 0, utc: '1986-10-18T16:00:00.000Z' },
    ]
    for (const c of historical) {
      expect(resolveLocalDateTimeToUtc(c.y, c.m, c.d, c.h, c.min, c.tz).toISOString()).toBe(c.utc)
    }
  })

  it('preserves exact UTC moments on both sides of spring-forward gaps', () => {
    const edges = [
      { tz: 'America/New_York', y: 2026, m: 3, d: 8, h: 1, min: 59, utc: '2026-03-08T06:59:00.000Z' },
      { tz: 'America/New_York', y: 2026, m: 3, d: 8, h: 3, min: 0, utc: '2026-03-08T07:00:00.000Z' },
      { tz: 'Europe/London', y: 2026, m: 3, d: 29, h: 0, min: 59, utc: '2026-03-29T00:59:00.000Z' },
      { tz: 'Europe/London', y: 2026, m: 3, d: 29, h: 2, min: 0, utc: '2026-03-29T01:00:00.000Z' },
      { tz: 'Australia/Sydney', y: 2026, m: 10, d: 4, h: 1, min: 59, utc: '2026-10-03T15:59:00.000Z' },
      { tz: 'Australia/Sydney', y: 2026, m: 10, d: 4, h: 3, min: 0, utc: '2026-10-03T16:00:00.000Z' },
    ]
    for (const c of edges) {
      expect(resolveLocalDateTimeToUtc(c.y, c.m, c.d, c.h, c.min, c.tz).toISOString()).toBe(c.utc)
    }
  })

})
