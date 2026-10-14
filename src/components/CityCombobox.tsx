import { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react'
import type { City } from '@orrery/core/cities'
import { formatCityForLocale, getCitySuggestions } from '../utils/city-search.ts'
import { getCachedBirthplaces, MAX_PLACE_QUERY_LENGTH, MIN_PLACE_QUERY_LENGTH, normalizePlaceQuery, searchBirthplaces } from '../utils/world-birthplaces.ts'
import { useLocale } from '../i18n/index.ts'

interface Props {
  countryCode: string
  selectedCity: City | null
  onSelect: (city: City) => void
  onSelectionInvalidated: () => void
}

interface SearchResult {
  key: string
  status: 'success' | 'error'
  cities: City[]
}

const inputClass =
  'w-full min-h-12 pl-3 pr-9 border border-[#ddcbb1] rounded-lg text-base text-[#203049] bg-[#fffdf9] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#c99b56]/35 focus:border-[#b78a47] transition-all'

export default function CityCombobox({ countryCode, selectedCity, onSelect, onSelectionInvalidated }: Props) {
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [remote, setRemote] = useState<SearchResult | null>(null)
  const [retry, setRetry] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const listboxId = `${id}-places`
  const hintId = `${id}-hint`
  const normalizedQuery = normalizePlaceQuery(query)
  const searchKey = `${countryCode}:${normalizedQuery.toLowerCase()}:${retry}`
  const shouldSearch = isOpen && normalizedQuery.length >= MIN_PLACE_QUERY_LENGTH
  const localResults = useMemo(() => getCitySuggestions(query, locale, countryCode), [query, locale, countryCode])
  const cached = shouldSearch ? getCachedBirthplaces(normalizedQuery, countryCode) : undefined
  const activeRemote = remote?.key === searchKey ? remote : null
  const isLoading = shouldSearch && cached === undefined && !activeRemote
  const hasError = shouldSearch && activeRemote?.status === 'error'
  const onlineResults = cached ?? (activeRemote?.status === 'success' ? activeRemote.cities : undefined)
  const flatResults = onlineResults?.length ? onlineResults : localResults

  useEffect(() => {
    if (!shouldSearch || getCachedBirthplaces(normalizedQuery, countryCode)) return
    const controller = new AbortController()
    // Debounce and reuse cached results to keep the public search service modest.
    const timer = window.setTimeout(async () => {
      try {
        const cities = await searchBirthplaces(normalizedQuery, countryCode, controller.signal)
        if (!controller.signal.aborted) {
          setHighlightIndex(-1)
          setRemote({ key: searchKey, status: 'success', cities })
        }
      } catch {
        if (!controller.signal.aborted) {
          setHighlightIndex(-1)
          setRemote({ key: searchKey, status: 'error', cities: [] })
        }
      }
    }, 800)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [shouldSearch, normalizedQuery, countryCode, searchKey])

  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[role="option"]')
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex])

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightIndex(-1)
  }, [])

  function handleInput(value: string) {
    setQuery(value)
    setIsOpen(true)
    setHighlightIndex(-1)
    onSelectionInvalidated()
  }

  function selectCity(city: City) {
    onSelect(city)
    setQuery('')
    close()
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (flatResults.length) setHighlightIndex(i => (i + 1) % flatResults.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (flatResults.length) setHighlightIndex(i => i <= 0 ? flatResults.length - 1 : i - 1)
        break
      case 'Enter': {
        e.preventDefault()
        const city = flatResults[highlightIndex >= 0 ? highlightIndex : 0]
        if (city) selectCity(city)
        break
      }
      case 'Escape':
        e.preventDefault()
        close()
        inputRef.current?.blur()
        break
    }
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    close()
  }

  const displayValue = isOpen ? query : (selectedCity ? formatCityForLocale(selectedCity, locale) : query)
  const optionId = (index: number) => `${id}-place-${index}`

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${id}-input`} className="block text-sm text-[#755632] mb-1">{t('city.birthCity')}</label>
      <div className="relative">
        <input
          id={`${id}-input`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-autocomplete="list"
          aria-describedby={hintId}
          aria-activedescendant={highlightIndex >= 0 && highlightIndex < flatResults.length ? optionId(highlightIndex) : undefined}
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_PLACE_QUERY_LENGTH}
          className={inputClass}
          placeholder={t('city.placeholder')}
          value={displayValue}
          onFocus={() => { setIsOpen(true); if (selectedCity) setQuery(''); setHighlightIndex(-1) }}
          onBlur={handleBlur}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7b64]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
        {isOpen && (
          <ul ref={listRef} id={listboxId} role="listbox" aria-label={t('city.results')} className="absolute z-50 mt-1 w-full max-h-64 overflow-auto overscroll-contain rounded-lg border border-[#ddcbb1] bg-[#fffdf9] shadow-lg py-1 text-[#203049]">
            {isLoading && <li role="presentation" className="px-3 py-2 text-sm text-[#755632]"><span role="status">{t('city.loading')}</span></li>}
            {hasError && (
              <li role="presentation" className="px-3 py-2 text-sm text-[#755632]">
                <span role="alert">{t('city.searchError')}</span>{' '}
                <button type="button" className="underline font-medium" onMouseDown={e => e.preventDefault()} onClick={() => setRetry(value => value + 1)}>{t('city.retry')}</button>
              </li>
            )}
            {flatResults.length > 0 && <li role="presentation" className="px-3 pt-2 pb-1 text-xs font-medium text-[#8c7659]">{normalizedQuery ? t('city.results') : t('city.suggestions')}</li>}
            {!isLoading && !hasError && flatResults.length === 0 && (
              <li role="presentation" className="px-3 py-3 text-sm text-[#755632]"><span role="status">{normalizedQuery.length < MIN_PLACE_QUERY_LENGTH ? t('city.typeToSearch') : t('city.noResults')}</span></li>
            )}
            {flatResults.map((city, index) => (
              <li key={city.placeId || `${city.name}-${city.lat}-${city.lon}`} id={optionId(index)} role="option" aria-selected={index === highlightIndex}
                className={`px-3 py-2.5 text-base cursor-pointer transition-colors break-words ${index === highlightIndex ? 'bg-[#f0e5d6]' : 'hover:bg-[#f7eee3]'}`}
                onMouseDown={e => { e.preventDefault(); selectCity(city) }} onMouseEnter={() => setHighlightIndex(index)}>
                <span className="block font-medium">{formatCityForLocale(city, locale).split(', ')[0]}</span>
                <span className="block text-xs text-[#755632] mt-0.5">{formatCityForLocale(city, locale).split(', ').slice(1).join(', ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p id={hintId} className="mt-1.5 text-xs text-[#755632] leading-relaxed">{t('city.searchHint')}</p>
      <p className="mt-1 text-[10px] text-[#85715a] leading-relaxed">
        {t('city.attribution')}{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap contributors</a>
        {' · '}<a href="https://photon.komoot.io/" target="_blank" rel="noreferrer" className="underline">Photon</a>
      </p>
    </div>
  )
}
