'use strict';

const STORAGE_KEY='descotech_requests_v1';
const CONTACT_KEY='descotech_secure_contact_v1';
let requests=[];
let selectedId=null;
let activeFilter='all';

const $=id=>document.getElementById(id);
const statusLabels={new:'Nueva',reviewing:'En revisión',waiting:'Falta información',approved:'Aprobada',closed:'Cerrada'};
const sampleRequests=[
  {id:'DT-DEMO-1042',createdAt:new Date(Date.now()-18*60000).toISOString(),updatedAt:new Date().toISOString(),name:'Mariana',device:'Laptop',service:'Diagnóstico',details:'Mi laptop se apaga cuando abro programas pesados y se calienta demasiado.',estimate:'Desde $650 MXN',status:'new',contactApproved:false,adminReply:'',source:'demo'},
  {id:'DT-DEMO-1039',createdAt:new Date(Date.now()-2*3600000).toISOString(),updatedAt:new Date().toISOString(),name:'Carlos',device:'PC',service:'Optimización gaming',details:'Quiero mejorar los FPS y revisar temperaturas antes de cambiar la tarjeta gráfica.',estimate:'Desde $500 MXN',status:'reviewing',contactApproved:false,adminReply:'Ya estamos revisando los datos de tu equipo.',source:'demo'},
  {id:'DT-DEMO-1031',createdAt:new Date(Date.now()-25*3600000).toISOString(),updatedAt:new Date().toISOString(),name:'Andrea',device:'Streaming',service:'OBS / streaming',details:'Necesito separar la música de Twitch y configurar el micrófono.',estimate:'Desde $600 MXN',status:'approved',contactApproved:true,adminReply:'Tu solicitud fue aprobada. Podemos continuar por el canal autorizado.',source:'demo'}
];

function read(){
  try{requests=JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{requests=[]}
  if(!requests.length){requests=structuredClone(sampleRequests);save()}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(requests))}
