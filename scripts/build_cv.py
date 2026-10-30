"""Build the focused, one-page public PDF and matching web CV from cv-content.json."""
from pathlib import Path
import json
import re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / 'assets/cv-content.json').read_text())
R = D['resume']
fontroot = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('CV', str(fontroot / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('CV-Bold', str(fontroot / 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('CV', normal='CV', bold='CV-Bold', italic='CV', boldItalic='CV-Bold')
ink, muted, accent = (HexColor(c) for c in ('#173e34', '#526f62', '#147650'))
styles = {
    'name': ParagraphStyle('name', fontName='CV-Bold', fontSize=20, leading=26, textColor=ink, spaceAfter=4),
    'title': ParagraphStyle('title', fontName='CV-Bold', fontSize=10, leading=14.5, textColor=accent, spaceAfter=5),
    'small': ParagraphStyle('small', fontName='CV', fontSize=8.5, leading=12, textColor=muted, spaceAfter=5),
    'h2': ParagraphStyle('h2', fontName='CV-Bold', fontSize=9.3, leading=14, textColor=accent, spaceBefore=12, spaceAfter=6, keepWithNext=True),
    'h3': ParagraphStyle('h3', fontName='CV-Bold', fontSize=9.7, leading=14, textColor=ink, spaceAfter=3, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='CV', fontSize=9.5, leading=13.8, textColor=ink, spaceAfter=5),
    'bullet': ParagraphStyle('bullet', fontName='CV', fontSize=9.5, leading=13.8, textColor=ink, leftIndent=9, firstLineIndent=-8, spaceAfter=4),
}

def e(text):
    return escape(text)

def p(text, kind='body'):
    return Paragraph(text, styles[kind])

def link(url, text):
    return f'<link href="{e(url)}" color="#147650">{e(text)}</link>'

out = ROOT / 'assets/CV_Josue_Manuel_Villarruel_Flores_2026_PUBLICO.pdf'
doc = SimpleDocTemplate(str(out), pagesize=A4, rightMargin=43, leftMargin=43, topMargin=36,
    bottomMargin=42, title='Josué Manuel Villarruel Flores - Soporte TI - Octubre 2026',
    author=D['name'], subject=R['headline'])
story = [p(e(D['name']), 'name'), p(e(R['headline']), 'title'),
    p(e(D['location']) + ' | ' + link(D['linkedin'], 'LinkedIn') + ' | ' +
      link(D['github'], 'GitHub') + ' | ' + link(D['portfolio'], 'Portafolio'), 'small'),
    HRFlowable(width='100%', thickness=.6, color=HexColor('#d4e5da'), spaceBefore=5, spaceAfter=0),
    p('PERFIL PROFESIONAL', 'h2'), p(e(R['summary'])),
    p('EXPERIENCIA PROFESIONAL', 'h2'), p(e(D['role']), 'h3'),
    p(e(D['period']) + ' | ' + e(D['site']), 'small')]
story += [p('- ' + e(text), 'bullet') for text in R['experience']]
story.append(p('COMPETENCIAS TÉCNICAS', 'h2'))
for name, text in R['skills']:
    story.append(p('<b>' + e(name) + ':</b> ' + e(text)))
story.append(p('PROYECTOS RELEVANTES', 'h2'))
for project in R['projects']:
    story.append(KeepTogether([
        p(link(D['portfolio'] + project['path'], project['name']) + ' <font size="8" color="#526f62">| ' + e(project['status']) + '</font>', 'h3'),
        p(e(project['summary'])), Spacer(1, 2)]))
story += [p('FORMACIÓN', 'h2'),
    p('<b>' + e(D['education']) + '</b><br/>' + e(D['education_status'])),
    p(e(R['courses']), 'small'), Spacer(1, 4),
    p('<b>Idiomas:</b> ' + e(D['languages'])),
    p('Más proyectos y casos de soporte: ' + link(D['portfolio'], 'descobt-stack.github.io/portfolio-josue/'), 'small')]

def frame(canvas, document):
    canvas.saveState()
    w, h = A4
    canvas.drawImage(str(ROOT / 'assets/jv-monogram-b.png'), w - 95, h - 74,
        width=49, height=30, preserveAspectRatio=True, mask='auto')
    canvas.setStrokeColor(HexColor('#d4e5da'))
    canvas.line(43, 33, w - 43, 33)
    canvas.setFont('CV', 7)
    canvas.setFillColor(muted)
    canvas.drawString(43, 21, 'Actualizado: 30 octubre 2026 | CV público')
    canvas.drawRightString(w - 43, 21, str(document.page))
    canvas.restoreState()

doc.build(story, onFirstPage=frame, onLaterPages=frame)
if doc.page != 1:
    raise RuntimeError(f'Expected one page, got {doc.page}; revise content before publishing.')
print(out)

# Keep the web CV and downloadable PDF in sync. Navigation is shared with the other pages.
web = ROOT / 'cv.html'
previous = web.read_text()
header = re.search(r'<header\b.*?</header>', previous, re.S).group()
footer = re.search(r'<footer\b.*?</footer>', previous, re.S).group()
pdf_url = 'assets/' + out.name + '?v=20261030-b'
bullets = ''.join('<li>' + e(text) + '</li>' for text in R['experience'])
skills = ''.join('<div class="sub"><h3>' + e(name) + '</h3><p>' + e(text) + '</p></div>' for name, text in R['skills'])
projects = ''.join('<article class="sub"><div class="eyebrow">' + e(item['status']) +
    '</div><h3>' + e(item['name']) + '</h3><p>' + e(item['summary']) +
    '</p><a class="textLink" href="' + e(item['path']) + '">Ver proyecto <span aria-hidden="true">↗</span></a></article>' for item in R['projects'])
web.write_text(f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f6faf7">
<meta name="description" content="CV de Josué Villarruel: soporte TI empresarial y automatización con PowerShell. Experiencia, formación y dos proyectos relevantes en una página.">
<title>CV · Josué Villarruel · Soporte TI</title>
<style>
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}body{{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.7}}a{{color:inherit;text-decoration:none}}.wrap{{width:min(960px,calc(100% - 40px));margin:auto}}.hero{{padding:155px 0 48px;text-align:center}}.eyebrow{{color:#147650;font-size:.7rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase}}h1{{font-size:clamp(2.5rem,6vw,4.7rem);line-height:1.08;letter-spacing:-.05em;margin:16px 0}}.hero p{{max-width:700px;margin:10px auto;color:#526f62}}.hero .lead{{font-size:1.1rem}}.actions{{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:25px}}.btn{{display:inline-flex;align-items:center;justify-content:center;padding:11px 19px;border:1px solid #c7dfd0}}.note{{font-size:.82rem}}.section{{padding:40px 0}}.card{{padding:28px;margin-bottom:20px;border:1px solid #d4e5da}}h2{{font-size:1.4rem;letter-spacing:-.025em;margin:0 0 14px}}h3{{font-size:1rem;margin:0 0 7px}}.card p{{color:#526f62;margin:0 0 10px}}.jobTop{{display:flex;gap:20px;justify-content:space-between;align-items:flex-start}}.jobTop .badge{{padding:6px 12px;flex-shrink:0;font-size:.75rem}}.jobTop p{{font-size:.9rem}}.card ul{{padding-left:19px;margin:18px 0 0}}.card li{{margin-bottom:10px;color:#526f62}}.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}.sub{{padding:20px;border:1px solid #d4e5da}}.sub .eyebrow{{margin-bottom:9px}}.textLink{{display:inline-block;margin-top:12px;font-size:.9rem;font-weight:650;color:#147650}}.textLink:hover{{text-decoration:underline}}.catalogLink{{margin:19px 0 0!important}}.educationMeta{{padding-top:14px;border-top:1px solid #d4e5da;margin-top:18px}}.footer{{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #d4e5da;padding:28px 0 40px;font-size:.8rem}}:focus-visible{{outline:3px solid #147650;outline-offset:4px}}@media(max-width:760px){{.wrap{{width:calc(100% - 28px)}}.grid2{{grid-template-columns:1fr}}.card{{padding:22px}}.hero{{padding-bottom:32px}}.jobTop{{display:block}}.jobTop .badge{{display:inline-block;margin:3px 0}}.footer{{display:block}}.footer>div+div{{margin-top:9px}}.actions .btn{{width:100%}}}}@media(prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}
</style>
<link rel="stylesheet" href="assets/site-theme.css"><link rel="stylesheet" href="assets/brand.css">
<link rel="icon" type="image/png" sizes="32x32" href="assets/jv-icon-b-32.png"><link rel="apple-touch-icon" sizes="180x180" href="assets/jv-icon-b-180.png">
<script src="assets/site.js" defer></script>
</head>
<body data-page-kind="cv">
{header}
<section class="hero"><div class="wrap"><div class="eyebrow">CURRÍCULUM · OCTUBRE 2026</div><h1>Josué Villarruel</h1><p class="lead">{e(R['headline'])}</p><p>{e(D['location'])}</p><div class="actions"><a class="btn primary" href="{pdf_url}" download>Descargar CV en PDF</a><a class="btn" href="cv-pdf.html">Ver PDF</a></div><p class="note">Una página · actualizado el {e(D['updated'])} · contacto mediante LinkedIn y GitHub.</p></div></section>
<main class="wrap section" id="contenido">
<section class="card"><h2>Perfil profesional</h2><p>{e(R['summary'])}</p></section>
<section class="card"><h2>Experiencia profesional</h2><div class="jobTop"><div><h3>{e(D['role'])}</h3><p>{e(D['site'])}</p></div><span class="badge">{e(D['period'])}</span></div><ul>{bullets}</ul></section>
<section class="card"><h2>Competencias técnicas</h2><div class="grid2">{skills}</div></section>
<section class="card"><h2>Proyectos relevantes</h2><div class="grid2">{projects}</div><p class="catalogLink"><a class="textLink" href="projects.html">Explorar todos los proyectos y su alcance <span aria-hidden="true">↗</span></a></p></section>
<section class="card"><h2>Formación e idiomas</h2><h3>{e(D['education'])}</h3><p>{e(D['education_status'])}</p><p>{e(R['courses'])}</p><div class="educationMeta"><p><strong>Idiomas:</strong> {e(D['languages'])}</p></div></section>
</main>
{footer}
</body>
</html>
''')
print(web)
