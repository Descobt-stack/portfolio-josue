'use strict';
const WHATSAPP_NUMBER = ''; // Configurar solo con un número autorizado para contacto público.
const $ = id => document.getElementById(id);
const menuBtn = $('menuBtn'), nav = $('navLinks');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });
$('year').textContent = new Date().getFullYear();
const device = $('device'), service = $('service'), mode = $('mode'), details = $('details');
const prices = {
  maintenance:{pc:650,laptop:800,stream:650}, windows:{pc:700,laptop:700,stream:700},
  upgrade:{pc:300,laptop:400,stream:300}, clone:{pc:500,laptop:550,stream:500},
  boot:{pc:600,laptop:650,stream:600}, gaming:{pc:500,laptop:600,stream:500},
  build:{pc:900,laptop:null,stream:900}, obs:{pc:600,laptop:600,stream:600},
  fresh:{pc:750,laptop:null,stream:750}, ready:{pc:1400,laptop:null,stream:1400},
  streamer:{pc:1200,laptop:1200,stream:1200}
};
const physical = new Set(['maintenance','upgrade','clone','boot','build','fresh','ready']);
const money = value => value == null ? 'Requiere revisión' : `Desde $${value.toLocaleString('es-MX')} MXN`;
function message() {
  return ['Hola, quiero solicitar una cotización en DescoTech.', '',
    'Equipo: ' + device.selectedOptions[0].textContent,
    'Servicio: ' + service.selectedOptions[0].textContent,
    'Modalidad: ' + mode.selectedOptions[0].textContent,
    'Estimado inicial: ' + money(prices[service.value][device.value]),
    'Detalles: ' + (details.value.trim() || 'Sin detalles adicionales.'), '',
    'Entiendo que el precio final se confirma después del diagnóstico.'].join('\n');
}
function update() {
  const requiresLocal = physical.has(service.value);
  mode.querySelector('[value="remote"]').disabled = requiresLocal;
  if (requiresLocal) mode.value = 'local';
  $('estimate').textContent = money(prices[service.value][device.value]);
  $('whatsappBtn').hidden = !WHATSAPP_NUMBER;
  if (WHATSAPP_NUMBER) $('whatsappBtn').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message())}`;
  if (!$('quoteResult').hidden) $('quoteText').value = message();
}
let toastTimer;
function showToast(text) {
  $('toast').textContent = text; $('toast').classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3200);
}
[device, service, mode, details].forEach(el => el.addEventListener('input', () => {
  update();
  $('quoteStatus').textContent = 'No se realizan reparaciones o compras de piezas sin autorización previa.';
}));
$('quoteForm').addEventListener('submit', async e => {
  e.preventDefault(); update();
  const text = message();
  $('quoteText').value = text; $('quoteResult').hidden = false;
  try {
    await navigator.clipboard.writeText(text);
    $('quoteStatus').textContent = 'Solicitud copiada. Pégala en tu app de mensajería para enviarla.';
    showToast('Solicitud copiada.');
  } catch {
    $('quoteText').focus(); $('quoteText').select();
    $('quoteStatus').textContent = 'Selecciona y copia el texto de tu solicitud. Todavía no se ha enviado.';
    showToast('Tu solicitud está lista para copiar.');
  }
});
const packageServices = {'PC Fresh':'fresh', 'Gamer Ready':'ready', 'Streamer Setup':'streamer'};
document.querySelectorAll('.selectPackage').forEach(btn => btn.addEventListener('click', () => {
  const name = btn.dataset.package;
  service.value = packageServices[name]; device.value = name === 'Streamer Setup' ? 'stream' : 'pc';
  update(); $('quoteStatus').textContent = `Seleccionaste ${name}. Puedes agregar detalles antes de generar tu solicitud.`;
  $('cotizador').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  service.focus({preventScroll:true});
}));
update();
// One-time reveals only. No scroll listeners or continuous animations.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('isVisible'); observer.unobserve(entry.target); }
  }), {threshold:0.06});
  document.querySelectorAll('.serviceCard,.package,.galleryCard').forEach(el => {
    el.classList.add('revealReady','revealPending'); observer.observe(el);
  });
}
