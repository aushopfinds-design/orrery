import type { ElementCount } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'

const colours: Record<string, string> = { Wood: '#73947e', Fire: '#c7836e', Earth: '#c39e65', Metal: '#9babb8', Water: '#6e93b2' }

export default function ElementBalance({ elements, visibleMarkers }: { elements: ElementCount[]; visibleMarkers: number }) {
  const { t } = useLocale()
  const total = elements.reduce((sum, item) => sum + item.count, 0)
  const circumference = 2 * Math.PI * 56
  const slices = elements.map((item, index) => {
    const length = total ? item.count / total * circumference : 0
    const offset = total ? elements.slice(0, index).reduce((sum, previous) => sum + previous.count, 0) / total * circumference : 0
    return { ...item, length, offset }
  }).filter(item => item.count > 0)
  return (
    <div className="fate-element-snapshot fate-element-visual">
      <div className="fate-element-wheel" aria-hidden="true">
        <svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="56" fill="none" stroke="#dccdb3" strokeWidth="15" />{slices.map(item => <circle key={item.element} cx="75" cy="75" r="56" fill="none" stroke={colours[item.element]} strokeWidth="15" strokeDasharray={`${item.length} ${circumference - item.length}`} strokeDashoffset={-item.offset} transform="rotate(-90 75 75)" />)}</svg>
        <div><strong>{total}</strong><span>{t('reading.design.symbols')}</span></div>
      </div>
      <table>
        <caption>{t('reading.elements.title')}</caption>
        <thead><tr><th scope="col">{t('reading.elements.element')}</th><th scope="col">{t('reading.elements.count')}</th></tr></thead>
        <tbody>{elements.map(item => <tr key={item.element}><th scope="row"><span aria-hidden="true" style={{ backgroundColor: colours[item.element] }} />{item.element}</th><td>{item.count}<span aria-hidden="true" className="fate-element-bar" style={{ width: `${item.count / visibleMarkers * 100}%`, backgroundColor: colours[item.element] }} /></td></tr>)}</tbody>
      </table>
      <p>{t('reading.elements.note').replace('{n}', String(visibleMarkers))}</p>
    </div>
  )
}
