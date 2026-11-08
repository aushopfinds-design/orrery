import type { City } from '@orrery/core/cities'
import { KOREAN_CITIES, WORLD_CITIES, filterCities, formatCityName } from '@orrery/core/cities'
import { CITY_NAMES_EN, COUNTRY_NAMES_EN, REGION_NAMES_EN } from './city-names.ts'
import { getCityCountryCode } from './countries.ts'

const ALL_CITIES = [...WORLD_CITIES, ...KOREAN_CITIES]
const POPULAR_NAMES = ['뉴욕', '런던', '시드니', '멜버른', '토론토', '로스앤젤레스', '시카고', '밴쿠버', '브리즈번', '퍼스', '서울', '도쿄']
const POPULAR_CITIES = POPULAR_NAMES.flatMap(name => {
  const city = ALL_CITIES.find(city => city.name === name)
  return city ? [city] : []
})
const AMBIGUOUS_NAMES = new Set(KOREAN_CITIES.filter((city, i, cities) => cities.some((other, j) => i !== j && other.name === city.name)).map(city => city.name))

const CITY_ALIASES: Readonly<Record<string, readonly string[]>> = {
  '뉴욕': ['nyc', 'newyork'],
  '로스앤젤레스': ['la', 'losangeles'],
  '워싱턴 D.C.': ['washington dc', 'dc'],
  '샌프란시스코': ['sf'],
  '호치민': ['saigon', 'ho chi minh'],
  '뭄바이': ['bombay'],
  '벵갈루루': ['bangalore'],
  '상트페테르부르크': ['st petersburg', 'st. petersburg'],
  '키이우': ['kiev'],
}
const COUNTRY_ALIASES: Readonly<Record<string, readonly string[]>> = {
  '미국': ['us', 'usa', 'america', 'u.s.', 'u.s.a.'],
  '영국': ['uk', 'gb', 'britain', 'great britain'],
  '호주': ['au', 'aus'],
  '캐나다': ['ca', 'can'],
  '뉴질랜드': ['nz'],
  '아랍에미리트': ['uae'],
}

/** Also formats old, browser-saved city objects that contain Korean names. */
export function formatCityForLocale(city: City, locale = 'en'): string {
  if (city.countryCode) {
    return [city.name, city.region, city.country].filter(Boolean).join(', ')
  }
  if (locale === 'ko') return formatCityName(city)
  let name = CITY_NAMES_EN[city.name] ?? city.name
  const country = city.country ? COUNTRY_NAMES_EN[city.country] ?? city.country : 'South Korea'
  if (!city.country && city.region && AMBIGUOUS_NAMES.has(city.name) && city.region === '경기도') {
    name += ` (${REGION_NAMES_EN[city.region] ?? city.region})`
  }
  return `${name}, ${country}`
}

function normalize(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

const SEARCH_INDEX = ALL_CITIES.map(city => {
  const name = normalize(CITY_NAMES_EN[city.name] ?? city.name)
  const aliases = (CITY_ALIASES[city.name] ?? []).map(normalize)
  const country = normalize(city.country ? COUNTRY_NAMES_EN[city.country] ?? city.country : 'South Korea')
  const countryAliases = city.country ? (COUNTRY_ALIASES[city.country] ?? []).map(normalize) : ['korea', 'kr']
  const label = normalize(formatCityForLocale(city))
  const region = city.region ? normalize(REGION_NAMES_EN[city.region] ?? city.region) : ''
  const words = [name, country, region, ...aliases, ...countryAliases].join(' ').split(' ').filter(Boolean)
  return { city, name, aliases, country, countryAliases, label, words }
})

/** Worldwide suggestions in displayed order; return the original coordinates. */
export function getCitySuggestions(query: string, locale = 'en', countryCode?: string): City[] {
  if (countryCode) {
    const cities = ALL_CITIES.filter(city => getCityCountryCode(city) === countryCode)
    if (!normalize(query)) return cities.slice(0, 8)
    return getCitySuggestions(query, locale).filter(city => getCityCountryCode(city) === countryCode)
  }
  const q = normalize(query)
  if (!q) return locale === 'ko' ? KOREAN_CITIES.slice(0, 8) : [...POPULAR_CITIES]
  if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(query)) return filterCities(query)

  const tokens = q.split(' ')
  const compact = q.replace(/ /g, '')
  const countriesForAlias = Object.entries(COUNTRY_ALIASES)
    .filter(([, aliases]) => aliases.some(alias => normalize(alias) === q))
    .map(([country]) => country)
  return SEARCH_INDEX.flatMap(item => {
    if (countriesForAlias.length && !countriesForAlias.includes(item.city.country ?? '')) return []
    let score: number | null = null
    if (item.name === q || item.aliases.includes(q)) score = 0
    else if (item.name.startsWith(q) || item.name.replace(/ /g, '').startsWith(compact)) score = 1
    else if (item.aliases.some(alias => alias.startsWith(q))) score = 2
    else if (item.country.startsWith(q) || item.countryAliases.includes(q)) score = 3
    else if (item.label.includes(q) || tokens.every(token => item.words.some(word => word.startsWith(token)))) score = 4
    return score == null ? [] : [{ city: item.city, score }]
  }).sort((a, b) => a.score - b.score).slice(0, 20).map(item => item.city)
}
