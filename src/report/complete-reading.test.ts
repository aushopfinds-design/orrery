import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { buildCompleteReading, buildFreeReading } from './complete-reading.ts'
import { resolveReportRoute } from '../utils/report-route.ts'
import { plainReadingText } from './reading-text.ts'

const locations = [
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
] as const
const base: BirthInput = { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M', ...locations[1] }
const profiles: BirthInput[] = Array.from({ length: 60 }, (_, i) => ({
  year: 1940 + i, month: i % 12 + 1, day: 8 + i % 20, hour: 3 + i % 18, minute: 15,
  gender: i % 2 ? 'F' : 'M', unknownTime: i % 5 === 0, ...locations[i % 4],
}))

describe('Free snapshot and full sample have different content', () => {
  it('keeps the free reading concise and excludes premium relationship, money and timeline chapters', () => {
    const result = calculateSaju(base)
    const free = buildFreeReading(result)
    const full = buildCompleteReading(result, 2026)
    expect(free.dayMaster).toBe(full.dayMaster)
    expect(free.birthSummary).toBe(full.birthSummary)
    expect(free.pillarSummary).toEqual(full.pillarSummary)
    expect(free).not.toHaveProperty('periods')
    expect(free).not.toHaveProperty('chapters')
    const freeText = [...free.paragraphs, free.workNote].join(' ')
    expect(freeText.split(/\s+/).length).toBeLessThan(250)
    expect(full.fullText.split(/\s+/).length).toBeGreaterThan(2000)
    expect(full.chapters.find(chapter => chapter.id === 'love')).toBeDefined()
    expect(full.chapters.find(chapter => chapter.id === 'money')).toBeDefined()
  })

  it('grounds the free personality and work notes in actual day and month markers', () => {
    const result = calculateSaju(base)
    const free = buildFreeReading(result)
    expect(free.evidence.join(' ')).toContain(result.pillars[1].pillar.stem)
    expect(free.evidence.join(' ')).toContain(result.pillars[2].pillar.stem)
    expect(free.evidence.join(' ')).toContain(result.pillars[2].stemSipsin)
    expect(free.elements.reduce((sum, item) => sum + item.count, 0)).toBe(8)
  })
})

describe('Complete reading quality across 60 international profiles', () => {
  const readings = profiles.map(input => ({ input, result: calculateSaju(input), reading: buildCompleteReading(calculateSaju(input), 2026) }))

  it('has substantive variation beyond changing date labels, including profiles with the same day marker', () => {
    expect(new Set(readings.map(({ reading }) => reading.chapters[0].paragraphs.join(' '))).size).toBeGreaterThan(30)
    const grouped = new Map<string, string[]>()
    for (const { reading } of readings) {
      const values = grouped.get(reading.dayMaster) ?? []
      values.push(reading.chapters.find(chapter => chapter.id === 'career')!.paragraphs.join(' '))
      grouped.set(reading.dayMaster, values)
    }
    expect([...grouped.values()].some(values => values.length >= 3 && new Set(values).size >= 3)).toBe(true)
  })

  it('connects work and relationship chapters to the specific calculated markers', () => {
    for (const { result, reading } of readings) {
      const work = reading.chapters.find(chapter => chapter.id === 'career')!
      const love = reading.chapters.find(chapter => chapter.id === 'love')!
      expect(work.evidence.join(' ')).toContain(result.pillars[2].stemSipsin)
      expect(work.evidence.join(' ')).toContain(result.pillars[2].branchSipsin)
      expect(love.evidence.join(' ')).toContain(result.pillars[1].pillar.ganzi)
      expect(love.evidence.join(' ')).toContain(result.pillars[1].branchSipsin)
    }
  })

  it('connects multiple chart positions into distinct, traceable prompts in the text export', () => {
    const workPrompts = new Map<string, Set<string>>()
    for (const { result, reading } of readings) {
      const [work, love] = reading.connections
      expect(work.evidence.join(' ')).toContain(result.pillars[1].pillar.stem)
      expect(work.evidence.join(' ')).toContain(result.pillars[2].stemSipsin)
      expect(love.evidence.join(' ')).toContain(result.pillars[1].pillar.ganzi)
      expect(love.evidence.join(' ')).toContain(result.pillars[1].branchSipsin)
      for (const connection of reading.connections) {
        expect(reading.chapters.some(chapter => chapter.id === connection.chapterId)).toBe(true)
        expect(reading.fullText).toContain(plainReadingText(connection.text))
        expect(reading.fullText).toContain(connection.question)
        expect(connection.text.split(/\s+/).length).toBeLessThan(95)
      }
      const prompts = workPrompts.get(reading.dayMaster) ?? new Set<string>()
      prompts.add(work.text)
      workPrompts.set(reading.dayMaster, prompts)
    }
    expect([...workPrompts.values()].some(prompts => prompts.size >= 3)).toBe(true)
    expect(new Set(readings.map(({ reading }) => reading.connections[0].text)).size).toBeGreaterThan(20)
    expect(new Set(readings.map(({ reading }) => reading.connections[1].text)).size).toBeGreaterThan(30)
  })

  it('contains no duplicated body paragraphs or leaked template values', () => {
    for (const { reading } of readings) {
      const paragraphs = reading.chapters.flatMap(chapter => [chapter.lead, ...chapter.paragraphs])
      expect(new Set(paragraphs).size).toBe(paragraphs.length)
      expect(reading.fullText).not.toMatch(/undefined|NaN|\[object Object\]/)
      expect(reading.chapters.every(chapter => chapter.evidence.length > 0 && chapter.tryThis.length > 0)).toBe(true)
    }
  })

  it('keeps paragraphs short and provides a glossary for chart terminology', () => {
    for (const { reading } of readings) {
      const paragraphs = [...reading.chapters, reading.actionPlan].flatMap(chapter => [chapter.lead, ...chapter.paragraphs])
        .concat(reading.periods.flatMap(period => period.paragraphs))
      for (const paragraph of paragraphs) {
        const plain = plainReadingText(paragraph)
        expect(plain.split(/\s+/).length).toBeLessThanOrEqual(80)
        expect(plain).not.toMatch(/undefined|NaN|\[object Object\]/)
      }
      expect(reading.fullText).toContain('Chart terms in plain English')
      expect(reading.fullText).not.toContain('**')
    }
  })

  it('includes distinct helpful habits and cautions in every chapter, period and plain-text copy', () => {
    for (const { reading } of readings) {
      for (const section of [...reading.chapters, reading.actionPlan, ...reading.periods]) {
        expect(section.guidance.keepClose.length).toBeGreaterThan(0)
        expect(section.guidance.watchFor.length).toBeGreaterThan(0)
        expect(section.guidance.keepClose.every(item => item.trim().length > 0)).toBe(true)
        expect(section.guidance.watchFor.every(item => item.trim().length > 0)).toBe(true)
        for (const item of [...section.guidance.keepClose, ...section.guidance.watchFor]) {
          expect(reading.fullText).toContain(plainReadingText(item))
        }
      }
    }
    for (const id of ['personality', 'career', 'love']) {
      const variants = readings.map(({ reading }) => reading.chapters.find(chapter => chapter.id === id)!.guidance)
      expect(new Set(variants.map(guidance => JSON.stringify(guidance))).size).toBeGreaterThanOrEqual(8)
    }
  })

  it('never calls the most common visible element a full strength or useful-element diagnosis', () => {
    for (const { reading } of readings) {
      expect(reading.methodNotes.join(' ')).toContain('not a full assessment of day-master strength')
      expect(reading.methodNotes.join(' ')).toContain('does not claim to diagnose')
      const balance = reading.chapters.find(chapter => chapter.id === 'balance')!
      if (reading.elements.some(element => element.count === 0)) expect(balance.paragraphs.join(' ')).toContain('does not mean a missing ability')
    }
  })

  it('keeps birth timezone and known clock time correct', () => {
    for (const { input, reading } of readings) {
      expect(reading.birthSummary).toContain(input.timezone)
      if (!input.unknownTime) expect(reading.birthSummary).toContain(`${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`)
    }
  })

  it('shows each chapter with its own calculated cycle data and starting date', () => {
    for (const { result, reading } of readings) {
      for (const period of reading.periods) {
        const cycle = result.daewoon.find(cycle => cycle.startDate.getUTCFullYear() === Number(period.period.split('–')[0]))!
        expect(period.text).toContain(cycle.startDate.toISOString().slice(0, 10))
        expect(period.text).toContain(cycle.stemSipsin)
      }
      expect(new Set(reading.periods.map(period => period.text)).size).toBe(reading.periods.length)
    }
  })
})

describe('Unknown birth time cannot influence the report with a guessed hour', () => {
  it('ignores different entered hours in every chapter and evidence note', () => {
    const firstResult = calculateSaju({ ...base, hour: 1, unknownTime: true })
    const secondResult = calculateSaju({ ...base, hour: 22, unknownTime: true })
    const first = buildCompleteReading(firstResult, 2026)
    const second = buildCompleteReading(secondResult, 2026)
    expect(first.fullText).toBe(second.fullText)
    expect(first.visibleMarkers).toBe(6)
    expect(first.elements.reduce((sum, item) => sum + item.count, 0)).toBe(6)
    expect(first.pillarSummary).toContain('Hour: Unknown')
    expect(first.fullText).toContain('three pillars')
    const facts = first.chapters.flatMap(chapter => chapter.evidence).join(' ')
    expect(facts).not.toMatch(/Hour (stem|branch)|between the hour|hour and/)
    expect(buildFreeReading(firstResult)).toEqual(buildFreeReading(secondResult))
  })
})

describe('Shareable report routes', () => {
  it('keeps full samples and their chapter links separate from personal free results', () => {
    expect(resolveReportRoute('#complete-life-reading')).toBe('product')
    expect(resolveReportRoute('#sample-report')).toBe('sample')
    expect(resolveReportRoute('#sample-report-love')).toBe('sample')
    expect(resolveReportRoute('#free-reading')).toBe('free')
    expect(resolveReportRoute('#reports')).toBe('home')
    expect(resolveReportRoute('#birth-details')).toBe('home')
  })
})
