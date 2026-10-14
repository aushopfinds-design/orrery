import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { City } from '@orrery/core/cities'
import { formatCityForLocale, getCitySuggestions } from '../utils/city-search.ts'
import { useLocale } from '../i18n/index.ts'

interface Props {
  selectedCity: City | null
  onSelect: (city: City) => void
}

const inputClass =
  'w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all'

export default function CityCombobox({ selectedCity, onSelect }: Props) {
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const flatResults = useMemo(() => getCitySuggestions(query, locale), [query, locale])

  // 하이라이트된 항목이 보이도록 스크롤
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[role="option"]')
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex])

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightIndex(-1)
    setQuery('')
  }, [])

  function handleFocus() {
    setIsOpen(true)
    setQuery('')
    setHighlightIndex(-1)
  }

  function handleInput(value: string) {
    setQuery(value)
    setIsOpen(true)
    setHighlightIndex(-1)
  }

  function selectCity(city: City) {
    onSelect(city)
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
      case 'Enter':
        e.preventDefault()
        if (flatResults.length) {
          selectCity(flatResults[highlightIndex >= 0 ? highlightIndex : 0])
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        inputRef.current?.blur()
        break
    }
  }

  // mousedown + preventDefault로 블러-클릭 경쟁 해결
  function handleOptionMouseDown(e: React.MouseEvent, city: City) {
    e.preventDefault()
    selectCity(city)
  }

  function handleBlur(e: React.FocusEvent) {
    // 컨테이너 내부로 포커스가 이동하면 무시
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    close()
  }

  const listboxId = 'city-listbox'

  /** 구분선이 있는 섹션별 렌더링 */
  function renderOptions() {
    if (flatResults.length === 0) {
      return (
        <li className="px-3 py-2 text-base text-gray-400 dark:text-gray-500 text-center">
          {t('city.noResults')}
        </li>
      )
    }

    return [
      <li key="header" className="px-3 pt-2 pb-1 text-sm font-medium text-gray-500" role="presentation">
        {query.trim() ? t('city.results') : locale === 'ko' ? t('city.korea') : t('city.popular')}
      </li>,
      ...flatResults.map((city, index) => renderOption(city, index)),
    ]
  }

  function renderOption(city: City, index: number) {
    const isHighlighted = index === highlightIndex
    const label = formatCityForLocale(city, locale)
    return (
      <li
        key={`${city.name}-${city.country ?? city.region ?? 'kr'}`}
        id={`city-option-${index}`}
        role="option"
        aria-selected={isHighlighted}
        className={`px-3 py-2 text-base cursor-pointer transition-colors ${
          isHighlighted ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onMouseDown={e => handleOptionMouseDown(e, city)}
        onMouseEnter={() => setHighlightIndex(index)}
      >
        {label}
      </li>
    )
  }

  const displayValue = isOpen ? query : (selectedCity ? formatCityForLocale(selectedCity, locale) : '')

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-label={t('city.birthCity')}
        aria-activedescendant={highlightIndex >= 0 ? `city-option-${highlightIndex}` : undefined}
        autoComplete="off"
        className={inputClass}
        placeholder={t('city.placeholder')}
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {/* 드롭다운 아이콘 */}
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
        >
          {renderOptions()}
        </ul>
      )}
    </div>
  )
}
