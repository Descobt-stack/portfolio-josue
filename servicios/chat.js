'use strict';

const CHAT_STORAGE = 'descotech_requests_v1';
const CONTACT_STORAGE = 'descotech_secure_contact_v1';
const chatPanel = document.getElementById('chatPanel');
const chatLauncher = document.getElementById('chatLauncher');
const chatMessages = document.getElementById('chatMessages');
const chatChoices = document.getElementById('chatChoices');
const chatComposer = document.getElementById('chatComposer');
const chatInput = document.getElementById('chatInput');
let inputHandler = null;
let draft = {};

const equipmentOptions = [
  {label:'PC de escritorio', value:'PC'},
  {label:'Laptop', value:'Laptop'},
  {label:'Setup de streaming', value:'Streaming'}
];
const serviceOptions = [
  {label:'Mantenimiento', value:'Mantenimiento'},
  {label:'Windows o software', value:'Windows / software'},
  {label:'Mejora de componentes', value:'Upgrade'},
  {label:'No enciende o falla', value:'Diagnóstico'},
  {label:'Gaming', value:'Optimización gaming'},
  {label:'OBS y streaming', value:'OBS / streaming'}
];
const priceGuide = {
  'Mantenimiento':'desde $650 MXN',
  'Windows / software':'desde $700 MXN',
  'Upgrade':'desde $300 MXN',
  'Diagnóstico':'desde $600 MXN',
  'Optimización gaming':'desde $500 MXN',
  'OBS / streaming':'desde $600 MXN'
};

