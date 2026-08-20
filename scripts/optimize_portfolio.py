from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')


def replace_between(text, start, end, replacement, label):
    pattern = re.escape(start) + r'.*?(?=' + re.escape(end) + r')'
    updated, count = re.subn(pattern, lambda _: replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'No se pudo actualizar: {label}')
    return updated


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'No se encontró: {label}')
    return text.replace(old, new, 1)


text = replace_once(
    text,
    '<meta name="description" content="Portafolio TI de Josue Manuel Villarruel Flores: software, automatización, soporte IT, hardware y proyectos de desarrollo.">',
    '<meta name="description" content="Portafolio profesional de Josue Manuel Villarruel Flores: Technical Support Engineer, Application Support, IT Automation, Windows, Microsoft 365, ServiceNow y PowerShell.">',
    'meta description'
)
text = replace_once(
    text,
    '<title>Josue Villarruel | Ingeniería en Computación y Soporte TI</title>',
    '<title>Josue Villarruel | Technical Support Engineer · Application Support · IT Automation</title>',
    'title'
)
text = replace_once(
    text,
    '<div class="links" id="navLinks"><a href="#sobre-mi">Sobre mí</a><a href="#recorrido">Recorrido</a><a href="#proyectos">Proyectos</a><a href="equipo.html">Grupo de trabajo</a><a href="#it">Experiencia</a><a href="#tecnologias">Tecnologías</a><a href="cv.html">CV</a><a href="#contacto">Contacto</a></div>',
    '<div class="links" id="navLinks"><a href="#sobre-mi">Perfil</a><a href="#recorrido">Trayectoria</a><a href="#proyectos">Proyectos</a><a href="equipo.html">Grupo de trabajo</a><a href="#it">Experiencia IT</a><a href="#tecnologias">Tecnologías</a><a href="cv.html">CV</a><a href="#contacto">Contacto</a></div>',
    'navegación'
)

hero = '''<section class="hero" id="inicio"><div class="wrap heroGrid"><div><div class="availability"><i></i> Axtel · Soporte TI en sitio</div><div class="availabilitySub">Fábrica La Rojeña, Tequila, Jalisco · Desde <time datetime="2026-03-02">02 mar 2026</time> · <span data-work-duration></span></div><div class="eyebrow" style="margin-top:18px">TECHNICAL SUPPORT ENGINEER · APPLICATION SUPPORT · IT AUTOMATION</div><h1>Soporte técnico,<br>automatización<br>y software.</h1><div class="heroRole">Ingeniería en Computación · Windows · Microsoft 365 · ServiceNow · PowerShell</div><div class="heroClaim">Diagnostico incidentes, automatizo tareas y desarrollo herramientas para resolver necesidades técnicas reales.</div><p>Trabajo con soporte empresarial, sistemas Windows, Microsoft 365, Active Directory, hardware y automatización. En este portafolio presento proyectos, casos técnicos y evidencia seleccionada de mi trabajo.</p><div class="actions"><a class="btn primary" href="#proyectos">Ver proyectos</a><a class="btn ghost" href="cv.html">Ver mi CV</a><a class="btn ghost" href="equipo.html">Grupo de trabajo</a><a class="btn ghost" href="#contacto">Contactarme</a></div><div class="note">🔒 Mantengo privadas las demos y el código fuente completo; publico únicamente casos, evidencia y fragmentos seleccionados.</div></div><aside class="summary"><div class="tag">Perfil técnico</div><h3>Support Engineering + Automation</h3><div class="mini"><div><b>Incidentes</b><span>ServiceNow · diagnóstico · seguimiento</span></div><div><b>98%</b><span>Efectividad reportada</span></div><div><b>Automation</b><span>PowerShell · BAT</span></div><div><b>Systems</b><span>Windows · M365 · AD</span></div></div></aside></div></section>
'''
text = replace_between(text, '<section class="hero" id="inicio">', '<main>', hero, 'hero')

