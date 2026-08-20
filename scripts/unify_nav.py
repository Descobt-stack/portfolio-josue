from pathlib import Path
import re

# Aplica la misma navegación visual en portada, páginas extendidas y casos de proyecto.
TOP_NAV = '<div class="navlinks" id="navLinks"><a href="index.html">Inicio</a><a href="index.html#perfil-detalle">Perfil</a><a href="index.html#experiencia-detalle">Experiencia</a><a href="index.html#proyectos-detalle">Proyectos</a><a href="index.html#tecnologias-detalle">Tecnologías</a><a href="equipo.html">Grupo</a><a href="cv.html">CV</a></div>'
INDEX_NAV = '<div class="navlinks" id="navLinks"><a href="#inicio">Inicio</a><a href="#perfil-detalle" data-expand="perfil-detalle">Perfil</a><a href="#experiencia-detalle" data-expand="experiencia-detalle">Experiencia</a><a href="#proyectos-detalle" data-expand="proyectos-detalle">Proyectos</a><a href="#tecnologias-detalle" data-expand="tecnologias-detalle">Tecnologías</a><a href="equipo.html">Grupo</a><a href="cv.html">CV</a></div>'
CV_NAV = '<div class="links"><a href="index.html">Inicio</a><a href="index.html#perfil-detalle">Perfil</a><a href="index.html#experiencia-detalle">Experiencia</a><a href="index.html#proyectos-detalle">Proyectos</a><a href="index.html#tecnologias-detalle">Tecnologías</a><a href="equipo.html">Grupo</a><a href="cv.html">CV</a></div>'
PROJECT_NAV = '<div class="links"><a href="../index.html">Inicio</a><a href="../index.html#perfil-detalle">Perfil</a><a href="../index.html#experiencia-detalle">Experiencia</a><a href="../index.html#proyectos-detalle">Proyectos</a><a href="../index.html#tecnologias-detalle">Tecnologías</a><a href="../equipo.html">Grupo</a><a href="../cv.html">CV</a></div>'


def replace_once(path, pattern, replacement):
    text = path.read_text(encoding='utf-8')
    new, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'No se pudo unificar navegación en {path}')
    path.write_text(new, encoding='utf-8')

replace_once(Path('index.html'), r'<div class="navlinks" id="navLinks">.*?</div>', INDEX_NAV)

for name in ['perfil.html','experiencia.html','projects.html','tecnologias.html']:
    replace_once(Path(name), r'<div class="navlinks" id="navLinks">.*?</div>', TOP_NAV)

replace_once(Path('cv.html'), r'<div class="links">.*?</div>', CV_NAV)

for path in sorted(Path('projects').glob('*.html')):
    text = path.read_text(encoding='utf-8')
    if '<div class="links">' in text:
        new, count = re.subn(r'<div class="links">.*?</div>', PROJECT_NAV, text, count=1, flags=re.S)
        if count == 1:
            path.write_text(new, encoding='utf-8')

print('Navegación superior unificada.')