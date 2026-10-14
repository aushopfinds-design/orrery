import { describe, expect, it } from 'vitest'
import { KOREAN_CITIES, WORLD_CITIES, NEW_YORK } from '@orrery/core/cities'
import { formatCityForLocale, getCitySuggestions } from './city-search.ts'
import { inferTimeZoneFromCoordinates } from './timezones.ts'

describe('English birthplace selection', () => {
  it('opens with New York and international cities in the displayed order', () => {
    expect(getCitySuggestions('').slice(0, 4).map(city => formatCityForLocale(city))).toEqual([
      'New York, United States', 'London, United Kingdom', 'Sydney, Australia', 'Melbourne, Australia',
    ])
  })

  it.each([
    ['  SYD  ', 'Sydney, Australia', 'Australia/Sydney'],
    ['London UK', 'London, United Kingdom', 'Europe/London'],
    ['NYC', 'New York, United States', 'America/New_York'],
    ['New York, United States', 'New York, United States', 'America/New_York'],
    ['Melb', 'Melbourne, Australia', 'Australia/Melbourne'],
    ['Toronto', 'Toronto, Canada', 'America/Toronto'],
    ['Montréal', 'Montreal, Canada', 'America/Toronto'],
    ['Seoul', 'Seoul, South Korea', 'Asia/Seoul'],
  ])('finds %s and keeps its calculation timezone', (query, label, timezone) => {
    const city = getCitySuggestions(query)[0]
    expect(city).toBeDefined()
    expect(formatCityForLocale(city)).toBe(label)
    expect(inferTimeZoneFromCoordinates(city.lat, city.lon)).toBe(timezone)
    expect([...KOREAN_CITIES, ...WORLD_CITIES]).toContain(city)
  })

  it('supports country searches and common abbreviations', () => {
    const australian = getCitySuggestions('AU')
    expect(australian.length).toBeGreaterThan(0)
    expect(australian.every(city => city.country === '호주')).toBe(true)
    expect(getCitySuggestions('Canada').every(city => city.country === '캐나다')).toBe(true)
  })

  it('has English labels for every city and country in the existing database', () => {
    for (const city of [...KOREAN_CITIES, ...WORLD_CITIES]) {
      expect(formatCityForLocale(city)).not.toMatch(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u)
    }
  })

  it('formats browser-saved Korean names without changing the original record', () => {
    const oldSavedCity = JSON.parse(JSON.stringify(NEW_YORK))
    expect(formatCityForLocale(oldSavedCity, 'en')).toBe('New York, United States')
    expect(formatCityForLocale(oldSavedCity, 'ko')).toBe('뉴욕, 미국')
    expect(oldSavedCity).toEqual(NEW_YORK)
  })

  it('keeps two cities called Gwangju distinct', () => {
    const cities = getCitySuggestions('Gwangju')
    expect(cities.map(city => formatCityForLocale(city))).toEqual([
      'Gwangju, South Korea', 'Gwangju (Gyeonggi), South Korea',
    ])
    expect(cities[0].lon).not.toBe(cities[1].lon)
  })

  it('retains Korean search and returns no options for an unknown city', () => {
    expect(formatCityForLocale(getCitySuggestions('서울')[0])).toBe('Seoul, South Korea')
    expect(getCitySuggestions('zzzz no such city')).toEqual([])
  })
})
