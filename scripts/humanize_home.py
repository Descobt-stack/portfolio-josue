from pathlib import Path

p = Path('index.html')
text = p.read_text(encoding='utf-8')

old_hint = '<div class="stickyHint"><div class="shell"><b>Portada principal</b><span>· Los bloques se despliegan aquí mismo; no pierdes el resumen superior.</span></div></div>'
text = text.replace(old_hint, '', 1)

old_intro = '<div class="dashboardIntro"><div><div class="eyebrow">RESUMEN PROFESIONAL</div><h2>Todo lo importante, sin saturar.</h2><p>Selecciona un bloque para abrir el detalle en esta misma página. Si necesitas profundizar todavía más, cada sección conserva un enlace a su página completa.</p></div></div>'
new_intro = '<div class="dashboardIntro"><div><div class="eyebrow">MI PORTAFOLIO</div><h2>Aquí puedes ver en qué trabajo.</h2><p>Reuní lo principal de mi experiencia, proyectos y herramientas. Si algo te interesa, abre esa sección y ahí te cuento más.</p></div></div>'
text = text.replace(old_intro, new_intro, 1)

old_priv = '<div class="eyebrow">EVIDENCIA Y PRIVACIDAD</div><h2>Muestro el trabajo sin exponer información sensible.</h2><p>Los proyectos públicos presentan contexto, decisiones, resultados y fragmentos seleccionados. Las demos actuales y el código fuente completo permanecen privados.</p>'
new_priv = '<div class="eyebrow">PRIVACIDAD</div><h2>Comparto mi trabajo sin publicar información de la empresa.</h2><p>Los casos y proyectos parten de trabajo real, pero omito nombres, datos internos y cualquier información sensible. Prefiero mostrar cómo trabajo y cómo abordo cada problema sin comprometer a nadie.</p>'
text = text.replace(old_priv, new_priv, 1)

p.write_text(text, encoding='utf-8')
print('Portada humanizada')
