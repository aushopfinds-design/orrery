from pathlib import Path
import argparse, json, re, unicodedata
import fitz
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageFont

parser=argparse.ArgumentParser();parser.add_argument('--work-dir',required=True);args=parser.parse_args()
TMP=Path(args.work_dir).resolve()
manifest=json.loads((TMP/'export-manifest.json').read_text())
def norm(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','')
errors=[];summaries=[];primary=[]
for item in manifest:
    path=Path(item['path']);doc=fitz.open(path)
    reader=PdfReader(path)
    page_refs={page.indirect_reference.idnum:index for index,page in enumerate(reader.pages)}
    for index,page in enumerate(reader.pages):
        for annotation in page.get('/Annots',[]):
            annotation=annotation.get_object();destination=annotation.get('/Dest')
            if isinstance(destination,list) and getattr(destination[0],'idnum',-1) not in page_refs:
                errors.append({'file':str(path),'page':index+1,'type':'unresolved PDF destination'})
    body=''.join(page.get_text('text',clip=fitz.Rect(30,43,370,600)) if i else page.get_text() for i,page in enumerate(doc))
    body=norm(body)
    missing=[p for p in item['paragraphs'] if norm(p) and norm(p) not in body]
    if missing:errors.extend({'file':path.name,'type':'missing paragraph','text':p[:180]} for p in missing)
    bad_spans=[]
    for i,page in enumerate(doc):
        for link in page.get_links():
            if link.get('kind')==fitz.LINK_GOTO and not (0<=link.get('page',-1)<len(doc)):
                errors.append({'file':str(path),'page':i+1,'type':'invalid internal link','link':link})
        if i and item['kind']!='bundle' and f'Report page {i+1} of {len(doc)}' not in page.get_text():
            errors.append({'file':str(path),'page':i+1,'type':'page numbering'})
        is_cover='ANCIENT WISDOM. MODERN INSIGHT.' in page.get_text()
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                for span in line['spans']:
                    if not span['text'].strip():continue
                    x0,y0,x1,y1=span['bbox']
                    if x0 < -0.5 or y0 < -0.5 or x1 > 400.5 or y1 > 640.5:bad_spans.append((i+1,span['text'],span['bbox']))
                    if not is_cover and 40<y0<605 and (x0<30 or x1>370.5 or y1>600):bad_spans.append((i+1,span['text'],span['bbox']))
        if '\ufffd' in page.get_text():errors.append({'file':str(path),'page':i+1,'type':'replacement character'})
        if '\x00' in page.get_text():errors.append({'file':str(path),'page':i+1,'type':'missing glyph'})
    for level,title,page_number in doc.get_toc():
        target_text=norm(doc[page_number-1].get_text()) if 1<=page_number<=len(doc) else ''
        expected_title='Complete Bundle' if title=='Bundle guide' else title
        if not target_text or norm(expected_title) not in target_text:
            errors.append({'file':str(path),'type':'outline destination','title':title,'page':page_number})
    if bad_spans:errors.append({'file':str(path),'type':'bounds','spans':bad_spans})
    summaries.append({'file':str(path),'pages':len(doc),'checkedParagraphs':len(item['paragraphs']),'missing':len(missing),'boundsErrors':len(bad_spans)})
    if item['scenario']=='new-york-london' and item['kind']!='bundle':primary.append((item,doc))

thumb_dir=TMP/'contact-sheets';thumb_dir.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
for item,doc in primary:
    cols=6;thumb_w=160;thumb_h=256;cell_w=180;cell_h=282
    rows=(len(doc)+cols-1)//cols
    sheet=Image.new('RGB',(cols*cell_w,rows*cell_h),(220,220,220));draw=ImageDraw.Draw(sheet)
    for n,page in enumerate(doc):
        pix=page.get_pixmap(matrix=fitz.Matrix(.4,.4),alpha=False)
        image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
        x=(n%cols)*cell_w+10;y=(n//cols)*cell_h
        sheet.paste(image,(x,y));draw.text((x,y+258),f'{item["kind"]} / {n+1}',fill=(20,20,20),font=font)
    sheet.save(thumb_dir/(item['kind']+'.jpg'),quality=88)

(TMP/'validation.json').write_text(json.dumps({'files':summaries,'errors':errors},ensure_ascii=False,indent=2))
print(json.dumps({'files':len(summaries),'checkedParagraphs':sum(s['checkedParagraphs'] for s in summaries),'pages':sum(s['pages'] for s in summaries),'errors':len(errors),'firstErrors':errors[:12]},ensure_ascii=False))
if errors:raise SystemExit(1)
