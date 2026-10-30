/* Shared header controller, active page state and dates. */
(()=>{
const button=document.getElementById('menuBtn'),nav=document.getElementById('navLinks');
if(button&&nav){
 const setOpen=open=>{nav.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');button.textContent=open?'Cerrar':'Menú'};
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
 document.addEventListener('click',event=>{if(!nav.contains(event.target)&&!button.contains(event.target))setOpen(false)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){setOpen(false);button.focus()}});
 matchMedia('(max-width:900px)').addEventListener('change',()=>setOpen(false));
 const current=location.pathname.replace(/\/$/,'/index.html');
 nav.querySelectorAll('a').forEach(link=>{const u=new URL(link.href,location.href);if(!u.hash&&u.pathname===current)link.setAttribute('aria-current','page')});
}
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
const duration=document.querySelectorAll('[data-work-duration]');
if(duration.length){const start=new Date(2026,2,2),now=new Date();let months=(now.getFullYear()-start.getFullYear())*12+now.getMonth()-start.getMonth();if(now.getDate()<start.getDate())months--;months=Math.max(0,months);const years=Math.floor(months/12),rest=months%12;const parts=[];if(years)parts.push(years+(years===1?' año':' años'));if(rest||!years)parts.push(rest+(rest===1?' mes':' meses'));duration.forEach(el=>el.textContent=parts.join(' · '))}
})();