about = '''<section class="wrap section" id="sobre-mi"><div class="head"><span>01</span><div><h2>Perfil profesional</h2><p>Combino soporte técnico, automatización y desarrollo para resolver necesidades operativas y convertirlas en soluciones claras y documentadas.</p></div></div><div class="aboutGrid"><div class="aboutMain"><div class="tag">Enfoque técnico</div><h3 style="font-size:1.75rem;margin:10px 0 12px">Diagnóstico, automatización y desarrollo.</h3><p>Soy egresado de <strong>Ingeniería en Computación</strong>. Mi perfil integra soporte empresarial, sistemas Windows, Microsoft 365, hardware, automatización y desarrollo de software.</p><p>En soporte gestiono incidencias, analizo causa e impacto, documento evidencia y valido la operación. En proyectos propios diseño herramientas y aplicaciones que convierten una necesidad concreta en una solución funcional.</p></div><div class="aboutCards"><div class="aboutCard"><h3>Diagnóstico técnico</h3><p>Analizo síntomas, causa, impacto y evidencia antes de aplicar cambios.</p></div><div class="aboutCard"><h3>Automatización</h3><p>Uso PowerShell y BAT para diagnóstico, inventario, mantenimiento y tareas repetitivas.</p></div><div class="aboutCard"><h3>Soporte empresarial</h3><p>Trabajo con Windows, Microsoft 365, ServiceNow, Active Directory, seguridad y hardware.</p></div></div></div></section>
'''
text = replace_between(text, '<section class="wrap section" id="sobre-mi">', '<section class="wrap section" id="recorrido">', about, 'perfil profesional')

text = replace_once(
    text,
    '<section class="wrap section" id="recorrido"><div class="head"><span>02</span><div><h2>Mi recorrido</h2><p>Este es el camino que he ido construyendo entre formación, práctica, soporte TI y proyectos propios. No quiero resumirlo solo en una lista de tecnologías: prefiero mostrar cómo las fui incorporando.</p></div></div>',
    '<section class="wrap section" id="recorrido"><div class="head"><span>02</span><div><h2>Trayectoria</h2><p>Mi trayectoria integra formación en Ingeniería en Computación, soporte TI y desarrollo de proyectos propios.</p></div></div>',
    'encabezado trayectoria'
)
text = replace_once(
    text,
    '<div class="timelineYear">Actualidad</div><div class="timelinePoint"><i></i></div><div class="timelineCard current"><h3>Soporte TI en Axtel + desarrollo de proyectos propios</h3><p>Actualmente trabajo en Axtel brindando soporte TI en sitio para cliente Cuervo. Al mismo tiempo sigo desarrollando herramientas y aplicaciones propias para practicar automatización, software, producto y resolución de problemas.</p>',
    '<div class="timelineYear">2026</div><div class="timelinePoint"><i></i></div><div class="timelineCard current"><h3>Soporte TI en Axtel + automatización y proyectos propios</h3><p>Trabajo en Axtel brindando soporte TI en sitio para cliente Cuervo y desarrollo herramientas propias orientadas a automatización, software y resolución de problemas.</p>',
    'trayectoria actual'
)
text = re.sub(r'<div class="timelineNote">.*?</div>', '', text, count=1, flags=re.S)

text = replace_once(
    text,
    '<section class="wrap section" id="proyectos"><div class="head"><span>03</span><div><h2>Proyectos</h2><p>Aquí reúno los proyectos donde mejor puedo mostrar cómo pienso, cómo construyo soluciones y cómo las voy mejorando con pruebas, versiones y experiencia real.</p></div></div><div style="margin:0 0 18px"><div class="tag">Proyectos principales</div><h3 style="font-size:1.35rem;margin:6px 0 4px">Lo que estoy desarrollando y probando activamente</h3><p style="color:var(--muted);margin:0;max-width:820px">Estos son los proyectos que mejor representan mi trabajo actual en software, automatización y producto.</p></div>',
    '<section class="wrap section" id="proyectos"><div class="head"><span>03</span><div><h2>Proyectos</h2><p>Selecciono proyectos que muestran software, automatización, accesibilidad y resolución de problemas mediante entregables funcionales.</p></div></div><div style="margin:0 0 18px"><div class="tag">Proyectos principales</div><h3 style="font-size:1.35rem;margin:6px 0 4px">Desarrollo activo</h3><p style="color:var(--muted);margin:0;max-width:820px">Cuatro proyectos concentran el trabajo que desarrollo y pruebo actualmente.</p></div>',
    'encabezado proyectos'
)
text = replace_once(
    text,
    'Aquí reúno scripts que he creado para inventario, diagnóstico, reportes, reparación y análisis de equipos Windows.',
    'Desarrollo scripts para inventario, diagnóstico, reportes, reparación y análisis de equipos Windows.',
    'automation lab presente'
)

