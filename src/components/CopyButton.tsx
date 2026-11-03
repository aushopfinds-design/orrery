import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { copyText } from '../utils/copy-text.ts'

interface Props {
  getText: () => string | Promise<string>
  label?: React.ReactNode
}

export default function CopyButton({ getText, label }: Props) {
  const { t } = useLocale()
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  useEffect(() => {
    if (status === 'idle' || status === 'copying') return
    const timer = setTimeout(() => setStatus('idle'), 3000)
    return () => clearTimeout(timer)
  }, [status])

  async function handleClick() {
    setStatus('copying')
    try {
      await copyText(await getText())
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'copying'}
      aria-busy={status === 'copying'}
      aria-live="polite"
      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 whitespace-nowrap"
    >
      {status === 'copied' ? t('copy.copied') : status === 'error' ? t('copy.failed') : status === 'copying' ? t('copy.copying') : (label ?? t('copy.copy'))}
    </button>
  )
}
