/** Resolve only after a browser copy path confirms success. */
export async function copyText(text: string): Promise<void> {
  if (!text.trim()) throw new Error('There is no text to copy')
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // Older browsers and restricted contexts may still support a selection copy.
  }
  if (typeof document === 'undefined') throw new Error('Copy is unavailable')
  const previous = document.activeElement as HTMLElement | null
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    if (!document.execCommand?.('copy')) throw new Error('Copy was not confirmed')
  } finally {
    textarea.remove()
    previous?.focus?.()
  }
}
