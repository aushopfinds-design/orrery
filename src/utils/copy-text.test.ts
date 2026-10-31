import { afterEach, expect, it, vi } from 'vitest'
import { copyText } from './copy-text.ts'

afterEach(() => vi.unstubAllGlobals())

function legacyDocument(success: boolean) {
  const field = { value: '', style: {}, setAttribute: vi.fn(), select: vi.fn(), remove: vi.fn() }
  const doc = { activeElement: { focus: vi.fn() }, createElement: vi.fn(() => field), body: { appendChild: vi.fn() }, execCommand: vi.fn(() => success) }
  vi.stubGlobal('document', doc)
  return { field, doc }
}

it('copies the complete supplied report through the Clipboard API', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  const report = 'Complete report\nQuestions and symbols\nFinal section'
  await expect(copyText(report)).resolves.toBeUndefined()
  expect(writeText).toHaveBeenCalledWith(report)
})

it('uses a successful selection copy when the Clipboard API is blocked', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Blocked')) } })
  const { field, doc } = legacyDocument(true)
  await expect(copyText('Whole report')).resolves.toBeUndefined()
  expect(field.value).toBe('Whole report')
  expect(doc.execCommand).toHaveBeenCalledWith('copy')
  expect(field.remove).toHaveBeenCalled()
  expect(doc.activeElement.focus).toHaveBeenCalled()
})

it('does not report success when both browser copy paths fail', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Blocked')) } })
  const { field, doc } = legacyDocument(false)
  await expect(copyText('Whole report')).rejects.toThrow('not confirmed')
  expect(field.remove).toHaveBeenCalled()
  expect(doc.activeElement.focus).toHaveBeenCalled()
})

it('rejects an empty report instead of showing a false copied message', async () => {
  const writeText = vi.fn()
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  await expect(copyText('  ')).rejects.toThrow('no text')
  expect(writeText).not.toHaveBeenCalled()
})
