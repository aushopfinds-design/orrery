import { isCountryCode } from '../src/utils/countries.ts'
import { MAX_PLACE_QUERY_LENGTH, MIN_PLACE_QUERY_LENGTH, normalizePlaceQuery, parsePhotonPlaces } from '../src/utils/world-birthplaces.ts'

const successHeaders = {
  'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  'X-Content-Type-Options': 'nosniff',
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } })
    }
    const params = new URL(request.url).searchParams
    const q = normalizePlaceQuery(params.get('q') ?? '')
    const countryCode = (params.get('country') ?? '').toUpperCase()
    if (q.length < MIN_PLACE_QUERY_LENGTH || q.length > MAX_PLACE_QUERY_LENGTH || !isCountryCode(countryCode)) {
      return Response.json({ error: 'Enter a place name and a valid country' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }
    const upstream = new URL('https://photon.komoot.io/api/')
    upstream.searchParams.set('q', q)
    upstream.searchParams.set('countrycode', countryCode)
    upstream.searchParams.set('lang', 'en')
    upstream.searchParams.set('limit', '20')
    for (const layer of ['city', 'locality', 'district']) upstream.searchParams.append('layer', layer)
    try {
      const response = await fetch(upstream, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json', 'User-Agent': 'The Fate Key birthplace search (https://thefatekey.com)' },
      })
      if (!response.ok) throw new Error('Upstream unavailable')
      const cities = parsePhotonPlaces(await response.json(), countryCode)
      return Response.json({ cities }, { headers: successHeaders })
    } catch {
      return Response.json({ error: 'Place search is temporarily unavailable. Please retry or enter coordinates.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  },
}
