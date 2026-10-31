import './bilingual-review.ts'
import { writeFileSync } from 'node:fs'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
import { structuralFacts } from '../src/report/structural-assessment.ts'
import { resolveStructure } from '../src/report/structure-resolution.ts'
const charts = Array.from({ length: 24 }, (_, i) => {
  const input = { ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 }
  const chart = calculateSaju(input), facts = structuralFacts(chart)
  return { input, pillars: chart.pillars.filter((_, index) => !(input.unknownTime && index === 0)).map(p => p.pillar.ganzi), strength: facts.tendency, resolution: resolveStructure(facts) }
})
writeFileSync('docs/report-r11-review/population-audit.json', JSON.stringify({ edition: '2026.10-r11', fictionalPopulation: true, charts }, null, 2) + '\n')
console.log(JSON.stringify({ population: charts.length, conditional: charts.filter(c => c.resolution.useful.status === 'conditional').length, withheld: charts.filter(c => c.resolution.useful.status === 'withheld').length }))
