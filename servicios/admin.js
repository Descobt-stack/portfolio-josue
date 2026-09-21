'use strict';

const STORAGE_KEY='descotech_requests_v1';
const CONTACT_KEY='descotech_secure_contact_v1';
let requests=[];
let selectedId=null;
let activeFilter='all';

const $=id=>document.getElementById(id);
const statusLabels={new:'Nueva',reviewing:'En revisión',waiting:'Falta información',approved:'Aprobada',closed:'Cerrada'};
const priorityLabels={low:'Valor bajo',medium:'Valor medio',high:'Valor alto'};
const criticalityLabels={normal:'No crítico',critical:'Crítico'};
const assigneeLabels={unassigned:'Sin asignar',josue:'Josue',associate:'Asociado'};
const sampleRequests=[
  {id:'DT-41042',createdAt:new Date(Date.now()-18*60000).toISOString(),updatedAt:new Date().toISOString(),name:'Mariana',phone:'33••••••78',device:'Laptop',service:'Diagnóstico',serviceValue:550,details:'Mi laptop se apaga cuando abro programas pesados y se calienta demasiado.',issueDuration:'De 2 a 7 días',appointmentDate:new Date().toISOString().slice(0,10),appointmentTime:'12:00 a 17:00',estimate:'Aprox. desde $550 MXN',status:'new',criticality:'critical',economicPriority:'low',assignee:'josue',contactApproved:false,adminReply:'',source:'demo'},
  {id:'DT-41039',createdAt:new Date(Date.now()-2*3600000).toISOString(),updatedAt:new Date().toISOString(),name:'Carlos',phone:'33••••••32',device:'PC',service:'Optimización gaming',serviceValue:600,details:'Quiero mejorar los FPS y revisar temperaturas antes de cambiar la tarjeta gráfica.',issueDuration:'Más de un mes',appointmentDate:new Date(Date.now()+86400000).toISOString().slice(0,10),appointmentTime:'Después de las 17:00',estimate:'Aprox. desde $600 MXN',status:'reviewing',criticality:'normal',economicPriority:'medium',assignee:'associate',contactApproved:false,adminReply:'Ya estamos revisando los datos de tu equipo.',source:'demo'},
  {id:'DT-41031',createdAt:new Date(Date.now()-25*3600000).toISOString(),updatedAt:new Date().toISOString(),name:'Andrea',phone:'33••••••33',device:'Nuevo equipo',service:'Ensamblaje de setup gaming',serviceValue:1200,details:'Necesito validar compatibilidad, ensamblar el equipo y configurar audio para streaming.',issueDuration:'No aplica',appointmentDate:new Date(Date.now()+172800000).toISOString().slice(0,10),appointmentTime:'9:00 a 12:00',estimate:'Aprox. desde $1,200 MXN',status:'approved',criticality:'normal',economicPriority:'high',assignee:'josue',contactApproved:true,adminReply:'Tu solicitud fue aprobada. Podemos continuar por el canal autorizado.',source:'demo'}
];