experience = '''<section class="wrap section" id="it"><div class="head"><span>04</span><div><h2>Experiencia IT</h2><p>Gestiono incidentes, diagnóstico y soporte de usuarios y equipos en un entorno corporativo, con documentación y escalamiento basado en evidencia.</p></div></div><div class="currentRole"><div class="currentRoleTop"><div><div class="tag">Experiencia actual</div><h3>Axtel · Soporte TI en sitio para cliente Cuervo</h3><p>Brindo soporte TI en sitio en Fábrica La Rojeña, Tequila, Jalisco. Gestiono incidentes y solicitudes mediante ServiceNow; diagnostico Windows 10/11, hardware, conectividad, Microsoft 365, Active Directory y herramientas corporativas. Documento resoluciones, valido operación y escalo con evidencia técnica cuando el caso requiere otra área.</p></div><span class="currentRoleBadge">Desde <time datetime="2026-03-02">02 mar 2026</time> · <span data-work-duration></span></span></div><div class="tools"><span class="pill">ServiceNow</span><span class="pill">Windows 10/11</span><span class="pill">Microsoft 365</span><span class="pill">Active Directory</span><span class="pill">PowerShell</span><span class="pill">Hardware</span></div></div><div class="metrics"><div class="metric"><strong>98%</strong><span>Efectividad reportada</span></div><div class="metric"><strong>ServiceNow</strong><span>Incident management y seguimiento</span></div><div class="metric"><strong>PS + BAT</strong><span>Automatización y diagnóstico</span></div></div><div class="actions"><a class="btn accent" href="projects/it-support.html">Ver experiencia técnica →</a></div></section>
'''
text = replace_between(text, '<section class="wrap section" id="it">', '<section class="wrap section" id="tecnologias">', experience, 'experiencia IT')

replacements = [
    ('<h2>Tecnologías que he usado</h2><p>Prefiero relacionar cada herramienta con algo que realmente he construido, estudiado o utilizado en soporte. En la portada muestro las áreas principales y dejo el detalle completo disponible para quien quiera profundizar.</p>', '<h2>Tecnologías que utilizo</h2><p>Organizo las herramientas por aplicación real: desarrollo, automatización, soporte y sistemas. El detalle completo queda disponible sin saturar la portada.</p>'),
    ('<div class="tag">Dónde lo he aplicado</div>', '<div class="tag">Dónde las aplico</div>'),
    ('<p>He combinado frontend, almacenamiento local y servicios auxiliares para construir aplicaciones que puedan crecer por versiones.</p>', '<p>Combino frontend, almacenamiento local y servicios auxiliares para construir aplicaciones que crecen por versiones.</p>'),
    ('Los he aplicado en aplicaciones, prototipos, lógica de negocio, interfaces web y formación académica.', 'Los aplico en aplicaciones, prototipos, lógica de negocio, interfaces web y formación académica.'),
    ('Los he utilizado en automatización IT, diagnóstico de Windows y persistencia local de aplicaciones.', 'Los utilizo en automatización IT, diagnóstico de Windows y persistencia local de aplicaciones.'),
    ('He trabajado con estas herramientas en diagnóstico de equipos, formación académica y proyectos de hardware.', 'Trabajo con estas herramientas en diagnóstico de equipos, formación académica y proyectos de hardware.')
]
for old, new in replacements:
    if old in text:
        text = text.replace(old, new)

text = replace_once(
    text,
    'Preparé una versión web y PDF con mi experiencia, formación, cursos, proyectos, habilidades e idiomas. Mantengo fuera teléfono, correo personal y cualquier dato que no sea necesario para un proceso de selección.',
    'Mantengo una versión web y PDF con experiencia, formación, cursos, proyectos, habilidades e idiomas. Excluyo teléfono, correo personal y cualquier dato que no sea necesario para un proceso de selección.',
    'CV presente'
)

