import type { City } from '@orrery/core/cities'
import { COUNTRY_NAMES_EN } from './city-names.ts'

// ISO 3166-1 countries and territories from IANA's public-domain iso3166.tab.
export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ')

const codeSet = new Set(COUNTRY_CODES)
const englishNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function isCountryCode(value: string): boolean {
  return codeSet.has(value)
}

export function getCountryName(code: string, locale = 'en'): string {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
}

export function getCountries(locale = 'en'): { code: string; name: string }[] {
  const names = new Intl.DisplayNames([locale], { type: 'region' })
  return COUNTRY_CODES.map(code => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
}

const legacyNames = new Map(COUNTRY_CODES.map(code => [englishNames.of(code), code]))
for (const [name, code] of Object.entries({
  'United States': 'US', 'United Kingdom': 'GB', 'South Korea': 'KR',
  'North Korea': 'KP', 'Turkey': 'TR', 'Czech Republic': 'CZ',
  'Vatican City': 'VA', 'Palestine': 'PS', 'East Timor': 'TL',
  'Ivory Coast': 'CI', 'Cape Verde': 'CV', 'Congo': 'CG',
  'Democratic Republic of the Congo': 'CD', 'Swaziland': 'SZ',
  'Myanmar': 'MM', 'Bosnia and Herzegovina': 'BA',
})) legacyNames.set(name, code)

/** Supports existing profiles with Korean city/country names. */
export function getCityCountryCode(city: City | null): string {
  if (!city) return 'US'
  if (city.countryCode && isCountryCode(city.countryCode)) return city.countryCode
  if (!city.country) return 'KR'
  return legacyNames.get(COUNTRY_NAMES_EN[city.country] ?? city.country) ?? 'US'
}

export function isSelectedBirthplaceValid(city: City | null, countryCode: string): boolean {
  return city != null && getCityCountryCode(city) === countryCode &&
    Number.isFinite(city.lat) && Number.isFinite(city.lon) &&
    Math.abs(city.lat) <= 90 && Math.abs(city.lon) <= 180
}
