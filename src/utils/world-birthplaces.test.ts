import { afterEach, describe, expect, it, vi } from 'vitest'
import { KOREAN_CITIES, WORLD_CITIES } from '@orrery/core/cities'
import { COUNTRY_NAMES_EN } from './city-names.ts'
import { COUNTRY_CODES, getCountries, getCityCountryCode, isSelectedBirthplaceValid } from './countries.ts'
import { formatCityForLocale, getCitySuggestions } from './city-search.ts'
import { parsePhotonPlaces, parseBirthplaceResponse, searchBirthplaces } from './world-birthplaces.ts'
import { inferTimeZoneFromCoordinates } from './timezones.ts'
import birthplaces from '../../api/birthplaces.ts'

const place = (name: string, countrycode = 'GB', lon = -1.7573118, lat = 51.8840725, extra: Record<string, unknown> = {}) => ({
  type: 'Feature',
  properties: { name, countrycode, county: 'Gloucestershire', state: 'England', osm_key: 'place', osm_value: 'village', osm_type: 'N', osm_id: name, type: 'district', ...extra },
  geometry: { type: 'Point', coordinates: [lon, lat] },
})

afterEach(() => vi.unstubAllGlobals())

describe('Worldwide countries and settlements', () => {
  it('offers 249 unique ISO countries/territories in every supported UI language', () => {
    expect(COUNTRY_CODES).toHaveLength(249)
    expect(new Set(COUNTRY_CODES).size).toBe(249)
    for (const locale of ['en', 'ko', 'ja', 'zh', 'de', 'es']) {
      const countries = getCountries(locale)
      expect(countries).toHaveLength(249)
      expect(countries.every(country => country.name.length > 0)).toBe(true)
    }
    expect(getCountries().find(country => country.code === 'GB')?.name).toBe('United Kingdom')
  })

  it('restores every previous country, including Korean-name saved profiles', () => {
    for (const [country, name] of Object.entries(COUNTRY_NAMES_EN)) {
      const code = getCityCountryCode({ name: 'saved city', country, lat: 0, lon: 0 })
      expect(COUNTRY_CODES).toContain(code)
      if (name !== 'United States') expect(code, name).not.toBe('US')
    }
    for (const city of KOREAN_CITIES) expect(getCityCountryCode(city)).toBe('KR')
    const london = WORLD_CITIES.find(city => city.name === '런던')!
    expect(getCityCountryCode(london)).toBe('GB')
    expect(isSelectedBirthplaceValid(london, 'GB')).toBe(true)
    expect(isSelectedBirthplaceValid(london, 'US')).toBe(false)
    expect(isSelectedBirthplaceValid(null, 'GB')).toBe(false)
    expect(getCitySuggestions('', 'en', 'GB').every(city => getCityCountryCode(city) === 'GB')).toBe(true)
  })

  it('finds a UK village outside the original small city database and preserves its time zone', () => {
    const cities = parsePhotonPlaces({ features: [place('Bourton-on-the-Water')] }, 'GB')
    expect(cities).toHaveLength(1)
    expect(formatCityForLocale(cities[0])).toBe('Bourton-on-the-Water, Gloucestershire, England, United Kingdom')
    expect(inferTimeZoneFromCoordinates(cities[0].lat, cities[0].lon)).toBe('Europe/London')
    expect(isSelectedBirthplaceValid(cities[0], 'GB')).toBe(true)
    const saved = JSON.parse(JSON.stringify(cities[0]))
    expect(getCityCountryCode(saved)).toBe('GB')
    expect(formatCityForLocale(saved)).toBe(formatCityForLocale(cities[0]))
  })

  it.each([
    ['Terrigal', 'AU', 151.4427717, -33.4483315, 'New South Wales', 'Australia/Sydney'],
    ['Jaipur', 'IN', 75.820349, 26.915458, 'Rajasthan', 'Asia/Kolkata'],
    ['Ottawa', 'CA', -75.69011, 45.42088, 'Ontario', 'America/Toronto'],
    ['Orlando', 'US', -81.379, 28.542, 'Florida', 'America/New_York'],
  ])('uses the returned coordinates for %s', (name, country, lon, lat, state, timezone) => {
    const city = parsePhotonPlaces({ features: [place(name, country, lon, lat, { county: undefined, state, osm_value: 'town' })] }, country)[0]
    expect(city).toBeDefined()
    expect(inferTimeZoneFromCoordinates(city.lat, city.lon)).toBe(timezone)
    expect(city.countryCode).toBe(country)
  })

  it('rejects foreign countries, POIs, invalid coordinates and malformed responses', () => {
    const cities = parsePhotonPlaces({ features: [
      place('Richmond', 'US'),
      place('Birmingham factory', 'GB', -1.9, 52.4, { osm_value: 'industrial' }),
      place('Road', 'GB', -1.9, 52.4, { osm_value: 'residential', type: 'street' }),
      place('Impossible', 'GB', 181, 91),
      place('Invalid', 'GB', NaN, Infinity),
      { geometry: { type: 'Point', coordinates: [0, 0] } },
      place('Bath', 'gb', -2.3596963, 51.3813864, { osm_value: 'city' }),
    ] }, 'GB')
    expect(cities.map(city => city.name)).toEqual(['Bath'])
    expect(parsePhotonPlaces(null, 'GB')).toEqual([])
    expect(parsePhotonPlaces({ features: [place('Bath')] }, 'ZZ')).toEqual([])
  })

  it('deduplicates settlement/boundary pairs while distinguishing regions with the same name', () => {
    const cities = parsePhotonPlaces({ features: [
      place('Richmond', 'GB', -0.3, 51.46, { county: 'Greater London' }),
      place('Richmond', 'GB', -0.31, 51.465, { county: 'Greater London', osm_key: 'boundary', osm_value: 'administrative' }),
      place('Richmond', 'GB', -1.733, 54.404, { county: 'North Yorkshire' }),
    ] }, 'GB')
    expect(cities).toHaveLength(2)
    expect(formatCityForLocale(cities[0])).not.toBe(formatCityForLocale(cities[1]))
  })

  it('filters a stale or malformed browser response before selection', () => {
    expect(parseBirthplaceResponse({ cities: [{ name: 'Bath', countryCode: 'US', lat: 51, lon: -2 }] }, 'GB')).toEqual([])
    expect(() => parseBirthplaceResponse({ features: [] }, 'GB')).toThrow()
    expect(isSelectedBirthplaceValid({ name: 'bad', countryCode: 'GB', lat: NaN, lon: 0 }, 'GB')).toBe(false)
  })
})