function ago(iso){
  const minutes=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/60000));
  if(minutes<60)return `Hace ${minutes||1} min`;
  if(minutes<1440)return `Hace ${Math.round(minutes/60)} h`;
  return `Hace ${Math.round(minutes/1440)} d`;
}
function initials(name){return name.split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase()}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function getContact(){try{return JSON.parse(localStorage.getItem(CONTACT_KEY))?.value||''}catch{return ''}}
function toast(text){$('adminToast').textContent=text;$('adminToast').classList.add('show');clearTimeout(window.adminToastTimer);window.adminToastTimer=setTimeout(()=>$('adminToast').classList.remove('show'),2800)}
function updateCounts(){
  const count=status=>requests.filter(request=>request.status===status).length;
  $('countAll').textContent=requests.length;$('countNew').textContent=count('new');$('countReviewing').textContent=count('reviewing');$('countApproved').textContent=count('approved');$('countClosed').textContent=count('closed');
  $('metricNew').textContent=count('new');$('metricActive').textContent=count('reviewing')+count('waiting');$('metricApproved').textContent=count('approved');
}
function filteredRequests(){
  const query=$('searchRequests').value.trim().toLowerCase();
  return requests.filter(request=>(activeFilter==='all'||request.status===activeFilter)&&(!query||`${request.id} ${request.name} ${request.service}`.toLowerCase().includes(query)));
}
function renderList(){
  updateCounts();const list=$('requestList');list.replaceChildren();
  const matches=filteredRequests();
  if(!matches.length){list.innerHTML='<div class="emptyList">No hay solicitudes con este filtro.</div>';return}
  matches.forEach(request=>{
    const button=document.createElement('button');button.type='button';button.className=`requestItem${request.id===selectedId?' active':''}`;button.dataset.status=request.status;
    button.innerHTML=`<span class="requestIcon">${escapeHtml(initials(request.name))}</span><span class="requestMain"><span class="requestTop"><strong>${escapeHtml(request.name)}</strong><time>${ago(request.createdAt)}</time></span><p>${escapeHtml(request.id)} · ${escapeHtml(request.service)}</p></span><i class="statusDot" title="${escapeHtml(statusLabels[request.status]||request.status)}"></i>`;
    button.addEventListener('click',()=>selectRequest(request.id));list.appendChild(button);
  });
}
function selectRequest(id){selectedId=id;renderList();renderDetail();$('detailColumn').classList.add('mobileOpen')}
function renderDetail(){
  const request=requests.find(item=>item.id===selectedId);$('emptyDetail').hidden=Boolean(request);$('requestDetail').hidden=!request;if(!request)return;
  const contact=getContact();
  $('requestDetail').innerHTML=`
    <header class="detailHeader"><div class="detailHeaderTop"><div><h2>${escapeHtml(request.id)}</h2><p>Recibida ${ago(request.createdAt)}</p></div><select class="statusSelect" id="statusSelect" aria-label="Estado de solicitud">${Object.entries(statusLabels).map(([value,label])=>`<option value="${value}"${value===request.status?' selected':''}>${label}</option>`).join('')}</select></div></header>
    <div class="detailBody">
      <div class="clientCard"><span class="clientAvatar">${escapeHtml(initials(request.name))}</span><div><strong>${escapeHtml(request.name)}</strong><span>Cliente desde el chat</span></div></div>
      <div class="detailGrid"><div><span>Equipo</span><strong>${escapeHtml(request.device)}</strong></div><div><span>Servicio</span><strong>${escapeHtml(request.service)}</strong></div><div><span>Estimado</span><strong>${escapeHtml(request.estimate||'Requiere revisión')}</strong></div><div><span>Origen</span><strong>Asistente virtual</strong></div></div>
      <div class="problemBox"><span>MENSAJE DEL CLIENTE</span><p>${escapeHtml(request.details)}</p></div>
      <label class="replyLabel">Respuesta para el cliente<textarea id="adminReply" maxlength="500" placeholder="Escribe una actualización…">${escapeHtml(request.adminReply||'')}</textarea></label>
      <div class="detailActions"><button class="primary" id="saveReply" type="button">Guardar respuesta</button><button class="success" id="approveContact" type="button">${request.contactApproved?'Revocar contacto':'Aprobar contacto'}</button><button class="danger" id="closeRequest" type="button">Cerrar solicitud</button></div>
      <div class="contactState${request.contactApproved?' approved':''}"><strong>${request.contactApproved?'Contacto autorizado':'Contacto protegido'}</strong>${request.contactApproved?(contact?escapeHtml(contact):'Configura un canal seguro desde el engrane superior.'):'El cliente todavía no puede ver un número o canal directo.'}</div>
    </div>`;
  $('statusSelect').addEventListener('change',event=>updateRequest({status:event.target.value}));
  $('saveReply').addEventListener('click',()=>{updateRequest({adminReply:$('adminReply').value.trim()});toast('Respuesta guardada')});
  $('approveContact').addEventListener('click',()=>{
    if(!request.contactApproved&&!getContact()){$('settingsDialog').showModal();return}
    updateRequest({contactApproved:!request.contactApproved,status:request.contactApproved?'reviewing':'approved'});toast(request.contactApproved?'Contacto revocado':'Contacto aprobado');
  });
  $('closeRequest').addEventListener('click',()=>{updateRequest({status:'closed',contactApproved:false});toast('Solicitud cerrada')});
}
function updateRequest(changes){
  const index=requests.findIndex(item=>item.id===selectedId);if(index<0)return;
  requests[index]={...requests[index],...changes,updatedAt:new Date().toISOString()};save();renderList();renderDetail();
}

$('statusFilters').addEventListener('click',event=>{
  const button=event.target.closest('[data-filter]');if(!button)return;activeFilter=button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item=>item.classList.toggle('active',item===button));renderList();
});
$('searchRequests').addEventListener('input',renderList);
$('contactSettings').addEventListener('click',()=>{$('secureContact').value=getContact();$('settingsDialog').showModal()});
$('settingsForm').addEventListener('submit',event=>{
  if(event.submitter?.value==='cancel')return;
  event.preventDefault();const value=$('secureContact').value.trim();
  if(!value){toast('Escribe un canal de contacto');return}
  localStorage.setItem(CONTACT_KEY,JSON.stringify({value,updatedAt:new Date().toISOString()}));$('settingsDialog').close();renderDetail();toast('Canal seguro guardado');
});
$('restoreDemo').addEventListener('click',()=>{requests=structuredClone(sampleRequests);selectedId=null;save();renderList();renderDetail();toast('Demostración restablecida')});
$('detailColumn').addEventListener('click',event=>{if(event.target.closest('.detailHeaderTop')&&innerWidth<=1080)$('detailColumn').classList.remove('mobileOpen')});
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){read();renderList();renderDetail()}});

read();renderList();

