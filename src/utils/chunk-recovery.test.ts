import { describe,it,expect,vi } from 'vitest'
import { recoverMissingChunk } from './chunk-recovery.ts'
const event = (message = 'Failed to fetch dynamically imported module: /assets/old-report.js') => Object.assign(new Event('vite:preloadError', { cancelable:true }), { payload:new TypeError(message) })
describe('Missing deployment assets',()=>{
 it('reloads once without clearing birth details or paid purchase access',()=>{
  const values=new Map([['birth-details','saved-input'],['purchase-access','private-key']])
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)}}
  const reload=vi.fn(), first=event()
  expect(recoverMissingChunk(first,storage,reload,100000)).toBe(true)
  expect(first.defaultPrevented).toBe(true)
  expect(recoverMissingChunk(event(),storage,reload,100001)).toBe(false)
  expect(reload).toHaveBeenCalledTimes(1)
  expect(values.get('birth-details')).toBe('saved-input')
  expect(values.get('purchase-access')).toBe('private-key')
 })
 it('retains the manual error screen for application errors or blocked storage',()=>{
  const reload=vi.fn(),storage={getItem:()=>null,setItem:()=>{throw Error('blocked')}}
  expect(recoverMissingChunk(event('Cannot read properties of undefined'),storage,reload)).toBe(false)
  const missing=event();expect(recoverMissingChunk(missing,storage,reload)).toBe(false)
  expect(missing.defaultPrevented).toBe(false);expect(reload).not.toHaveBeenCalled()
 })
})
