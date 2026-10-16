from pathlib import Path
from io import BytesIO
from copy import deepcopy
import argparse, hashlib, html, json, re, shutil, zipfile
import fitz
from PIL import Image as PILImage
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.utils import ImageReader
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, CondPageBreak, KeepTogether, Table, TableStyle, Flowable
from pypdf import PdfReader, PdfWriter

parser = argparse.ArgumentParser()
parser.add_argument('--content', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('--work-dir', required=True)
args = parser.parse_args()
REPO = Path(__file__).resolve().parents[1]
TMP = Path(args.work_dir).resolve()
OUT = Path(args.output).resolve()
TMP.mkdir(parents=True, exist_ok=True)
PACK = OUT / 'The-Fate-Key-Samples'
OUT.mkdir(parents=True, exist_ok=True)
PACK.mkdir(parents=True, exist_ok=True)
DATA = json.loads(Path(args.content).read_text())
FONT = Path('/opt/codex/runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/share/fonts/truetype')
for name, file in [('Body','NotoSans-Regular.ttf'),('BodyBold','NotoSans-Bold.ttf'),('BodyItalic','NotoSans-Italic.ttf'),('BodyBoldItalic','NotoSans-BoldItalic.ttf'),('Title','NotoSerif-Regular.ttf'),('TitleBold','NotoSerif-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / file)))
pdfmetrics.registerFont(TTFont('CJK', BytesIO(fitz.Font('cjk').buffer)))
pdfmetrics.registerFontFamily('Body', normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBoldItalic')
pdfmetrics.registerFontFamily('Title', normal='Title',bold='TitleBold',italic='Title',boldItalic='TitleBold')
W,H = 400,640
M,B,T = 32,44,58
CW,FH = W-2*M,H-B-T
NAVY = colors.HexColor('#0b2435')
GOLD = colors.HexColor('#a78045')
LIGHTGOLD = colors.HexColor('#ead1a1')
INK = colors.HexColor('#263442')
MUTED = colors.HexColor('#6b685f')
PAPER = colors.HexColor('#fffcf6')
CREAM = colors.HexColor('#f5eddc')
LINE = colors.HexColor('#ddccb0')
STYLES = {
    'body': ParagraphStyle('body',fontName='Body',fontSize=11.2,leading=15.8,textColor=INK,spaceAfter=7,allowWidows=0,allowOrphans=0),
    'lead': ParagraphStyle('lead',fontName='Body',fontSize=12.1,leading=17.5,textColor=NAVY,spaceAfter=11,allowWidows=0,allowOrphans=0),
    'h1': ParagraphStyle('h1',fontName='TitleBold',fontSize=22,leading=28,textColor=NAVY,spaceBefore=10,spaceAfter=14,keepWithNext=True),
    'h2': ParagraphStyle('h2',fontName='Title',fontSize=17.8,leading=23,textColor=NAVY,spaceBefore=15,spaceAfter=10,keepWithNext=True),
    'h3': ParagraphStyle('h3',fontName='BodyBold',fontSize=11.5,leading=16.2,textColor=NAVY,spaceBefore=12,spaceAfter=7,keepWithNext=True),
    'small': ParagraphStyle('small',fontName='Body',fontSize=9,leading=12.5,textColor=MUTED,spaceAfter=5,allowWidows=0,allowOrphans=0),
    'eyebrow': ParagraphStyle('eyebrow',fontName='BodyBold',fontSize=8,leading=11,textColor=GOLD,spaceBefore=3,spaceAfter=8,keepWithNext=True),
    'quote': ParagraphStyle('quote',fontName='Body',fontSize=12,leading=18,textColor=colors.white,spaceAfter=0),
    'box': ParagraphStyle('box',fontName='Body',fontSize=10.6,leading=15.7,textColor=INK,spaceAfter=6),
    'coverTitle': ParagraphStyle('coverTitle',fontName='Title',fontSize=29,leading=35,textColor=LIGHTGOLD),
    'coverLead': ParagraphStyle('coverLead',fontName='Body',fontSize=10.4,leading=15,textColor=colors.HexColor('#e5e4df')),
    'coverSmall': ParagraphStyle('coverSmall',fontName='Body',fontSize=8.6,leading=12,textColor=LIGHTGOLD),
    'coverBirth': ParagraphStyle('coverBirth',fontName='Body',fontSize=9.1,leading=13,textColor=colors.HexColor('#f5efe3')),
}

def plain(t):
    return str(t).replace('**','').translate(str.maketrans({c:'-' for c in '\u2010\u2011\u2012\u2013\u2014\u2015'})).replace('\u00a0',' ')

def markup(t):
    text=html.escape(plain(t))
    # Apply the site's authored emphasis without supporting arbitrary HTML.
    raw=str(t).translate(str.maketrans({c:'-' for c in '\u2010\u2011\u2012\u2013\u2014\u2015'})).replace('\u00a0',' ')
    parts=re.split(r'(\*\*[^*]+\*\*)',raw)
    text=''.join('<b>'+html.escape(p[2:-2])+'</b>' if p.startswith('**') and p.endswith('**') else html.escape(p) for p in parts)
    text=re.sub(r'([\u2190-\u21ff\u2e80-\u9fff\uac00-\ud7af]+)',r'<font name="CJK">\1</font>',text)
    return text.replace('\n','<br/>')

def draw_key(c,x,y,s=1):
    c.saveState();c.translate(x,y);c.scale(s,s);c.setStrokeColor(LIGHTGOLD);c.setLineWidth(1)
    c.circle(0,19,12,fill=0);c.circle(0,19,8.4,fill=0)
    p=c.beginPath();p.moveTo(0,26);p.lineTo(1.7,20.7);p.lineTo(7,19);p.lineTo(1.7,17.3);p.lineTo(0,12);p.lineTo(-1.7,17.3);p.lineTo(-7,19);p.lineTo(-1.7,20.7);p.close();c.drawPath(p)
    c.line(0,7,0,-20);c.line(3,6,3,-18);c.line(3,-8,11,-8);c.line(11,-8,11,-12);c.line(11,-12,5,-12);c.line(5,-15,11,-15);c.line(11,-15,11,-19);c.line(11,-19,3,-19)
    c.restoreState()

ASSET={'complete':'complete','year':'year','career':'career','compatibility':'compatibility','business':'business','wellbeing':'wellbeing','bundle':'bundle','free':'complete'}
NAMES={'free':'00-Free-Snapshot','year':'01-Year-Ahead-2027','career':'02-Career-and-Money','compatibility':'03-Love-Compatibility','complete':'04-Complete-Life-Reading','business':'05-Business-and-Entrepreneurship','wellbeing':'06-Everyday-Balance','bundle':'07-Complete-Bundle'}
ORDER=['free','year','career','compatibility','complete','business','wellbeing']
FOLDERS=['01-New-York-and-London','02-Seoul-and-Sydney','03-Birth-Time-Unknown']

class Cover(Flowable):
    def __init__(self,report,scenario):
        super().__init__();self.report=report;self.scenario=scenario;self.width=CW;self.height=FH-1
    def drawOn(self,c,x,y,_sW=0):
        r=self.report;c.saveState();c.setFillColor(NAVY);c.rect(0,0,W,H,stroke=0,fill=1)
        path=REPO / f'public/images/reports/{ASSET[r["kind"]]}-v1-1200.webp'
        image_bytes=BytesIO();PILImage.open(path).convert('RGB').save(image_bytes,format='JPEG',quality=88,optimize=True);image_bytes.seek(0)
        im=ImageReader(image_bytes);iw,ih=im.getSize();ah=225;scale=max(W/iw,ah/ih)
        c.saveState();p=c.beginPath();p.rect(0,H-ah,W,ah);c.clipPath(p,stroke=0,fill=0);c.drawImage(im,(W-iw*scale)/2,H-ah+(ah-ih*scale)/2,width=iw*scale,height=ih*scale);c.restoreState()
        c.setFillColor(NAVY);c.setFillAlpha(.8);c.rect(0,H-61,W,61,stroke=0,fill=1);c.setFillAlpha(1)
        draw_key(c,M+6,H-41,.65);c.setFillColor(LIGHTGOLD);c.setFont('BodyBold',13);c.drawString(M+30,H-29,'THE FATE KEY');c.setFont('Body',7.6);c.drawString(M+30,H-43,'ANCIENT WISDOM. MODERN INSIGHT.')
        yy=H-248
        c.setFillColor(LIGHTGOLD);c.setFont('BodyBold',8);c.drawString(M,yy,'FULL PUBLIC SAMPLE' if r['kind']!='free' else 'FREE SNAPSHOT SAMPLE')
        title=Paragraph(markup(r['title']),STYLES['coverTitle']);tw,th=title.wrap(CW,150);yy-=17+th;title.drawOn(c,M,yy)
        if r.get('headline'):
            lead=Paragraph(markup(r['headline']),STYLES['coverLead']);lw,lh=lead.wrap(CW,100);yy-=14+lh;lead.drawOn(c,M,yy)
        yy-=24
        c.setStrokeColor(GOLD);c.line(M,yy,W-M,yy);yy-=17
        for person in r.get('subjects',[]):
            label=person['label']
            if r['kind'] not in ('compatibility','bundle'):label='Example birth details'
            lab=Paragraph(markup(label),STYLES['coverSmall']);_,hh=lab.wrap(CW,40);yy-=hh;lab.drawOn(c,M,yy)
            desc=Paragraph(markup(person['birthSummary']),STYLES['coverBirth']);_,hh=desc.wrap(CW,65);yy-=hh+3;desc.drawOn(c,M,yy);yy-=10
        c.setFont('Body',8.1);c.setFillColor(LIGHTGOLD);c.drawString(M,66,f'EDITION {DATA["edition"]}  /  {DATA["exportedOn"].upper()}')
        note=Paragraph('Example birth details. No order or payment has been made.',STYLES['coverSmall']);_,hh=note.wrap(CW,35);note.drawOn(c,M,42-hh/2)
        c.restoreState()

class ElementBars(Flowable):
    def __init__(self,elements,total):
        super().__init__();self.width=CW;self.height=124;self.elements=elements;self.total=total
    def draw(self):
        c=self.canv;palette={'Wood':'#538775','Fire':'#b66351','Earth':'#b7974d','Metal':'#8295a2','Water':'#355d7c'}
        for i,item in enumerate(self.elements):
            y=108-i*21;c.setFont('Body',9.4);c.setFillColor(INK);c.drawString(0,y,item['element']);c.setFillColor(CREAM);c.roundRect(55,y-2,CW-88,10,5,stroke=0,fill=1)
            if item['count']:c.setFillColor(colors.HexColor(palette[item['element']]));c.roundRect(55,y-2,(CW-88)*item['count']/self.total,10,5,stroke=0,fill=1)
            c.setFillColor(INK);c.drawRightString(CW,y,str(item['count']))

class WritingLines(Flowable):
    def __init__(self):
        super().__init__(); self.width=CW; self.height=42
    def draw(self):
        self.canv.setStrokeColor(LINE); self.canv.setLineWidth(.5)
        for y in (30, 10): self.canv.line(0, y, CW, y)

class SampleDoc(BaseDocTemplate):
    def __init__(self,path,title,total_pages=None):
        super().__init__(path,pagesize=(W,H),leftMargin=M,rightMargin=M,topMargin=T,bottomMargin=B,title=title,author='The Fate Key',subject='Public example reading',pageCompression=1)
        self.shortTitle=title;self.outline_count=0;self.total_pages=total_pages
        frame=Frame(M,B,CW,FH,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0,id='main')
        self.addPageTemplates(PageTemplate(id='page',frames=[frame],onPage=self.page_art))
    def page_art(self,c,doc):
        if doc.page==1:return
        c.saveState();c.setFillColor(PAPER);c.rect(0,0,W,H,stroke=0,fill=1)
        c.setFont('BodyBold',8);c.setFillColor(GOLD);c.drawString(M,H-27,'THE FATE KEY')
        c.setFont('Body',7.7);c.setFillColor(MUTED);c.drawRightString(W-M,H-27,'PUBLIC SAMPLE')
        c.setStrokeColor(LINE);c.line(M,H-37,W-M,H-37);c.line(M,31,W-M,31)
        c.setFont('Body',7.3);c.setFillColor(MUTED);c.drawString(M,19,f'Personal reflection  |  Edition {DATA["edition"]}')
        if self.total_pages is not None:c.drawRightString(W-M,19,f'Report page {doc.page} of {self.total_pages}')
        c.restoreState()
    def afterFlowable(self,f):
        if hasattr(f,'bookmark'):
            self.canv.bookmarkPage(f.bookmark)
            self.canv.addOutlineEntry(f.outline,f.bookmark,level=0,closed=False)

def build_paginated(path,title,story):
    # A measurement pass keeps real page references intact for links/bookmarks.
    probe=BytesIO();measurement=SampleDoc(probe,title);measurement.build(deepcopy(story))
    SampleDoc(str(path),title,total_pages=measurement.page).build(story)

class Builder:
    def __init__(self,report,scenario,path):
        self.r=report;self.s=scenario;self.path=path;self.story=[];self.expected=[];self.book=0;self.sources=[];self.source_keys={}
    def p(self,text,style='body'):
        self.expected.append(plain(text));return Paragraph(markup(text),STYLES[style])
    def add(self,text,style='body'):self.story.append(self.p(text,style))
    def h(self,text):
        self.book+=1;p=self.p(text,'h1');p.bookmark=f'section-{self.book}';p.outline=plain(text);self.story.append(p)
    def note(self,items,label='From the chart'):
        if not items:return
        key=tuple(items)
        if key not in self.source_keys:
            self.sources.append((label, list(items)))
            self.source_keys[key]=len(self.sources)
        number=self.source_keys[key]
        title=f'Chart source note {number:02d}'
        self.expected.append(title)
        self.story.append(Paragraph('<link href="#chart-note-'+str(number)+'" color="#795b30">'+title+'</link>', STYLES['small']))
    def source_appendix(self):
        if not self.sources:return
        self.story.append(PageBreak());self.h('Chart source notes')
        self.add('These are the calculation references behind the reading. Repeated identical note groups appear once; the links in the chapters point here.','small')
        for number,(label,items) in enumerate(self.sources,1):
            self.story.append(CondPageBreak(70))
            title=f'Chart source note {number:02d}'
            heading=self.p(title,'h3');heading.bookmark='chart-note-'+str(number);heading.outline=title
            self.story.append(heading)
            for item in items:self.add(item,'small')
    def glossary(self):
        self.story.append(PageBreak());self.h('Chart terms in plain English')
        for item in DATA['glossary']:
            self.add(item['term'],'h3');self.add(item['meaning'],'small')
    def box(self,label,text,dark=False):
        paras=[self.p(label,'eyebrow' if not dark else 'coverSmall'),self.p(text,'box' if not dark else 'quote')]
        tb=Table([[paras]],colWidths=[CW],hAlign='LEFT')
        tb.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),NAVY if dark else CREAM),('BOX',(0,0),(-1,-1),.5,LINE),('LEFTPADDING',(0,0),(-1,-1),13),('RIGHTPADDING',(0,0),(-1,-1),13),('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),11)]))
        self.story.extend([tb,Spacer(1,11)])
    def guidance(self,g):
        self.add('Keep close','h3')
        for item in g['keepClose']:self.add('• '+item)
        self.add('Watch out for','h3')
        for item in g['watchFor']:self.add('• '+item)
    def example(self,item):
        self.add('An everyday example','h3');self.add(item['scene']);self.box('Words you could try',item['response']);self.add('Check what happens: '+item['check']);self.add(item['basis'],'small');self.note(item['facts'],'Example source facts')
    def chapter(self,ch,elements=None):
        self.story.append(CondPageBreak(180));self.h(ch['title']);self.add(ch['lead'],'lead')
        if ch.get('example'):self.example(ch['example'])
        for item in ch['paragraphs']:self.add(item)
        if elements:self.story.extend([ElementBars(*elements),Spacer(1,8)])
        self.guidance(ch['guidance']);self.box('A small step to try',ch['tryThis']);self.note(ch['evidence'])
    def application(self,a,index):
        self.story.append(CondPageBreak(200));self.add(f'PRACTICAL SITUATION {index:02d}','eyebrow');self.h(a['title']);self.add(a['scope'],'small');self.add(a['scene']);self.box('The question to work through',a['question'])
        self.add('How your chart themes connect with this choice','h2')
        for theme in a['pattern']['themes']:self.add(theme['label'],'h3');self.add(theme['text'],'lead')
        for text in a['pattern']['connections']:self.add(text)
        self.box('Your personal check',a['pattern']['question'])
        self.add('Two approaches to compare','h2')
        for letter,ch in zip('AB',a['choices']):
            self.add(letter+' · '+ch['title'],'h3');self.add('**May fit when:** '+ch['when']);self.add('**The trade-off:** '+ch['tradeoff'])
        self.box('Words you could use',a['say'],dark=True)
        self.add('A small plan to try','h2')
        for n,step in enumerate(a['steps'],1):self.add(f'{n}. {step}')
        self.add('Three facts to write down','h2')
        for question in a['record']:self.add(question,'h3');self.story.append(WritingLines())
        self.add('How to judge what happened','h2');self.add('**Keep going when:** '+a['keep']);self.add('**Adjust the approach when:** '+a['adjust'])
        self.add('When this exercise may not fit','h3');self.add(a['doesNotFit'])
        self.note(a['pattern']['facts'],'Where these reflection themes come from')
    def extras(self,e):
        self.story.append(CondPageBreak(180));self.h('Your Everyday Compass')
        for q in e['questions']:self.add(q['question'],'h2');self.add(q['answer']);self.add('Why this appears here: '+q['basis'],'small')
        for title,key in [('What to keep close','keepClose'),('What to step back from','stepBack')]:
            self.add(title,'h2')
            for item in e[key]:self.add(item['title'],'h3');self.add(item['text'])
        self.add('Traditional colors and number pairs','h2')
        for sym in e['symbols']:
            self.add(sym['person'],'h3');self.add(sym['element']+' birth-day element','lead')
            self.add('Colors: '+', '.join(color['name'] for color in sym['colors']))
            cells=[]
            for color in sym['colors']:
                cells.append(self.p(color['name'],'small'))
            swatches=Table([['' for _ in sym['colors']],cells],colWidths=[CW/len(cells)]*len(cells),rowHeights=[15,None])
            style=[('BOX',(0,0),(-1,0),.5,LINE),('LEFTPADDING',(0,1),(-1,1),0)]
            for n,col in enumerate(sym['colors']):style.append(('BACKGROUND',(n,0),(n,0),colors.HexColor(col['hex'])))
            swatches.setStyle(TableStyle(style));self.story.extend([swatches,Spacer(1,8)])
            self.add('Number pair: '+' · '.join(map(str,sym['numbers'])),'lead');self.add(sym['use']);self.add(sym['basis'],'small')
        self.add(DATA['symbolNote'],'small');self.box('A reminder to keep',e['reminder'],dark=True)
        self.add(e['experiment']['title'],'h2')
        for n,step in enumerate(e['experiment']['steps'],1):self.add(f'{n}. {step}')
        self.note(e['evidence']);self.add('Traditional symbol references','h3')
        for source in DATA['symbolSources']:
            self.expected.extend([plain(source['label']),source['url']])
            self.story.append(Paragraph(markup(source['label'])+'<br/><link href="'+html.escape(source['url'],quote=True)+'" color="#795b30">'+markup(source['url'])+'</link>',STYLES['small']))
    def record(self):
        self.story.append(CondPageBreak(180));self.h('Reading record')
        self.add('Public sample prepared from example birth details. No order or payment has been made.')
        self.add('Report edition: '+DATA['edition']);self.add('Prepared on: '+DATA['exportedOn']);self.add('Reference year: '+str(self.r['referenceYear']))
        self.add('Sample scenario: '+self.s['label']);self.add('This file contains the English wording generated by the site, presented in a reading layout. Interactive tabs and collapsed source notes are expanded for offline reading.','small')
        for person in self.r['subjects']:
            self.add(person['label'],'h3');self.add(person['birthSummary']);self.add(' · '.join(person['pillarSummary']));self.add('Starting symbol: '+person['dayMaster'],'small')
            basis=person['calculation']
            self.add('Traditional cycle setting: '+basis['cycleSetting']+'; ten-year cycle direction: '+basis['cycleDirection']+'.')
            self.add('Recorded local clock: '+basis['enteredClock']+'.')
            self.add('Calculation clock: '+basis['effectiveClock']+'.')
            self.add('Clock adjustment: '+basis['correction']+'.')
            if basis.get('boundaryNote'):self.add(basis['boundaryNote'],'small')
            if len(self.r['subjects'])>1 or self.r['kind']=='free':
                for note in basis['notes']:self.add(note,'small')
    def build(self):
        r=self.r;self.story.extend([Cover(r,self.s),PageBreak()]);self.h('Before you begin')
        self.add('PUBLIC SAMPLE · EXAMPLE BIRTH DETAILS','eyebrow')
        self.add('This is a complete public example, not a report issued after payment.' if r['kind']!='free' else 'This is the free snapshot shown after entering birth details, prepared here with example inputs.')
        self.add('Sample: '+self.s['label'],'small')
        for person in r['subjects']:
            if person['calculation'].get('boundaryNote'):self.box(person['label']+' - hour-boundary note', person['calculation']['boundaryNote'])
        if any(p['input'].get('unknownTime') for p in r['subjects']):self.box('Birth time unknown','The hour pillar and every hour comparison are excluded. Ten-year starting dates remain approximate.')
        if r['kind']=='year':self.add('Year Ahead: 2027. The file uses the site’s default selected year. Each month uses its stated reference point, not an event forecast for the full calendar month.')
        if r.get('scope'):self.add(r['scope'],'small')
        if r['kind']=='free':
            self.add(r['headline'],'h2')
            for text in r['paragraphs']:self.add(text)
            self.guidance(r['guidance']);self.note(r['evidence'])
            self.add('Your work theme','h2');self.add(r['workNote']);self.box('A small step to try',r['tryThis'])
            self.add(r['relationship']['title'],'h2');self.add(r['relationship']['lead'],'lead')
            for text in r['relationship']['paragraphs']:self.add(text)
            self.add(DATA['copy']['preview.free.note'],'small');self.note(r['relationship']['evidence'])
            self.add('Your five-element picture','h2');self.story.append(ElementBars(r['elements'],r['visibleMarkers']));self.add('A simple count of visible symbols. A zero is not a missing ability, and this count is not a diagnosis of useful elements.','small')
        else:
            self.add('Inside this example','h2')
            for title in [ch['title'] for ch in r['chapters']]:self.add(title,'small')
            if r.get('periods'):self.add('08 · Your Life Chapters','small')
            if r.get('actionPlan'):self.add(r['actionPlan']['title'],'small')
            if r.get('months'):self.add('Your twelve monthly reflections','small')
            self.add('Also included: practical situation guides, chart-source notes, your Everyday Compass and preparation notes.','small')
            self.story.append(PageBreak());self.h('Start with one small step');brief=r['brief'];self.guidance({'keepClose':brief['support'],'watchFor':brief['watchFor']});self.box('A first step to try',brief['action']);self.add('From the chapter: '+brief['chapterTitle'],'small')
            self.add('Your chart themes at a glance','h2')
            for item in r['summary']:self.add(item['label'],'h3');self.add(item['text'])
            for person in r['subjects']:
                self.add(person['label'],'h3');self.add(person['birthSummary'],'small');self.add(' · '.join(person['pillarSummary']));self.add('Starting symbol: '+person['dayMaster'],'small')
            self.add('Apply your reading to a real situation','h2');self.add('Choose the situation closest to yours. These are hypothetical guides, not events inferred from your birth details. All three guides are included; use the choices where they fit your actual circumstances.')
            for n,a in enumerate(r['applications'],1):self.application(a,n)
            if r.get('connections'):
                self.story.append(CondPageBreak(180));self.h('How the chart themes work together')
                for cn in r['connections']:self.add(cn['title'],'h2');self.add(cn['basis'],'small');self.add(cn['text']);self.box('A question to ask',cn['question']);self.note(cn['evidence'])
            for ch in r['chapters']:
                elems=None
                if ch['id'] in ('balance','visible-elements'):
                    person=r['subjects'][0];elems=(person['elements'],person['visibleMarkers'])
                self.chapter(ch,elems)
            if r.get('periods'):
                self.story.append(CondPageBreak(180));self.h('08 · Your Life Chapters');self.add(DATA['copy']['reading.complete.timelineNote'])
                for period in r['periods']:
                    self.add(period['period'],'eyebrow');self.add(period['headline'],'h2')
                    for text in period['paragraphs']:self.add(text)
                    self.guidance(period['guidance']);self.box('A small step to try',period['tryThis']);self.note(period['evidence'])
            if r.get('actionPlan'):self.chapter(r['actionPlan'])
            if r.get('months'):
                self.story.append(CondPageBreak(180));self.h('Your twelve monthly reflections');self.add(DATA['copy']['category.months.intro'])
                for month in r['months']:
                    self.chapter(month);self.add('Reference: '+month['referenceDate']+' · '+month['pillar']+' · Year pillar '+month['yearPillar'],'small')
            self.extras(r['extras']);self.story.append(CondPageBreak(180));self.h('How this reading is prepared')
            for note in r['methodNotes']:self.add(note)
        self.record();self.glossary();self.source_appendix();build_paginated(self.path,r['title'],self.story)
        return {'path':str(self.path),'kind':r['kind'],'scenario':self.s['id'],'pages':len(PdfReader(str(self.path)).pages),'paragraphs':self.expected}

def free_text(r):
    lines=[r['title'],r['birthSummary'],r['headline'],*r['paragraphs'],r['workNote'],'Keep close:',*r['guidance']['keepClose'],'Watch out for:',*r['guidance']['watchFor'],'A small step to try: '+r['tryThis'],*r['evidence'],r['relationship']['title'],r['relationship']['lead'],*r['relationship']['paragraphs'],*r['relationship']['evidence'],*r['pillarSummary']]
    lines+=list(r['subjects'][0]['calculation']['notes'])
    lines+=['Five-element visible counts: '+', '.join(f'{e["element"]} {e["count"]}' for e in r['elements'])]
    return '\n\n'.join(plain(t) for t in lines)

def merge_pdfs(path,parts,title):
    writer=PdfWriter();writer.add_metadata({'/Title':title,'/Author':'The Fate Key','/Subject':'Public sample collection; example birth details'})
    for label,part in parts:writer.append(str(part),outline_item=label,import_outline=True)
    if hasattr(writer,'compress_identical_objects'):writer.compress_identical_objects(remove_identicals=True,remove_orphans=True)
    with path.open('wb') as stream:writer.write(stream)

def intro_pdf(path,title,scenario,bundle=False):
    report={'kind':'bundle' if bundle else 'complete','title':title,'subjects':[],'headline':'A collection of public examples. Read, compare and keep the ideas that fit your real circumstances.'}
    story=[Cover(report,scenario),PageBreak(),Paragraph(markup('About this collection'),STYLES['h1'])]
    notes=['All readings are public examples, prepared from example birth details. No order or payment has been made.',f'Prepared on {DATA["exportedOn"]}. Report edition {DATA["edition"]}.',f'Sample scenario: {scenario["label"]}.']
    if bundle:notes+=['Complete Life Reading and 2027 Year Ahead are about Person A. Love Compatibility compares Person A and Person B.','The bundle contains the same three report texts as their individual sample files.']
    else:notes+=['This file contains the default New York example: the free snapshot and all six report categories.','Additional Seoul/Sydney and unknown-time examples are in the ZIP. The bundle has its own PDF in each example folder; its three readings are already included here individually.','Use the PDF bookmarks to jump to a report or section. The footer labels Report page refer to each individual report. All situation guides and chart-source notes are included, with technical references collected at the end of each report.']
    notes+=[DATA['copy']['reading.footer.note']]
    for note in notes:story.append(Paragraph(markup(note),STYLES['body']))
    build_paginated(path,title,story)

manifest=[];primary=[]
for scenario in DATA['samples']:
    folder=PACK/FOLDERS[scenario['index']];pdf_dir=folder/'PDF';txt_dir=folder/'TXT';pdf_dir.mkdir(parents=True,exist_ok=True);txt_dir.mkdir(parents=True,exist_ok=True)
    by_kind={r['kind']:r for r in scenario['reports']};paths={}
    for kind in ORDER:
        r=by_kind[kind];path=pdf_dir/(NAMES[kind]+'.pdf');result=Builder(r,scenario,path).build();manifest.append(result);paths[kind]=path
        source=free_text(r) if kind=='free' else r['fullText']
        source+='\n\nChart terms in plain English\n\n'+'\n\n'.join(item['term']+': '+item['meaning'] for item in DATA['glossary'])
        (txt_dir/(NAMES[kind]+'.txt')).write_text('THE FATE KEY · PUBLIC SAMPLE\n'+scenario['label']+'\nPrepared on '+DATA['exportedOn']+'\nExample birth details. No order or payment has been made.\n\n'+source+'\n',encoding='utf-8')
        print(json.dumps({k:v for k,v in result.items() if k!='paragraphs'}),flush=True)
        if scenario['index']==0:primary.append((r['title'],path))
    intro=TMP/('bundle-intro-'+scenario['id']+'.pdf');intro_pdf(intro,'Complete Bundle',scenario,True)
    bundle_path=pdf_dir/(NAMES['bundle']+'.pdf');merge_pdfs(bundle_path,[('Bundle guide',intro),(by_kind['complete']['title'],paths['complete']),(by_kind['compatibility']['title'],paths['compatibility']),(by_kind['year']['title'],paths['year'])],'The Fate Key · Complete Bundle · '+scenario['label'])
    (txt_dir/(NAMES['bundle']+'.txt')).write_text('PUBLIC SAMPLE · '+scenario['label']+'\n\n'+scenario['bundle']['fullText']+'\n',encoding='utf-8')
    manifest.append({'path':str(bundle_path),'kind':'bundle','scenario':scenario['id'],'pages':len(PdfReader(str(bundle_path)).pages),'paragraphs':[]})

intro=TMP/'collection-intro.pdf';intro_pdf(intro,'All Category Samples',DATA['samples'][0])
combined=OUT/'The-Fate-Key-All-Category-Samples.pdf';merge_pdfs(combined,[('Collection guide',intro),*primary],'The Fate Key · All Category Samples')
guide='''THE FATE KEY - 전체 샘플 파일 안내
기준일: 2026년 10월 16일

처음에는 01-New-York-and-London 폴더를 보세요.
각 예시 폴더에 PDF 8개와 복사하기 편한 영어 TXT 8개가 있습니다.

00-Free-Snapshot: 무료 요약 샘플
01-Year-Ahead-2027: 2027년 연간 리포트
02-Career-and-Money: 직업과 돈
03-Love-Compatibility: 연애와 궁합
04-Complete-Life-Reading: 종합 리포트
05-Business-and-Entrepreneurship: 사업과 창업
06-Everyday-Balance: 일상 균형
07-Complete-Bundle: 종합 + 궁합 + 2027년 연간 리포트 묶음

예시 1: 뉴욕 1998년 3월 25일 03:00 / 궁합 상대 런던 2000년 8월 18일 14:30
예시 2: 서울 1987년 11월 5일 09:15 / 궁합 상대 시드니 1992년 4월 12일 21:40
예시 3: 예시 1과 같은 생일이지만 출생시간을 모르는 경우

총 PDF 24개와 영어 TXT 24개입니다. 각 예시에 무료 요약 1개, 개별 리포트 6개, 번들 1개가 있습니다.
연간 리포트는 사이트 기본 선택인 2027년입니다. 다른 일반 리포트의 기준 연도는 2026년입니다.
번들에서 종합과 연간 리포트는 첫 번째 사람(Person A)을, 궁합은 두 사람 모두를 다룹니다.
홈에서 보여 주는 짧은 발췌문은 종합 리포트 본문에도 포함돼 있습니다.
추가로 The-Fate-Key-All-Category-Samples.pdf에 기본 예시의 무료 요약과 개별 6종을 합쳐 두었습니다.
번들은 개별 3종을 합친 상품이므로 통합본에 같은 본문을 한 번 더 넣지는 않았습니다.

본문은 현재 사이트와 같은 영어입니다. 모든 상황별 실천 안내, 원문 장, 연간 월별 내용, 출처, 색상·숫자와 작성 방법을 포함합니다.
인쇄·휴대폰 열람에 맞춰 파일 디자인을 새로 정리했기 때문에 웹 화면과 페이지 배치는 다릅니다.
이 파일들은 예시 출생정보로 만든 공개 샘플입니다. 실제 결제 후 발급된 고객 리포트가 아닙니다.
개인화된 미리보기는 실제 입력값에 따라 달라지므로 이 파일 모음은 미리 정해 둔 공개 예시를 담았습니다.
'''
(PACK/'00-먼저읽기.txt').write_text(guide,encoding='utf-8')
(TMP/'export-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'individualPDFs':len(manifest),'combinedPages':len(PdfReader(str(combined)).pages),'combined':str(combined)}),flush=True)

zip_path=OUT.parent/'The-Fate-Key-All-Samples.zip'
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(PACK.rglob('*')):
        if path.is_file():archive.write(path,path.relative_to(PACK.parent))
print(json.dumps({'zip':str(zip_path),'bytes':zip_path.stat().st_size}),flush=True)
