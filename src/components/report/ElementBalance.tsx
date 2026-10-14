import type { ElementCount } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'

const colours: Record<string, string> = { Wood: '#73947e', Fire: '#c7836e', Earth: '#c39e65', Metal: '#9babb8', Water: '#6e93b2' }

export default function ElementBalance({ elements, visibleMarkers }: { elements: ElementCount[]; visibleMarkers: number }) {
  const { t } = useLocale()
  return (
    <div className="fate-element-snapshot">
      <table>
        <caption>{t('reading.elements.title')}</caption>
        <thead><tr><th scope="col">{t('reading.elements.element')}</th><th scope="col">{t('reading.elements.count')}</th></tr></thead>
        <tbody>{elements.map(item => <tr key={item.element}><th scope="row"><span aria-hidden="true" style={{ backgroundColor: colours[item.element] }} />{item.element}</th><td>{item.count}<span aria-hidden="true" className="fate-element-bar" style={{ width: `${item.count / visibleMarkers * 100}%`, backgroundColor: colours[item.element] }} /></td></tr>)}</tbody>
      </table>
      <p>{t('reading.elements.note').replace('{n}', String(visibleMarkers))}</p>
    </div>
  )
}
