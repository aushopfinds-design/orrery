import type { City } from '@orrery/core/cities'
import { getCountryName, isCountryCode } from './countries.js'

export const MIN_PLACE_QUERY_LENGTH = 2
export const MAX_PLACE_QUERY_LENGTH = 100

const settlementTypes = new Set([
  'city', 'town', 'village', 'hamlet', 'isolated_dwelling', 'suburb',
  'quarter', 'neighbourhood', 'locality', 'borough', 'municipality',
])

function object(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 160) : ''
}

export function normalizePlaceQuery(query: string): string {
  return query.normalize('NFC').replace(/\s+/gu, ' ').trim()
}

/** Convert only real settlements in the requested country, never roads or POIs. */
export function parsePhotonPlaces(payload: unknown, countryCode: string): City[] {
  if (!isCountryCode(countryCode)) return []
  const features = object(payload)?.features
  if (!Array.isArray(features)) return []
  const results: City[] = []
  for (const feature of features) {
    const item = object(feature)
    const properties = object(item?.properties)
    const geometry = object(item?.geometry)
    if (!properties || geometry?.type !== 'Point') continue
    if (text(properties.countrycode).toUpperCase() !== countryCode) continue
    const osmValue = text(properties.osm_value)
    const layer = text(properties.type)
    if (!settlementTypes.has(osmValue) && !(osmValue === 'administrative' && ['city', 'district'].includes(layer))) continue
    const coordinates = geometry.coordinates
    if (!Array.isArray(coordinates) || coordinates.length < 2) continue
    const [lon, lat] = coordinates
    if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue
    const name = text(properties.name)
    if (!name) continue
    const region = [...new Set([text(properties.county), text(properties.state)])]
      .filter(part => part && part.toLowerCase() !== name.toLowerCase()).join(', ')
    // OSM may return both a settlement point and its administrative boundary.
    if (results.some(city => city.name === name && city.region === region &&
      Math.abs(city.lat - lat) < 0.05 && Math.abs(city.lon - lon) < 0.08)) continue
    results.push({
      name, region: region || undefined, country: getCountryName(countryCode),
      countryCode, lat, lon,
      placeId: `${text(properties.osm_type)}${String(properties.osm_id ?? '')}`,
    })
    if (results.length === 20) break
  }
  return results
}

/** Defend against malformed or stale API responses before offering a selection. */
export function parseBirthplaceResponse(payload: unknown, countryCode: string): City[] {
  const cities = object(payload)?.cities
  if (!Array.isArray(cities)) throw new Error('Invalid birthplace response')
  return cities.flatMap(value => {
    const city = object(value)
    if (!city || city.countryCode !== countryCode || !text(city.name) ||
      typeof city.lat !== 'number' || typeof city.lon !== 'number' ||
      !Number.isFinite(city.lat) || !Number.isFinite(city.lon) ||
      Math.abs(city.lat) > 90 || Math.abs(city.lon) > 180) return []
    return [{
      name: text(city.name), country: getCountryName(countryCode), countryCode,
      region: text(city.region) || undefined, placeId: text(city.placeId),
      lat: city.lat, lon: city.lon,
    }]
  }).slice(0, 20)
}

const cache = new Map<string, { cities: City[]; expires: number }>()
const CACHE_LIFETIME_MS = 60 * 60 * 1000

export function getCachedBirthplaces(query: string, countryCode: string): City[] | undefined {
  const key = `${countryCode}:${normalizePlaceQuery(query).toLowerCase()}`
  const cached = cache.get(key)
  if (!cached) return undefined
  if (cached.expires < Date.now()) { cache.delete(key); return undefined }
  return cached.cities
}

export async function searchBirthplaces(query: string, countryCode: string, signal: AbortSignal): Promise<City[]> {
  const q = normalizePlaceQuery(query)
  if (q.length < MIN_PLACE_QUERY_LENGTH || q.length > MAX_PLACE_QUERY_LENGTH || !isCountryCode(countryCode)) return []
  const cached = getCachedBirthplaces(q, countryCode)
  if (cached) return cached
  // Only a place name and country leave the browser; never birth date or time.
  const params = new URLSearchParams({ q, country: countryCode })
  const response = await fetch(`/api/birthplaces?${params}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Birthplace search unavailable')
  const cities = parseBirthplaceResponse(await response.json(), countryCode)
  if (cache.size >= 100) cache.delete(cache.keys().next().value!)
  cache.set(`${countryCode}:${q.toLowerCase()}`, { cities, expires: Date.now() + CACHE_LIFETIME_MS })
  return cities
}