function read(){
  try{requests=JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{requests=[]}
  if(!requests.length){requests=structuredClone(sampleRequests);save()}
  requests=requests.map(request=>({...request,serviceValue:Number(request.serviceValue)||0,criticality:request.criticality||'normal',economicPriority:request.economicPriority||(Number(request.serviceValue)>=1000?'high':Number(request.serviceValue)>=600?'medium':'low'),assignee:request.assignee||'unassigned'}));
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
function formatDate(value){if(!value)return 'Sin fecha';return new Intl.DateTimeFormat('es-MX',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`))}
function getContact(){try{return JSON.parse(localStorage.getItem(CONTACT_KEY))?.value||''}catch{return ''}}
function toast(text){$('adminToast').textContent=text;$('adminToast').classList.add('show');clearTimeout(window.adminToastTimer);window.adminToastTimer=setTimeout(()=>$('adminToast').classList.remove('show'),2800)}
function updateCounts(){
  const count=status=>requests.filter(request=>request.status===status).length;
  $('countAll').textContent=requests.length;$('countNew').textContent=count('new');$('countReviewing').textContent=count('reviewing');$('countApproved').textContent=count('approved');$('countClosed').textContent=count('closed');
  $('metricNew').textContent=count('new');$('metricActive').textContent=count('reviewing')+count('waiting');$('metricApproved').textContent=count('approved');
}
function filteredRequests(){
  const query=$('searchRequests').value.trim().toLowerCase();
  const filtered=requests.filter(request=>(activeFilter==='all'||request.status===activeFilter)&&(!query||`${request.id} ${request.name} ${request.service} ${request.phone||''} ${request.accountEmail||''}`.toLowerCase().includes(query)));
  const priorityRank={high:3,medium:2,low:1};const criticalityRank={critical:1,normal:0};const sort=$('requestSort').value;
  return filtered.sort((a,b)=>sort==='value'?(priorityRank[b.economicPriority]-priorityRank[a.economicPriority])||((Number(b.serviceValue)||0)-(Number(a.serviceValue)||0)):sort==='critical'?(criticalityRank[b.criticality]-criticalityRank[a.criticality])||(new Date(b.createdAt)-new Date(a.createdAt)):new Date(b.createdAt)-new Date(a.createdAt));
}
function renderList(){
  updateCounts();const list=$('requestList');list.replaceChildren();
  const matches=filteredRequests();
  if(!matches.length){list.innerHTML='<div class="emptyList">No hay solicitudes con este filtro.</div>';return}
  matches.forEach(request=>{
    const button=document.createElement('button');button.type='button';button.className=`requestItem${request.id===selectedId?' active':''}`;button.dataset.status=request.status;
    button.innerHTML=`<span class="requestIcon">${escapeHtml(initials(request.name))}</span><span class="requestMain"><span class="requestTop"><strong>${escapeHtml(request.name)}</strong><time>${ago(request.createdAt)}</time></span><p>${escapeHtml(request.id)} · ${escapeHtml(request.service)}</p><span class="requestTags"><b class="${request.criticality==='critical'?'critical':''}">${escapeHtml(criticalityLabels[request.criticality])}</b><b>${escapeHtml(assigneeLabels[request.assignee])}</b></span></span><i class="statusDot" title="${escapeHtml(statusLabels[request.status]||request.status)}"></i>`;
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
      <div class="clientCard"><span class="clientAvatar">${escapeHtml(initials(request.name))}</span><div><strong>${escapeHtml(request.name)}</strong><span>${request.phone?`Tel. ${escapeHtml(request.phone)}`:'Teléfono no registrado'}${request.accountEmail?` · ${escapeHtml(request.accountEmail)}`:''}</span></div></div>
      <div class="appointmentCard"><span>CITA SOLICITADA</span><strong>${escapeHtml(formatDate(request.appointmentDate))}</strong><b>${escapeHtml(request.appointmentTime||'Horario pendiente')}</b></div>
      <div class="detailGrid"><div><span>Equipo</span><strong>${escapeHtml(request.device)}</strong></div><div><span>Servicio</span><strong>${escapeHtml(request.service)}</strong></div><div><span>Tiempo con la falla</span><strong>${escapeHtml(request.issueDuration||'No indicado')}</strong></div><div><span>Cotización inicial</span><strong>${escapeHtml(request.estimate||'Requiere revisión')}</strong></div></div>
      <div class="problemBox"><span>RESUMEN DEL CLIENTE</span><p>${escapeHtml(request.details)}</p></div>
      <div class="adminRouting">
        <label>Prioridad por valor<select id="economicPriority">${Object.entries(priorityLabels).map(([value,label])=>`<option value="${value}"${value===request.economicPriority?' selected':''}>${label}</option>`).join('')}</select></label>
        <label>Criticidad<select id="criticality">${Object.entries(criticalityLabels).map(([value,label])=>`<option value="${value}"${value===request.criticality?' selected':''}>${label}</option>`).join('')}</select></label>
        <label>Responsable<select id="assignee">${Object.entries(assigneeLabels).map(([value,label])=>`<option value="${value}"${value===request.assignee?' selected':''}>${label}</option>`).join('')}</select></label>
      </div>
      <label class="replyLabel">Respuesta para el cliente<textarea id="adminReply" maxlength="500" placeholder="Escribe una actualización…">${escapeHtml(request.adminReply||'')}</textarea></label>
      <div class="detailActions"><button class="primary" id="saveReply" type="button">Guardar respuesta</button><button class="success" id="approveContact" type="button">${request.contactApproved?'Revocar contacto':'Aprobar contacto'}</button><button class="danger" id="closeRequest" type="button">Cerrar solicitud</button></div>
      <div class="contactState${request.contactApproved?' approved':''}"><strong>${request.contactApproved?'Contacto autorizado':'Contacto protegido'}</strong>${request.contactApproved?(contact?escapeHtml(contact):'Configura un canal seguro desde el engrane superior.'):'El cliente todavía no puede ver un número o canal directo.'}</div>
    </div>`;
  $('statusSelect').addEventListener('change',event=>updateRequest({status:event.target.value}));
  $('economicPriority').addEventListener('change',event=>updateRequest({economicPriority:event.target.value}));
  $('criticality').addEventListener('change',event=>updateRequest({criticality:event.target.value}));
  $('assignee').addEventListener('change',event=>updateRequest({assignee:event.target.value}));
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
$('requestSort').addEventListener('change',renderList);
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
