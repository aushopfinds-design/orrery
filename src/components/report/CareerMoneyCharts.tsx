import type { ReactNode } from 'react'
import type { careerMoneyChartData } from '../../report/career-money-charts.ts'
import './career-money-charts.css'

type CareerData = ReturnType<typeof careerMoneyChartData>

function Panel({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return <section className="fate-career-chart" aria-label={title}><h3>{title}</h3>{children}{note && <p className="fate-career-chart-note">{note}</p>}</section>
}

export default function CareerMoneyCharts({ data, chapterId }: { data: CareerData; chapterId: string }) {
  if (chapterId === 'working-style') return <div className="fate-career-visuals">
    <Panel title="Your Four Pillars" note={data.unknownTime ? 'Birth time unknown: the Hour Pillar is omitted and no hour is inferred.' : 'Read from left to right: Hour, Day, Month and Year. The Day stem is the starting point for the Ten Gods.'}>
      <div className="fate-career-pillar-grid">{data.pillars.map(item => <div key={item.position} className={item.position === 'Day' ? 'is-day' : ''}>
        <span>{item.position}</span><strong lang="zh">{item.ganzi}</strong><small>{item.stemGod}</small><small>{item.branchGod}</small><small>Hidden: {item.hidden.map(hidden => hidden.god).join(', ') || '—'}</small>
      </div>)}</div>
    </Panel>
    <Panel title="Five Elements · Visible Markers" note={`Counts are unweighted visible stem and branch markers (${data.elementTotal} in total). They are not a strength or luck score; hidden stems and season are assessed separately.`}>
      <div className="fate-career-bars">{data.elements.map(item => <div className="fate-career-bar-row" key={item.element}><span>{item.element}</span><div role="img" aria-label={`${item.element}: ${item.count} visible markers`}><i style={{ width: `${Math.max(item.count ? 8 : 0, item.count / Math.max(1, ...data.elements.map(element => element.count)) * 100)}%` }} /></div><b>{item.count}</b></div>)}</div>
    </Panel>
    <p className="fate-career-chart-note"><strong>Day Master tendency:</strong> {data.strength}. {data.strengthEvidence.join(' ')}</p>
  </div>

  if (chapterId === 'money-commitments') return <div className="fate-career-visuals">
    <Panel title="Money-Related Ten Gods" note="Visible and principal-branch markers are shown as one count; hidden stems are shown separately. A missing or repeated symbol does not measure earning ability.">
      <div className="fate-career-table-wrap"><table className="fate-career-table"><thead><tr><th scope="col">Ten-God theme</th><th scope="col">Visible / principal</th><th scope="col">Hidden stems</th></tr></thead><tbody>{data.visibleCounts.filter(item => ['正財','偏財','食神','傷官','比肩','劫財','正官','偏官','正印','偏印'].includes(item.god)).map((item,index) => <tr key={item.god}><th scope="row">{item.label}</th><td>{item.count}</td><td>{data.hiddenCounts[index].count}</td></tr>)}</tbody></table></div>
    </Panel>
    <Panel title="Observed Earning Routes" note={data.structureStatus}>
      <div className="fate-career-route-list">{data.incomeRoutes.map(route => <div key={route.from} className={route.present ? 'is-present' : 'is-unconfirmed'}><strong>{route.from}</strong><span aria-hidden="true">→</span><strong>{route.to}</strong><small>{route.present ? `Present: ${route.gods.join(', ')}` : 'Not established in the checked principal positions'}</small></div>)}</div>
      <p className="fate-career-chart-note"><strong>Direct money evidence:</strong> {data.moneyEvidence.length ? data.moneyEvidence.map(item => `${item.label} at ${item.source}`).join('; ') : 'No direct visible money marker in the checked positions.'} {data.hiddenMoneyEvidence.length ? `Hidden evidence: ${data.hiddenMoneyEvidence.map(item => `${item.label} at ${item.source}`).join('; ')}.` : 'No hidden money marker was found.'}</p>
    </Panel>
  </div>

  if (chapterId === 'two-work-layers') return <Panel title="Work-Style Evidence" note="The examples describe kinds of tasks, not guaranteed job titles. Read the public role and the hidden daily routine together.">
    <div className="fate-career-work-fit"><div><span>Public role · Month stem</span><strong>{data.monthStemGod}</strong><p>{data.visibleCounts.find(item => item.label === data.monthStemGod)?.label ?? data.monthStemGod} is the visible work relationship.</p></div><div><span>Daily routine · Month branch</span><strong>{data.monthBranchGod}</strong><p>The branch’s principal hidden stem adds this underlying work relationship.</p></div></div>
    <div className="fate-career-table-wrap"><table className="fate-career-table"><thead><tr><th scope="col">Observed relationship</th><th scope="col">Work expression to consider</th></tr></thead><tbody>{[data.monthStemGod,data.monthBranchGod].map((god,index) => <tr key={`${god}-${index}`}><th scope="row">{god}</th><td>{index ? 'Compare this daily-task pattern with the actual routine and workload.' : 'Compare this outward role pattern with the authority, visibility and responsibility in a real job.'}</td></tr>)}</tbody></table></div>
  </Panel>

  if (chapterId === 'proof-of-skill') return <Panel title="Employment and Independent Work · Chart Comparison" note="This comparison identifies chart themes; it cannot decide which option will succeed. Real skills, demand, contracts and resources remain decisive.">
    <div className="fate-career-choice-grid">{[{ title: 'Employment / structured roles', signals: data.employmentSignals },{ title: 'Independent work / business', signals: data.independentSignals }].map(column => <section key={column.title}><h4>{column.title}</h4>{column.signals.map(signal => <p key={signal.label}><span aria-hidden="true">{signal.present ? '●' : '○'}</span><strong>{signal.label}</strong><small>{signal.note}</small></p>)}</section>)}</div>
    <p className="fate-career-chart-note">The day-strength review is <strong>{data.strength}</strong>. No one structure is presented as an automatic “best” path.</p>
  </Panel>

  if (chapterId === 'feedback-and-boundaries') return <Panel title="Ten-Year Career and Money Cycles" note={data.caveat}>
    {data.cycles.length ? <div className="fate-career-timeline">{data.cycles.map((cycle,index) => <article key={`${cycle.ganzi}-${cycle.start}`}><span>{index === data.cycles.length - 1 ? 'Later calculated cycle' : 'Calculated cycle'}</span><strong>{cycle.span}</strong><b lang="zh">{cycle.ganzi}</b><small>{cycle.stemGod} · {cycle.branchGod}</small><p>{cycle.workTheme}</p><p>{cycle.moneyTheme}</p><details><summary>Why this period is included</summary><p>{cycle.relation}</p><code>{cycle.evidence}</code></details></article>)}</div> : <p>No calculated ten-year cycle is available in the engine’s supported range.</p>}
    <p className="fate-career-chart-note">Cycle start dates follow the calculated birth-time and direction rules. The next visible card is a calculated cycle, not a promise of a specific event.</p>
  </Panel>

  if (chapterId === 'work-chapters') return <Panel title={`Year-by-Year Outlook · ${data.years[0]?.year ?? ''}–${data.years.at(-1)?.year ?? ''}`} note="Each row compares the year pillar with the natal chart and active ten-year cycle. The Saju year changes at Ipchun (Beginning of Spring), so the calendar-year label is a reading reference, not a claim that the pillar changes on 1 January. No earnings amount or luck score is calculated.">
    <div className="fate-career-table-wrap"><table className="fate-career-table fate-career-years"><thead><tr><th scope="col">Year</th><th scope="col">Calculated year pillar</th><th scope="col">Career theme</th><th scope="col">Money theme</th><th scope="col">Cycle and reading note</th></tr></thead><tbody>{data.years.map(year => <tr key={year.year}><th scope="row">{year.year}</th><td lang="zh">{year.pillar}<small>{year.stemGod} · {year.branchGod}</small></td><td>{year.work}</td><td>{year.money}</td><td><strong>{year.direction}</strong><small>{year.cycle}</small><small>{year.caution}</small><details><summary>Calculation basis</summary><ul>{year.evidence.map((fact,index)=><li key={`${index}-${fact}`}>{fact}</li>)}</ul></details></td></tr>)}</tbody></table></div>
  </Panel>

  if (chapterId === 'career-plan') return <Panel title="Your Career & Money Summary" note="A synthesis of the calculated chart, not a promise of career or financial outcomes.">
    <div className="fate-career-summary-card"><div><span>Work foundations</span><strong>{data.monthStemGod} + {data.monthBranchGod}</strong><p>Public responsibilities and daily work are read as separate layers.</p></div><div><span>Money markers</span><strong>{data.moneyEvidence.length + data.hiddenMoneyEvidence.length} observed location{data.moneyEvidence.length + data.hiddenMoneyEvidence.length === 1 ? '' : 's'}</strong><p>Visible and hidden positions remain separate; symbols are not added into a fortune score.</p></div><div><span>Current structural reading</span><strong>{data.strength}</strong><p>{data.caveat}</p></div></div>
  </Panel>
  return null
}
