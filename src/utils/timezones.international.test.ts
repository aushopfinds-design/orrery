import { describe, expect, it } from 'vitest'
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
})
