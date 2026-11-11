import { Pool } from 'pg'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { productQuestions } from '../../src/report/product-questions.ts'

const products = [
  ['01', 'Your Life, Your Destiny', 'complete'], ['02', 'Success, Money & Your Future', 'career'],
  ['03', 'Are We Meant to Be?', 'compatibility'], ['04', 'Your Next 12 Months', 'year'],
  ['05', 'Born to Build a Business?', 'business'], ['06', 'The Real You', 'wellbeing'], ['07', 'Your Destiny Collection', 'bundle'],
] as const
interface SourceAnswer { title: string; actual_answer: string; status: string; score: number | null; deductions: string[] }
interface SourcePdf { product_id: string; profile_id: string; pdf: string; page_count: number; question_count: number; answers: SourceAnswer[] }
interface QualitySource { source_commit: string; audit_date: string; pdfs: SourcePdf[]; card_asset_check?: { pdfs_checked?: number; embedded_card_image_found?: number } }
let pool: Pool | undefined
let sourceCache: QualitySource | undefined
async function loadSource(): Promise<QualitySource> {
  if (sourceCache) return sourceCache
  const path = resolve(process.cwd(), 'docs/quality-audits/35-pdf-content-extraction-2026-11-11.json')
  sourceCache = JSON.parse(await readFile(path, 'utf8')) as QualitySource
  return sourceCache
}
function db() {
  const url = process.env.FATE_REVIEW_DATABASE_URL || process.env.FATE_PAYMENTS_DATABASE_URL
  if (!url || !/^postgres(?:ql)?:\/\//.test(url)) throw new Error('review_storage_not_configured')
  return pool ??= new Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 5000, statement_timeout: 10000 })
}
async function ensureSchema() {
  await db().query(`CREATE TABLE IF NOT EXISTS fate_quality_reviews (
    pdf_id text NOT NULL, product_id text NOT NULL, profile_id text NOT NULL, question_id text NOT NULL,
    score integer, deduction_sentence text NOT NULL DEFAULT '', deduction_reason text NOT NULL DEFAULT '',
    revision_note text NOT NULL DEFAULT '', revised_answer text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'VERIFY',
    reviewer text NOT NULL DEFAULT '', evaluated_at timestamptz, github_sha text NOT NULL DEFAULT '',
    pdf_version text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(pdf_id, question_id))`)
}
const qid = (productId: string, title: string, index: number) => {
  const kind = products.find(([id]) => id === productId)?.[2]
  const items = kind ? productQuestions(kind) : []
  return items.find(q => q.title === title)?.id ?? `${productId}-q${index + 1}`
}
export async function qualityData() {
  const source = await loadSource()
  const records = await db().query('SELECT * FROM fate_quality_reviews')
  const saved = new Map(records.rows.map(row => [`${row.pdf_id}:${row.question_id}`, row]))
  const pdfs = source.pdfs.filter(pdf => pdf.product_id !== '02' || pdf.pdf.includes('profile-'))
  const rows = pdfs.map(pdf => ({
    pdfId: `${pdf.product_id}-${pdf.profile_id}`, productId: pdf.product_id, profileId: pdf.profile_id,
    pdfFile: pdf.pdf.split('/').pop() ?? 'unknown.pdf', pageCount: pdf.page_count,
    cardChecked: source.card_asset_check?.pdfs_checked === 35 && source.card_asset_check?.embedded_card_image_found === 35, questionCount: pdf.question_count,
    answers: pdf.answers.map((answer, index) => {
      const questionId = qid(pdf.product_id, answer.title, index)
      const review = saved.get(`${pdf.product_id}-${pdf.profile_id}:${questionId}`)
      return { questionId, title: answer.title, answer: answer.actual_answer,
        sourceStatus: answer.status, sourceScore: answer.score, deductions: answer.deductions,
        review: review ? { score: review.score, deductionSentence: review.deduction_sentence,
          deductionReason: review.deduction_reason, revisionNote: review.revision_note,
          revisedAnswer: review.revised_answer, status: review.status, reviewer: review.reviewer,
          evaluatedAt: review.evaluated_at, githubSha: review.github_sha, pdfVersion: review.pdf_version,
          updatedAt: review.updated_at } : null }
    })
  }))
  return { generatedFrom: source.source_commit, auditDate: source.audit_date, pdfs: rows }
}
export async function saveReview(value: Record<string, unknown>, reviewer: string) {
  const text = (key: string, max: number) => {
    const value = valueOf(key)
    if (typeof value !== 'string' || value.length > max) throw new Error('invalid_review_data')
    return value
  }
  const valueOf = (key: string) => value[key]
  const score = value.score
  if (score !== null && (!Number.isInteger(score) || (score as number) < 0 || (score as number) > 100)) throw new Error('invalid_score')
  const status = value.status
  if (!['PASS', 'FIX', 'VERIFY'].includes(String(status))) throw new Error('invalid_status')
  const fields = {
    pdfId: text('pdfId', 100), productId: text('productId', 2), profileId: text('profileId', 100),
    questionId: text('questionId', 100), deductionSentence: text('deductionSentence', 2000),
    deductionReason: text('deductionReason', 4000), revisionNote: text('revisionNote', 4000),
    revisedAnswer: text('revisedAnswer', 10000), githubSha: text('githubSha', 64), pdfVersion: text('pdfVersion', 200),
  }
  const source = await loadSource()
  const pdf = source.pdfs.find(row => `${row.product_id}-${row.profile_id}` === fields.pdfId)
  if (!pdf || pdf.product_id !== fields.productId || pdf.profile_id !== fields.profileId
    || !pdf.answers.some((answer, index) => qid(pdf.product_id, answer.title, index) === fields.questionId)) throw new Error('unknown_review_target')
  if (status === 'PASS' && (score === null || (score as number) < 95)) throw new Error('pass_requires_95')
  await ensureSchema()
  await db().query(`INSERT INTO fate_quality_reviews
    (pdf_id,product_id,profile_id,question_id,score,deduction_sentence,deduction_reason,revision_note,revised_answer,status,reviewer,evaluated_at,github_sha,pdf_version)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),$12,$13)
    ON CONFLICT (pdf_id,question_id) DO UPDATE SET score=EXCLUDED.score,deduction_sentence=EXCLUDED.deduction_sentence,
    deduction_reason=EXCLUDED.deduction_reason,revision_note=EXCLUDED.revision_note,revised_answer=EXCLUDED.revised_answer,
    status=EXCLUDED.status,reviewer=EXCLUDED.reviewer,evaluated_at=now(),github_sha=EXCLUDED.github_sha,
    pdf_version=EXCLUDED.pdf_version,updated_at=now()`, [fields.pdfId, fields.productId, fields.profileId, fields.questionId,
      score, fields.deductionSentence, fields.deductionReason, fields.revisionNote, fields.revisedAnswer,
      status, reviewer, fields.githubSha, fields.pdfVersion])
  return { saved: true }
}