describe('Birthplace API', () => {
  it('rejects invalid requests before contacting the public provider', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    for (const path of ['?q=Bath&country=ZZ', '?q=b&country=GB', '?q='+ 'a'.repeat(101) +'&country=GB', '?country=GB']) {
      expect((await birthplaces.fetch(new Request('https://thefatekey.com/api/birthplaces'+path))).status).toBe(400)
    }
    expect((await birthplaces.fetch(new Request('https://thefatekey.com/api/birthplaces', { method: 'POST' }))).status).toBe(405)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('restricts searches to the chosen country, protects personal fields and caches successful results', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ features: [place('Bourton-on-the-Water')] }))
    vi.stubGlobal('fetch', fetch)
    const response = await birthplaces.fetch(new Request('https://thefatekey.com/api/birthplaces?q=Bourton-on-the-Water&country=GB&year=1990&hour=11'))
    expect(response.status).toBe(200)
    const target = fetch.mock.calls[0][0] as URL
    expect(target.hostname).toBe('photon.komoot.io')
    expect([...target.searchParams.keys()].sort()).toEqual(['countrycode', 'lang', 'layer', 'layer', 'layer', 'limit', 'q'])
    expect(target.searchParams.get('countrycode')).toBe('GB')
    expect(target.searchParams.getAll('layer')).toEqual(['city', 'locality', 'district'])
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=86400')
    expect((await response.json()).cities[0].name).toBe('Bourton-on-the-Water')
  })

  it('reports upstream errors as retryable and does not cache them', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    const response = await birthplaces.fetch(new Request('https://thefatekey.com/api/birthplaces?q=Bath&country=GB'))
    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('browser lookup sends only the place and country, reuses cached results, and separates countries', async () => {
    const city = parsePhotonPlaces({ features: [place('Cache test village')] }, 'GB')[0]
    const fetch = vi.fn().mockResolvedValue(Response.json({ cities: [city] }))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    expect(await searchBirthplaces('Cache test village', 'GB', signal)).toEqual([city])
    expect(await searchBirthplaces('cache test village', 'GB', signal)).toEqual([city])
    expect(fetch).toHaveBeenCalledTimes(1)
    const url = new URL(fetch.mock.calls[0][0], 'https://thefatekey.com')
    expect([...url.searchParams.keys()]).toEqual(['q', 'country'])
    fetch.mockResolvedValueOnce(Response.json({ cities: [] }))
    expect(await searchBirthplaces('Cache test village', 'AU', signal)).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
