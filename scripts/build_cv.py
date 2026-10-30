"""Generate the public two-page CV from assets/cv-content.json (requires reportlab)."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'assets/cv-content.json').read_text())
fontroot=Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('CV',str(fontroot/'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('CV-Bold',str(fontroot/'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('CV',normal='CV',bold='CV-Bold',italic='CV',boldItalic='CV-Bold')
ink=HexColor('#173e34'); muted=HexColor('#526f62'); accent=HexColor('#147650')
styles={
 'name':ParagraphStyle('name',fontName='CV-Bold',fontSize=22,leading=27,textColor=ink,spaceAfter=7),
 'title':ParagraphStyle('title',fontName='CV-Bold',fontSize=10.5,leading=15,textColor=accent,spaceAfter=5),
 'small':ParagraphStyle('small',fontName='CV',fontSize=8,leading=12,textColor=muted,spaceAfter=7),
 'h2':ParagraphStyle('h2',fontName='CV-Bold',fontSize=10.5,leading=15,textColor=accent,spaceBefore=12,spaceAfter=6),
 'h3':ParagraphStyle('h3',fontName='CV-Bold',fontSize=10.2,leading=14,textColor=ink,spaceAfter=4),
 'body':ParagraphStyle('body',fontName='CV',fontSize=9.2,leading=13.4,textColor=ink,spaceAfter=6),
 'bullet':ParagraphStyle('bullet',fontName='CV',fontSize=9.2,leading=13.4,textColor=ink,leftIndent=10,firstLineIndent=-8,spaceAfter=5),
}
def p(text,kind='body'):
 if kind=='name':
  text=f'<img src="{ROOT / "assets/jv-monogram.png"}" width="45" height="27" valign="middle"/> &#160; '+text
 return Paragraph(text,styles[kind])
def e(text):return escape(text)
def link(url,text):return f'<link href="{url}" color="#147650">{e(text)}</link>'
out=ROOT/'assets/CV_Josue_Manuel_Villarruel_Flores_2026_PUBLICO.pdf'
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=36,bottomMargin=42,title='Josué Manuel Villarruel Flores - CV - Octubre 2026',author=D['name'],subject=D['headline'])
story=[p(e(D['name']),'name'),p(e(D['headline']),'title'),p(e(D['location'])+' | '+link(D['portfolio'],'Portafolio')+' | '+link(D['linkedin'],'LinkedIn')+' | '+link(D['github'],'GitHub'),'small')]
story += [p('PERFIL PROFESIONAL','h2'),p(e(D['summary']))]
story += [p('EXPERIENCIA PROFESIONAL','h2'),p(e(D['role']),'h3'),p(e(D['period'])+' | '+e(D['site']),'small')]
story += [p('- '+e(x),'bullet') for x in D['experience']]
story += [p('COMPETENCIAS TÉCNICAS','h2')]
for name,text in D['skills']:
 story.append(p('<b>'+e(name)+':</b> '+e(text)))
story += [p('FORMACIÓN Y CURSOS','h2'),p('<b>'+e(D['education'])+'</b><br/>'+e(D['education_status']))]
story += [p('<br/>'.join(e(x) for x in D['courses']),'small')]
story += [p('IDIOMAS','h2'),p(e(D['languages']))]
story += [PageBreak(),p('Proyectos seleccionados','name'),p('Desarrollo propio · aplicaciones · automatización','title'),p('Josué Manuel Villarruel Flores | '+link(D['portfolio']+'projects.html','Catálogo y casos de estudio'),'small')]
for project in D['projects']:
 block=[p(e(project['name']),'h2'),p(e(project['tag'])+' | '+e(project['status']),'small'),p(e(project['summary'])),p(link(D['portfolio']+project['path'],'Ver proyecto y alcance'),'small'),Spacer(1,2)]
 story.append(KeepTogether(block))
def footer(canvas,doc):
 canvas.saveState();w,h=A4
 canvas.setStrokeColor(HexColor('#cedddf'));canvas.line(43,33,w-43,33)
 canvas.setFont('CV',7);canvas.setFillColor(muted)
 canvas.drawString(43,21,'Actualizado: 30 octubre 2026 | CV público')
 canvas.drawRightString(w-43,21,f'{doc.page} / 2')
 canvas.restoreState()
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(out)