method = '''<section class="wrap section" id="metodo"><div class="head"><span>07</span><div><h2>Cómo trabajo</h2><p>Aplico un proceso claro para reducir riesgo, validar resultados y documentar la solución.</p></div></div><div class="method"><div class="step"><em>1</em><b>Requisitos y contexto</b><span>Identifico necesidad, alcance, restricciones e impacto.</span></div><div class="step"><em>2</em><b>Diagnóstico y evidencia</b><span>Analizo síntomas, causa probable y datos antes de aplicar cambios.</span></div><div class="step"><em>3</em><b>Implementación y validación</b><span>Aplico la solución, pruebo el resultado y confirmo la operación.</span></div><div class="step"><em>4</em><b>Documentación y mejora</b><span>Registro hallazgos, solución y oportunidades de automatización.</span></div></div></section>
'''
text = replace_between(text, '<section class="wrap section" id="metodo">', '<section class="wrap section" id="contacto">', method, 'método')

contact = '''<section class="wrap section" id="contacto"><div class="head"><span>08</span><div><h2>Contacto profesional</h2><p>Centralizo el contacto mediante perfiles profesionales públicos y mantengo fuera del sitio mis datos personales directos.</p></div></div><div class="contactBox"><div><div class="tag">Oportunidades</div><h3>Abierto a roles de mayor responsabilidad técnica.</h3><p>Busco oportunidades en Technical Support Engineering, Application Support, IT Automation y desarrollo técnico donde aporte experiencia en soporte corporativo, automatización y resolución de incidencias.</p><p>El contacto inicial se realiza mediante LinkedIn, GitHub o mi CV público.</p></div><div class="contactActions"><a class="btn primary" href="https://www.linkedin.com/in/josue-villarruel-flores-bb571436a/" target="_blank" rel="noopener noreferrer">Contactarme por LinkedIn ↗</a><a class="btn ghost" href="https://github.com/Descobt-stack" target="_blank" rel="noopener noreferrer">Ver mi GitHub ↗</a><a class="btn ghost" href="cv.html">Ver mi CV público</a><a class="btn ghost" href="cv-pdf.html#download">Descargar CV público ↓</a><div class="contactSoon">Próximamente: formulario de contacto privado sin mostrar mi correo.</div></div></div></section>
'''
text = replace_between(text, '<section class="wrap section" id="contacto">', '</main>', contact, 'contacto')

old_script_end = "document.getElementById('year').textContent=new Date().getFullYear();</script>"
counter = """document.getElementById('year').textContent=new Date().getFullYear();(()=>{const start=new Date(2026,2,2);const today=new Date();let totalMonths=(today.getFullYear()-start.getFullYear())*12+(today.getMonth()-start.getMonth());let anchor=new Date(start.getFullYear(),start.getMonth()+totalMonths,start.getDate());if(anchor>today){totalMonths--;anchor=new Date(start.getFullYear(),start.getMonth()+totalMonths,start.getDate());}const days=Math.max(0,Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())-Date.UTC(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()))/86400000));const years=Math.floor(totalMonths/12);const months=totalMonths%12;const parts=[];if(years>0)parts.push(`${years} ${years===1?'año':'años'}`);if(months>0||years===0)parts.push(`${months} ${months===1?'mes':'meses'}`);parts.push(`${days} ${days===1?'día':'días'}`);const value=parts.join(' · ');document.querySelectorAll('[data-work-duration]').forEach(el=>el.textContent=value);})();</script>"""
text = replace_once(text, old_script_end, counter, 'contador laboral')

path.write_text(text, encoding='utf-8')

checks = [
    'TECHNICAL SUPPORT ENGINEER · APPLICATION SUPPORT · IT AUTOMATION',
    'Perfil profesional',
    'Desde <time datetime="2026-03-02">02 mar 2026</time>',
    'data-work-duration',
    'Ver experiencia técnica →',
    'Tecnologías que utilizo',
    'Abierto a roles de mayor responsabilidad técnica.'
]
missing = [item for item in checks if item not in text]
if missing:
    raise SystemExit('Faltan validaciones: ' + ', '.join(missing))
