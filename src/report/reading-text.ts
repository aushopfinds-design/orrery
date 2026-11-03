/** Only authored **emphasis** is supported. Content remains text, never HTML. */
export function readingTextParts(text: string): { text: string; bold: boolean }[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map(part => (
    part.startsWith('**') && part.endsWith('**')
      ? { text: part.slice(2, -2), bold: true }
      : { text: part, bold: false }
  ))
}

export function plainReadingText(text: string): string {
  return readingTextParts(text).map(part => part.text).join('')
}
