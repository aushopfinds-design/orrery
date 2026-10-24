import { readingTextParts } from '../../report/reading-text.ts'

export default function ReadingText({ text }: { text: string }) {
  return <>{readingTextParts(text).map((part, index) => part.bold ? <strong key={index}>{part.text}</strong> : part.text)}</>
}