export function qualityDashboardPage(nonce: string) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>FATE KEY 품질 대시보드</title>
  <style>body{margin:0;background:#f5f1e7;color:#182333;font:15px/1.6 system-ui,sans-serif}main{max-width:1300px;margin:auto;padding:18px}header,.row,.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}h1{font-size:24px}button,select,input,textarea{font:inherit;border:1px solid #b9aa87;border-radius:7px;padding:9px;background:white;color:inherit}button{background:#1e3044;color:white;cursor:pointer}button:focus-visible,textarea:focus-visible{outline:3px solid #c2973e}button[aria-pressed=true]{background:#b58e43;color:#101820}.stats,.products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.stat,.card,.detail{background:white;border:1px solid #ddd2ba;border-radius:10px;padding:14px;min-width:0}.stat strong{font-size:24px;display:block}.products{grid-template-columns:repeat(3,minmax(0,1fr))}.answers{display:grid;grid-template-columns:280px minmax(0,1fr);gap:14px}.list{max-height:65vh;overflow:auto}.item{display:block;width:100%;text-align:left;background:white;color:#182333;margin:6px 0;overflow-wrap:anywhere}.detail textarea{width:100%;box-sizing:border-box;min-height:90px}.answer{white-space:pre-wrap;overflow-wrap:anywhere;max-height:280px;overflow:auto;background:#f8f6f0;padding:12px;border-radius:6px}.muted{color:#687487;font-size:13px}.badge{display:inline-block;border-radius:20px;padding:2px 9px;background:#eee5d2}.green{background:#dcefe3}.red{background:#f5dfda}.warning{padding:10px;background:#fff3d6;border-radius:6px}.toolbar{margin:12px 0}.hidden{display:none}label{display:block;margin:8px 0}#msg{min-height:24px}@media(max-width:700px){main{padding:12px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.products{grid-template-columns:1fr}.answers{grid-template-columns:1fr}.list{max-height:30vh}.stat strong{font-size:20px}header{align-items:flex-start}h1{font-size:21px}}</style></head><body><main>
  <header><h1>THE FATE KEY · 품질 관리</h1><button id="export">JSON 내보내기</button><button id="importBtn">JSON 가져오기</button><input id="importFile" type="file" accept="application/json" hidden><button id="logout">로그아웃</button></header>
  <p class="muted">자동 진단 경고와 독립 평가 점수는 별도로 표시됩니다. 점수가 없는 PDF는 미평가입니다.</p><div id="msg" role="status"></div><section class="stats" id="stats"></section><section class="products" id="products"></section>
  <section id="workspace" class="hidden"><div class="toolbar"><button id="back">← 상품 목록</button><select id="profile"></select><span id="pdfmeta" class="muted"></span></div><div class="answers"><nav id="questionList" class="list" aria-label="질문 목록"></nav><article id="detail" class="detail"><p>왼쪽에서 질문을 선택하세요.</p></article></div></section>
  </main><script nonce="${nonce}">
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let data,chosenProduct,chosenPdf,chosenAnswer;
  const names={'01':'Your Life, Your Destiny','02':'Success, Money & Your Future','03':'Are We Meant to Be?','04':'Your Next 12 Months','05':'Born to Build a Business?','06':'The Real You','07':'Your Destiny Collection'};
  async function call(action,body){const r=await fetch('/api/admin-review?action='+action,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});if(r.status===401){location.replace('/api/admin-review?view=quality');throw Error('로그인이 만료되었습니다.')}if(!r.ok){const e=await r.json().catch(()=>({}));throw Error(e.error||'요청에 실패했습니다.')}return r.json()}
  function setmsg(s){document.getElementById('msg').textContent=s}
  function render(){const pdfs=data.pdfs, answers=pdfs.flatMap(p=>p.answers.map(a=>({...a,pdf:p})));const evaluated=pdfs.filter(p=>p.answers.every(a=>a.review?.score!==null&&a.review?.score!==undefined));const passed=pdfs.filter(p=>p.answers.every(a=>a.review?.score>=95&&a.review?.status==='PASS'));const fix=answers.filter(a=>a.review?.status==='FIX').length,verify=answers.filter(a=>(a.review?.status||a.sourceStatus)==='VERIFY').length;
  const stats=[['전체 상품',7],['테스트 PDF',pdfs.length],['실제 답변',answers.length],['95점 이상 PDF',passed.length],['95점 미달 PDF',evaluated.length-passed.length],['미평가 PDF',pdfs.length-evaluated.length],['FIX 질문',fix],['VERIFY 질문',verify]];
  document.getElementById('stats').innerHTML=stats.map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');const grouped={};for(const p of pdfs)(grouped[p.productId]??=[]).push(p);
  document.getElementById('products').innerHTML=Object.keys(names).map(id=>{const list=grouped[id]||[],done=list.filter(p=>p.answers.every(a=>a.review?.score!=null)).length,pass=list.filter(p=>p.answers.every(a=>a.review?.score>=95&&a.review?.status==='PASS')).length;return '<button class="card" data-product="'+id+'"><b>'+id+' — '+esc(names[id])+'</b><p>'+list.length+' PDF · '+list.reduce((n,p)=>n+p.answers.length,0)+' 답변</p><span class="badge">평가 완료 '+done+'/5</span> <span class="badge '+(pass===5?'green':'')+'">95점 PASS '+pass+'/5</span></button>'}).join('');document.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>openProduct(b.dataset.product));}
  function openProduct(id){chosenProduct=id;const list=data.pdfs.filter(p=>p.productId===id);document.getElementById('workspace').classList.remove('hidden');document.getElementById('products').classList.add('hidden');const sel=document.getElementById('profile');sel.innerHTML=list.map((p,i)=>'<option value="'+esc(p.pdfId)+'">프로필 '+(i+1)+' · '+esc(p.profileId)+'</option>').join('');sel.onchange=()=>openPdf(sel.value);openPdf(list[0]?.pdfId)}
  function openPdf(id){chosenPdf=data.pdfs.find(p=>p.pdfId===id);document.getElementById('pdfmeta').textContent=(chosenPdf?.pdfFile||'')+' · '+(chosenPdf?.pageCount||'?')+' pages · card '+(chosenPdf?.cardChecked?'source asset present':'VERIFY');document.getElementById('questionList').innerHTML=chosenPdf.answers.map((a,i)=>'<button class="item" data-q="'+i+'">'+(i+1)+'. '+esc(a.title)+'<br><span class="badge">'+esc(a.review?.status||a.sourceStatus||'VERIFY')+'</span> '+(a.review?.score??'미평가')+'</button>').join('');document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>openAnswer(Number(b.dataset.q)));openAnswer(0)}
  function openAnswer(i){chosenAnswer=chosenPdf.answers[i];const r=chosenAnswer.review||{};const diagnosis=[];if(!/Bottom Line/i.test(chosenAnswer.answer))diagnosis.push('Bottom Line 표시 없음');if(/^(Your Answer|Answer|Answer detail):/m.test(chosenAnswer.answer))diagnosis.push('구형 답변 표식');if(chosenAnswer.answer.length<80)diagnosis.push('답변이 짧아 직접 답변 확인 필요');const instruction='Product '+chosenProduct+', question '+(i+1)+': '+chosenAnswer.title+'\n현재 답변: '+chosenAnswer.answer+'\n문제: '+(r.deductionReason||'검수 메모에 문제를 구체적으로 적어주세요.')+'\n수정 방향: 질문에 첫 문장으로 직접 답하고, 개인 프로필 근거와 연결된 짧은 설명으로 수정하세요.\n대상: 현재 질문의 답변 생성 규칙을 코드에서 추적해 수정하세요.\n검증: 회귀 테스트 후 5개 프로필 PDF를 모두 재생성하고 독립 평가하세요.';
  document.getElementById('detail').innerHTML='<h2>'+esc(chosenAnswer.title)+'</h2><p><span class="badge">실제 답변 · '+esc(chosenAnswer.pdf.pdfFile)+'</span> <span class="badge">독립 점수: '+(r.score??'미평가')+'</span></p><div class="answer">'+esc(chosenAnswer.answer)+'</div>'+(diagnosis.length?'<p class="warning">자동 진단 경고: '+diagnosis.map(esc).join(' · ')+' (점수 아님)</p>':'<p class="muted">자동 구조 경고 없음 · 독립 평가 아님</p>')+'<label>감점 문장<input id="sentence" value="'+esc(r.deductionSentence||'')+'"></label><label>감점 이유 — 한국어<textarea id="reason">'+esc(r.deductionReason||'')+'</textarea></label><label>수정 메모<textarea id="note">'+esc(r.revisionNote||'')+'</textarea></label><label>수정 후 답변<textarea id="revised">'+esc(r.revisedAnswer||'')+'</textarea></label><div class="row"><label>점수 (0–100)<input id="score" type="number" min="0" max="100" value="'+(r.score??'')+'" placeholder="미평가"></label><label>상태<select id="status"><option>VERIFY</option><option>FIX</option><option>PASS</option></select></label><label>GitHub SHA<input id="sha" value="'+esc(r.githubSha||data.generatedFrom)+'"></label></div><button id="save">검수 저장</button> <button id="copy">수정 지시서 복사</button><p class="muted">저장 기록: '+esc(r.updatedAt||'없음')+'</p><details><summary>수정 전후 비교</summary><div class="pair"><h3>수정 전</h3><div class="answer">'+esc(chosenAnswer.answer)+'</div><h3>수정 후</h3><div class="answer">'+esc(r.revisedAnswer||'아직 입력되지 않음')+'</div></div></details>';
  document.getElementById('status').value=r.status||'VERIFY';document.getElementById('save').onclick=async()=>{try{const score=document.getElementById('score').value;await call('quality-save',{pdfId:chosenPdf.pdfId,productId:chosenPdf.productId,profileId:chosenPdf.profileId,questionId:chosenAnswer.questionId,score:score===''?null:Number(score),status:document.getElementById('status').value,deductionSentence:document.getElementById('sentence').value,deductionReason:document.getElementById('reason').value,revisionNote:document.getElementById('note').value,revisedAnswer:document.getElementById('revised').value,githubSha:document.getElementById('sha').value,pdfVersion:data.auditDate});setmsg('검수 기록을 저장했습니다.');await load();openProduct(chosenProduct);document.getElementById('profile').value=chosenPdf.pdfId;openPdf(chosenPdf.pdfId);openAnswer(i)}catch(e){setmsg(e.message)}};document.getElementById('copy').onclick=async()=>{await navigator.clipboard.writeText(instruction);setmsg('수정 지시서를 복사했습니다.')};}
  async function load(){data=await call('quality-data');render()}document.getElementById('back').onclick=()=>{document.getElementById('workspace').classList.add('hidden');document.getElementById('products').classList.remove('hidden')};document.getElementById('export').onclick=()=>{const reviews=data.pdfs.flatMap(p=>p.answers.filter(a=>a.review).map(a=>({pdfId:p.pdfId,productId:p.productId,profileId:p.profileId,questionId:a.questionId,...a.review})));const blob=new Blob([JSON.stringify({reviews},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fate-key-quality-reviews.json';a.click();URL.revokeObjectURL(a.href)};document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();document.getElementById('importFile').onchange=async e=>{try{const parsed=JSON.parse(await e.target.files[0].text());if(!Array.isArray(parsed.reviews))throw Error('reviews 배열을 찾을 수 없습니다.');for(const r of parsed.reviews)await call('quality-save',r);await load();setmsg('JSON 검수 기록을 가져왔습니다.')}catch(e){setmsg(e.message)}};document.getElementById('logout').onclick=async()=>{await call('logout',{});location.replace('/api/admin-review?view=quality')};load().catch(e=>setmsg(e.message));
  </script></body></html>`
}