function readRequests(){
  try{return JSON.parse(localStorage.getItem(CHAT_STORAGE)) || []}catch{return []}
}
function writeRequests(requests){localStorage.setItem(CHAT_STORAGE,JSON.stringify(requests))}
function now(){return new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}
function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}
function addMessage(text,type='bot',html=''){
  const bubble=document.createElement('div');
  bubble.className=`chatMessage ${type}`;
  bubble.innerHTML=html || `${escapeHtml(text)}<time>${now()}</time>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop=chatMessages.scrollHeight;
}
function showChoices(items){
  chatChoices.replaceChildren();
  items.forEach(item=>{
    const button=document.createElement('button');
    button.type='button';button.className='chatChoice';button.textContent=item.label;
    button.addEventListener('click',()=>{addMessage(item.label,'user');chatChoices.replaceChildren();item.action()});
    chatChoices.appendChild(button);
  });
}
function askInput(question,placeholder,handler){
  addMessage(question);chatChoices.replaceChildren();chatComposer.hidden=false;
  chatInput.placeholder=placeholder;chatInput.value='';inputHandler=handler;
  setTimeout(()=>chatInput.focus(),50);
}
function finishInput(){chatComposer.hidden=true;inputHandler=null}
function makeFolio(){
  const date=new Date();
  const stamp=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  return `DT-${stamp}-${Math.floor(1000+Math.random()*9000)}`;
}
function mainMenu(greeting=true){
  if(greeting)addMessage('Hola, soy el asistente virtual de DescoTech. Puedo ayudarte a cotizar un servicio o consultar una solicitud.');
  showChoices([
    {label:'Cotizar mi equipo',action:startQuote},
    {label:'Consultar mi folio',action:checkRequest},
    {label:'Ver precios',action:showPrices}
  ]);
}
function startQuote(){
  draft={};
  askInput('Perfecto. ¿Cómo te llamas? Solo necesito tu nombre.','Tu nombre',value=>{
    draft.name=value.trim().slice(0,60) || 'Cliente';
    addMessage(`Gracias, ${draft.name}. ¿Qué tipo de equipo necesitas revisar?`);
    showChoices(equipmentOptions.map(option=>({label:option.label,action:()=>chooseEquipment(option)})));
  });
}
function chooseEquipment(option){
  draft.device=option.value;
  addMessage('¿Qué necesitas hacerle a tu equipo?');
  showChoices(serviceOptions.map(service=>({label:service.label,action:()=>chooseService(service)})));
}
function chooseService(option){
  draft.service=option.value;
  askInput('Cuéntame brevemente qué sucede o qué resultado buscas.','Ej. Se apaga al jugar…',value=>{
    draft.details=value.trim().slice(0,500) || 'Sin detalles adicionales';
    addMessage(`Esto es lo que registraré:\n\nEquipo: ${draft.device}\nServicio: ${draft.service}\nReferencia: ${priceGuide[draft.service] || 'requiere revisión'}\nDetalle: ${draft.details}`);
    showChoices([
      {label:'Enviar solicitud',action:saveRequest},
      {label:'Corregir datos',action:startQuote}
    ]);
  });
}
function saveRequest(){
  const request={
    id:makeFolio(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    name:draft.name,device:draft.device,service:draft.service,details:draft.details,
    estimate:priceGuide[draft.service] || 'Requiere revisión',status:'new',contactApproved:false,
    adminReply:'',source:'chat-demo'
  };
  const requests=readRequests();requests.unshift(request);writeRequests(requests);
  addMessage('', 'bot', `Solicitud creada correctamente.<span class="chatFolio">${escapeHtml(request.id)}</span><br>Guarda este folio. El contacto solo se mostrará si el administrador aprueba tu solicitud.<time>${now()}</time>`);
  showChoices([
    {label:'Consultar este folio',action:()=>showRequest(request.id)},
    {label:'Menú principal',action:()=>mainMenu(false)}
  ]);
}
function checkRequest(){
  askInput('Escribe el folio que recibiste.','DT-20260921-1234',value=>showRequest(value.trim().toUpperCase()));
}
function showRequest(id){
  const request=readRequests().find(item=>item.id===id);
  if(!request){
    addMessage('No encontré ese folio en este dispositivo. Revisa que esté escrito completo.');
    showChoices([{label:'Intentar de nuevo',action:checkRequest},{label:'Menú principal',action:()=>mainMenu(false)}]);
    return;
  }
  const labels={new:'Nueva · pendiente de revisión',reviewing:'En revisión',waiting:'Falta información',approved:'Aprobada',closed:'Cerrada'};
  let html=`<strong>${escapeHtml(request.id)}</strong><br>Estado: ${escapeHtml(labels[request.status] || request.status)}<br>Servicio: ${escapeHtml(request.service)}`;
  if(request.adminReply)html+=`<br><br>Respuesta: ${escapeHtml(request.adminReply)}`;
  if(request.contactApproved){
    let contact='Contacto autorizado. El canal seguro aún no está configurado.';
    try{contact=JSON.parse(localStorage.getItem(CONTACT_STORAGE))?.value || contact}catch{}
    html+=`<span class="chatContact">${escapeHtml(contact)}</span>`;
  }else html+='<br><br>El contacto permanece protegido hasta que se apruebe la solicitud.';
  addMessage('', 'bot', `${html}<time>${now()}</time>`);
  showChoices([{label:'Actualizar estado',action:()=>showRequest(id)},{label:'Menú principal',action:()=>mainMenu(false)}]);
}
function showPrices(){
  addMessage('Precios iniciales:\n• Mantenimiento PC: $650\n• Mantenimiento laptop: $800\n• Windows: $700\n• Upgrades: $300\n• Diagnóstico: $600\n• Gaming: $500\n• OBS y streaming: $600\n\nEl total se confirma después de revisar el equipo.');
  showChoices([{label:'Crear solicitud',action:startQuote},{label:'Menú principal',action:()=>mainMenu(false)}]);
}
function resetChat(){
  draft={};finishInput();chatMessages.replaceChildren();chatChoices.replaceChildren();mainMenu();
}
function openChat(){
  chatPanel.hidden=false;chatPanel.setAttribute('aria-hidden','false');chatLauncher.setAttribute('aria-expanded','true');
  chatPanel.classList.remove('isOpening');requestAnimationFrame(()=>chatPanel.classList.add('isOpening'));
  if(!chatMessages.children.length)mainMenu();
  setTimeout(()=>document.getElementById('chatClose').focus(),50);
}
function closeChat(){
  chatPanel.hidden=true;chatPanel.setAttribute('aria-hidden','true');chatLauncher.setAttribute('aria-expanded','false');chatLauncher.focus();
}

chatComposer.addEventListener('submit',event=>{
  event.preventDefault();const value=chatInput.value.trim();if(!value || !inputHandler)return;
  const handler=inputHandler;addMessage(value,'user');finishInput();handler(value);
});
chatLauncher.addEventListener('click',()=>chatPanel.hidden?openChat():closeChat());
document.querySelectorAll('[data-open-chat]').forEach(button=>button.addEventListener('click',openChat));
document.getElementById('chatClose').addEventListener('click',closeChat);
document.getElementById('chatRestart').addEventListener('click',resetChat);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!chatPanel.hidden)closeChat()});

