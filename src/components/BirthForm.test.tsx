// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import BirthForm from './BirthForm.tsx'
vi.mock('../i18n/index.ts', async importOriginal => {
  const actual = await importOriginal<typeof import('../i18n/index.ts')>()
  return { ...actual, useLocale: () => ({ locale: 'en', t: (key: string) => actual.t('en', key) }) }
})
it('asks for an hour only after opting in, and excludes time after opting out', async () => {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host); const submit = vi.fn()
  await act(async () => root.render(<BirthForm rememberInput={false} onSubmit={submit} />))
  const hour = () => host.querySelector('select[aria-label="Birth hour"]')
  const toggle = host.querySelector('input[type="checkbox"]') as HTMLInputElement
  expect(toggle.checked).toBe(false); expect(hour()).toBeNull()
  expect(host.textContent).toContain('I know my birth time')
  await act(async () => toggle.click())
  expect(hour()).not.toBeNull()
  expect(host.querySelector('select[aria-label="Birth minute"]')).toBeNull()
  await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(submit.mock.lastCall?.[0]).toMatchObject({ hour: 12, minute: 0, unknownTime: false, timezone: 'America/New_York' })
  await act(async () => toggle.click())
  expect(hour()).toBeNull()
  await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(submit.mock.lastCall?.[0]).toMatchObject({ unknownTime: true, minute: 0 })
  await act(async () => root.unmount()); host.remove()
})

it.each([
  ['AU', 'Sydney', -33.8688, 151.2093, 'Australia/Sydney'],
  ['US', 'Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'],
] as const)('passes the selected %s city coordinates and timezone into the customer birth input', async (country, city, latitude, longitude, timezone) => {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host); const submit = vi.fn()
  await act(async () => root.render(<BirthForm rememberInput={false} onSubmit={submit} />))
  const countrySelect = host.querySelector('#birth-country') as HTMLSelectElement
  await act(async () => {
    countrySelect.value = country
    countrySelect.dispatchEvent(new Event('change', { bubbles: true }))
  })
  const cityInput = host.querySelector('input[role="combobox"]') as HTMLInputElement
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(cityInput, city)
    cityInput.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const option = [...host.querySelectorAll('[role="option"]')].find(item => item.textContent?.includes(city))
  expect(option).toBeTruthy()
  await act(async () => option!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
  await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(submit.mock.lastCall?.[0]).toMatchObject({ latitude, longitude, timezone, unknownTime: true })
  await act(async () => root.unmount()); host.remove()
})
