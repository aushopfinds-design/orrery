/// <reference types="node" />
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { publishingIdentity } from './site-config.ts'
import { publicContent, renderDocument, sitemap } from './render-public.tsx'

const dist=resolve('dist')
const identity=publishingIdentity(process.env)
const pages=publicContent(identity)
const root=readFileSync(join(dist,'index.html'),'utf8')
const home=renderDocument(pages.find(page=>page.path==='/')!,identity).match(/<body[^>]*>([\s\S]*)<\/body>/)![1]
if(!root.includes('<!--PUBLIC_HOME_START-->')||!root.includes('<!--PUBLIC_HOME_END-->'))throw new Error('Public home boundaries are missing')
let renderedRoot=root.replace(/<!--PUBLIC_HOME_START-->[\s\S]*?<!--PUBLIC_HOME_END-->/,`<!--PUBLIC_HOME_START-->${home}<!--PUBLIC_HOME_END-->`)
if(identity.accountId)renderedRoot=renderedRoot.replace('</head>',`<meta name="google-adsense-account" content="${identity.accountId}"/>\n</head>`)
writeFileSync(join(dist,'index.html'),renderedRoot)
for(const page of pages.filter(page=>page.path!=='/')) {
  const dir=join(dist,page.path)
  mkdirSync(dir,{recursive:true})
  writeFileSync(join(dir,'index.html'),renderDocument(page,identity))
}
writeFileSync(join(dist,'sitemap.xml'),sitemap(identity))
if(identity.publisherId)writeFileSync(join(dist,'ads.txt'),`google.com, ${identity.publisherId}, DIRECT, f08c47fec0942fa0\n`)
writeFileSync(join(dist,'404.html'),renderDocument({path:'/404.html',title:'Page not found',description:'Find a reading or guide on The Fate Key.',body:'<p>This address does not match a published page. Browse the <a href="/samples/">sample readings</a> or return to the <a href="/">home page</a>.</p>',noindex:true},identity))
console.log(`Published ${pages.length} content paths. Ad serving: off. Publisher verification: ${identity.publisherId?'configured':'not supplied'}. Public contact: ${identity.contactEmail?'configured':'not supplied'}.`)
