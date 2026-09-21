'use strict';

const CHAT_STORAGE='descotech_requests_v1';
const CONTACT_STORAGE='descotech_secure_contact_v1';
const chatPanel=document.getElementById('chatPanel');
const chatLauncher=document.getElementById('chatLauncher');
const chatMessages=document.getElementById('chatMessages');
const chatChoices=document.getElementById('chatChoices');
const chatComposer=document.getElementById('chatComposer');
const chatInput=document.getElementById('chatInput');
let inputHandler=null;
let inputValidator=null;
let inputError='Revisa el dato e inténtalo otra vez.';
let draft={};

const equipmentOptions=[
  {label:'Laptop',value:'Laptop'},
  {label:'PC de escritorio',value:'PC'},
  {label:'Ensamblaje de un nuevo equipo',value:'Nuevo equipo'}
];
const serviceCatalog={
  Laptop:[
    {label:'No enciende o presenta una falla',value:'Diagnóstico',problem:true,price:550},
    {label:'Está lenta o se calienta',value:'Rendimiento / temperatura',problem:true,price:900},
    {label:'Windows o programas fallan',value:'Windows / software',problem:true,price:800},
    {label:'Necesita mantenimiento',value:'Mantenimiento',problem:false,price:900},
    {label:'Mejorar componentes',value:'Upgrade',problem:false,price:450},
    {label:'Gaming: bajos FPS o cierres',value:'Optimización gaming',problem:true,price:650},
    {label:'Asesoría de cómputo',value:'Asesoría de cómputo',problem:false,price:400},
    {label:'Asesoría de programación',value:'Asesoría de programación',problem:false,price:500}
  ],
  PC:[
    {label:'No enciende o presenta una falla',value:'Diagnóstico',problem:true,price:500},
    {label:'Está lenta o se calienta',value:'Rendimiento / temperatura',problem:true,price:800},
    {label:'Windows o programas fallan',value:'Windows / software',problem:true,price:800},
    {label:'Necesita mantenimiento',value:'Mantenimiento',problem:false,price:800},
    {label:'Mejorar componentes',value:'Upgrade',problem:false,price:400},
    {label:'Gaming: bajos FPS o cierres',value:'Optimización gaming',problem:true,price:600},
    {label:'Configurar OBS o streaming',value:'OBS / streaming',problem:false,price:700},
    {label:'Asesoría de cómputo',value:'Asesoría de cómputo',problem:false,price:400},
    {label:'Asesoría de programación',value:'Asesoría de programación',problem:false,price:500}
  ],
  'Nuevo equipo':[
    {label:'Ensamblaje completo',value:'Ensamblaje completo',problem:false,price:900},
    {label:'Cotización de componentes',value:'Cotización de componentes',problem:false,price:350},
    {label:'Investigación y comparación',value:'Investigación de componentes',problem:false,price:400},
    {label:'Validar compatibilidad',value:'Validación de compatibilidad',problem:false,price:350},
    {label:'Asesoría de compra',value:'Asesoría de compra',problem:false,price:400},
    {label:'Ensamblaje de setup gaming',value:'Ensamblaje de setup gaming',problem:false,price:1200}
  ]
};

function readRequests(){try{return JSON.parse(localStorage.getItem(CHAT_STORAGE))||[]}catch{return []}}
function writeRequests(requests){localStorage.setItem(CHAT_STORAGE,JSON.stringify(requests))}
function now(){return new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function addMessage(text,type='bot',html=''){
  const bubble=document.createElement('div');bubble.className=`chatMessage ${type}`;
  bubble.innerHTML=html||`${escapeHtml(text)}<time>${now()}</time>`;chatMessages.appendChild(bubble);
  requestAnimationFrame(()=>{chatMessages.scrollTop=chatMessages.scrollHeight});
}
function showChoices(items){
  chatChoices.replaceChildren();
  items.forEach(item=>{
    const button=document.createElement('button');button.type='button';button.className='chatChoice';button.textContent=item.label;
    button.addEventListener('click',()=>{addMessage(item.label,'user');chatChoices.replaceChildren();item.action()});chatChoices.appendChild(button);
  });
}
function askInput(question,placeholder,handler,options={}){
  addMessage(question);chatChoices.replaceChildren();chatComposer.hidden=false;
  chatInput.type=options.type||'text';chatInput.inputMode=options.inputMode||'';chatInput.min=options.min||'';
  chatInput.placeholder=placeholder;chatInput.value='';inputHandler=handler;inputValidator=options.validate||null;inputError=options.error||inputError;
  setTimeout(()=>chatInput.focus(),50);
}
function finishInput(){chatComposer.hidden=true;chatInput.type='text';chatInput.inputMode='';chatInput.min='';inputHandler=null;inputValidator=null}
function makeFolio(){
  const existing=new Set(readRequests().map(request=>request.id));let id;
  do{id=`DT-${Math.floor(10000+Math.random()*90000)}`}while(existing.has(id));
  return id;
}
function dateISO(offset=0){const date=new Date();date.setDate(date.getDate()+offset);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function formatDate(iso){return new Intl.DateTimeFormat('es-MX',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${iso}T12:00:00`))}
function estimate(){return draft.serviceValue?`Aprox. desde $${draft.serviceValue.toLocaleString('es-MX')} MXN`:'Sujeta a revisión'}
function phoneDigits(value){return value.replace(/\D/g,'')}
function accountChoice(){
  const session=window.DescoAccount?.getSession();
  return session?{label:'Mis tickets',action:()=>window.DescoAccount.open('login')}:{label:'Vincular o crear cuenta',action:()=>window.DescoAccount?.open('register')};
}
function mainMenu(greeting=true){
  if(greeting)addMessage('Hola, soy el asistente virtual de DescoTech. Te ayudo a revisar tu caso, obtener una cotización inicial y solicitar un horario.');
  showChoices([
    {label:'Agendar y cotizar',action:startQuote},
    {label:'Consultar mi folio',action:checkRequest},
    {label:'Ver precios',action:showPrices},
    accountChoice()
  ]);
}
function startQuote(){
  draft={};
  askInput('Empecemos. ¿Cómo te llamas?','Tu nombre',value=>{
    draft.name=value.trim().slice(0,60);askPhone();
  },{validate:value=>value.trim().length>=2,error:'Escribe al menos dos letras de tu nombre.'});
}
function askPhone(){
  askInput(`Gracias, ${draft.name}. ¿A qué número podemos contactarte para confirmar la cita? Solo se usará para atender esta solicitud.`,'10 dígitos',value=>{
    draft.phone=phoneDigits(value);askEquipment();
  },{type:'tel',inputMode:'tel',validate:value=>phoneDigits(value).length>=10&&phoneDigits(value).length<=15,error:'Escribe un número válido de 10 a 15 dígitos.'});
}
function askEquipment(){
  addMessage('¿Qué tipo de equipo necesitas revisar?');
  showChoices(equipmentOptions.map(option=>({label:option.label,action:()=>chooseEquipment(option)})));
}
function chooseEquipment(option){
  draft.device=option.value;addMessage(option.value==='Nuevo equipo'?'¿Qué necesitas para tu nuevo equipo?':'Selecciona la opción que mejor describe lo que necesitas.');
  showChoices(serviceCatalog[option.value].map(service=>({label:service.label,action:()=>chooseService(service)})));
}
function chooseService(option){draft.service=option.value;draft.serviceValue=option.price;draft.isProblem=option.problem;if(option.problem)askDuration();else askSummary()}
function askDuration(){
  addMessage('¿Cuánto tiempo llevas con este problema?');
  showChoices([
    {label:'Menos de 24 horas',action:()=>setDuration('Menos de 24 horas')},
    {label:'De 2 a 7 días',action:()=>setDuration('De 2 a 7 días')},
    {label:'De 1 a 4 semanas',action:()=>setDuration('De 1 a 4 semanas')},
    {label:'Más de un mes',action:()=>setDuration('Más de un mes')},
    {label:'Sucede de forma intermitente',action:()=>setDuration('Intermitente')}
  ]);
}
function setDuration(duration){draft.issueDuration=duration;askSummary()}
function askSummary(){
  const prompt=draft.isProblem?'Cuéntame qué ocurre, cuándo sucede y si aparece algún mensaje de error.':'Dame un resumen de lo que quieres hacer, tu presupuesto o el uso que tendrá el equipo.';
  askInput(prompt,'Escribe un resumen breve…',value=>{draft.details=value.trim().slice(0,700);askDate()},
    {validate:value=>value.trim().length>=10,error:'Agrega un poco más de información, al menos 10 caracteres.'});
}
function askDate(){
  addMessage('¿Qué día prefieres para la revisión? La cita quedará solicitada hasta que el administrador la confirme.');
  showChoices([
    {label:`Hoy · ${formatDate(dateISO(0))}`,action:()=>setDate(dateISO(0))},
    {label:`Mañana · ${formatDate(dateISO(1))}`,action:()=>setDate(dateISO(1))},
    {label:'Elegir otra fecha',action:askCustomDate}
  ]);
}
function askCustomDate(){
  askInput('Selecciona el día que prefieres.','aaaa-mm-dd',value=>setDate(value),
    {type:'date',min:dateISO(0),validate:value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>=dateISO(0),error:'Selecciona una fecha válida a partir de hoy.'});
}
function setDate(value){
  draft.appointmentDate=value;addMessage(`¿En qué horario te resulta más cómodo el ${formatDate(value)}?`);
  showChoices([
    {label:'Mañana · 9:00 a 12:00',action:()=>setTime('9:00 a 12:00')},
    {label:'Tarde · 12:00 a 17:00',action:()=>setTime('12:00 a 17:00')},
    {label:'Después de las 17:00',action:()=>setTime('Después de las 17:00')}
  ]);
}
function setTime(value){draft.appointmentTime=value;showSummary()}
function showSummary(){
  const duration=draft.issueDuration?`\nTiempo con la falla: ${draft.issueDuration}`:'';
  addMessage(`Revisa tu solicitud:\n\nNombre: ${draft.name}\nTeléfono: ${draft.phone}\nEquipo: ${draft.device}\nServicio: ${draft.service}${duration}\nResumen: ${draft.details}\nDía: ${formatDate(draft.appointmentDate)}\nHorario: ${draft.appointmentTime}\nCotización inicial: ${estimate()}\n\nEl precio y la cita se confirman después de revisar la solicitud.`);
  showChoices([{label:'Confirmar solicitud',action:saveRequest},{label:'Volver a empezar',action:startQuote}]);
}
function saveRequest(){
  const session=window.DescoAccount?.getSession();
  const request={
    id:makeFolio(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    name:draft.name,phone:draft.phone,device:draft.device,service:draft.service,serviceValue:draft.serviceValue,details:draft.details,
    issueDuration:draft.issueDuration||'No aplica',appointmentDate:draft.appointmentDate,appointmentTime:draft.appointmentTime,
    estimate:estimate(),status:'new',criticality:'normal',economicPriority:draft.serviceValue>=1000?'high':draft.serviceValue>=600?'medium':'low',assignee:'unassigned',
    contactApproved:false,adminReply:'',source:'chat-demo',accountId:session?.accountId||'',accountEmail:session?.email||''
  };
  const requests=readRequests();requests.unshift(request);writeRequests(requests);window.DescoAccount?.renderTickets();
  const accountText=session?'También quedó guardado en “Mis tickets”.':'Crea una cuenta para conservar tus tickets en este dispositivo.';
  addMessage('', 'bot', `Solicitud y horario registrados.<span class="chatFolio">${escapeHtml(request.id)}</span><br><strong>${escapeHtml(formatDate(request.appointmentDate))} · ${escapeHtml(request.appointmentTime)}</strong><br>Guarda tu folio. ${escapeHtml(accountText)} La cita y la cotización todavía deben ser confirmadas.<time>${now()}</time>`);
  const choices=[{label:'Consultar este folio',action:()=>showRequest(request.id)}];
  choices.push(session?{label:'Mis tickets',action:()=>window.DescoAccount.open('login')}:{label:'Crear cuenta',action:()=>window.DescoAccount?.open('register')});
  choices.push({label:'Menú principal',action:()=>mainMenu(false)});showChoices(choices);
}
function checkRequest(){askInput('Escribe el folio que recibiste.','DT-12345',value=>showRequest(value.trim().toUpperCase()))}
function showRequest(id){
  const request=readRequests().find(item=>item.id===id);
  if(!request){addMessage('No encontré ese folio en este dispositivo. Revisa que esté escrito completo.');showChoices([{label:'Intentar de nuevo',action:checkRequest},{label:'Menú principal',action:()=>mainMenu(false)}]);return}
  const labels={new:'Nueva · pendiente de revisión',reviewing:'En revisión',waiting:'Falta información',approved:'Aprobada',closed:'Cerrada'};
  let html=`<strong>${escapeHtml(request.id)}</strong><br>Estado: ${escapeHtml(labels[request.status]||request.status)}<br>Servicio: ${escapeHtml(request.service)}`;
  if(request.appointmentDate)html+=`<br>Cita solicitada: ${escapeHtml(formatDate(request.appointmentDate))} · ${escapeHtml(request.appointmentTime)}`;
  if(request.adminReply)html+=`<br><br>Respuesta: ${escapeHtml(request.adminReply)}`;
  if(request.contactApproved){
    let contact='Contacto autorizado. El canal seguro aún no está configurado.';try{contact=JSON.parse(localStorage.getItem(CONTACT_STORAGE))?.value||contact}catch{}
    html+=`<span class="chatContact">${escapeHtml(contact)}</span>`;
  }else html+='<br><br>El contacto de DescoTech permanece protegido hasta que se apruebe la solicitud.';
  addMessage('', 'bot', `${html}<time>${now()}</time>`);
  showChoices([{label:'Actualizar estado',action:()=>showRequest(id)},{label:'Menú principal',action:()=>mainMenu(false)}]);
}
function showPrices(){
  addMessage('Precios iniciales:\n• Mantenimiento PC: aprox. desde $800\n• Mantenimiento laptop: aprox. desde $900\n• Windows: aprox. desde $800\n• Upgrades: aprox. desde $400\n• Diagnóstico: aprox. desde $500\n• Optimización gaming: aprox. desde $600\n• Ensamblaje de equipo: aprox. desde $900\n• Asesoría técnica: aprox. desde $400\n\nEl precio final depende del equipo, la falla, el alcance y las piezas necesarias.');
  showChoices([{label:'Agendar y cotizar',action:startQuote},{label:'Menú principal',action:()=>mainMenu(false)}]);
}
function resetChat(){draft={};finishInput();chatMessages.replaceChildren();chatChoices.replaceChildren();mainMenu()}
function openChat(){
  chatPanel.hidden=false;chatPanel.setAttribute('aria-hidden','false');chatLauncher.setAttribute('aria-expanded','true');document.body.classList.add('chatOpen');
  chatPanel.classList.remove('isOpening');requestAnimationFrame(()=>chatPanel.classList.add('isOpening'));if(!chatMessages.children.length)mainMenu();
  setTimeout(()=>document.getElementById('chatClose').focus(),50);
}
function closeChat(){chatPanel.hidden=true;chatPanel.setAttribute('aria-hidden','true');chatLauncher.setAttribute('aria-expanded','false');document.body.classList.remove('chatOpen');chatLauncher.focus()}

chatComposer.addEventListener('submit',event=>{
  event.preventDefault();const value=chatInput.value.trim();if(!value||!inputHandler)return;
  if(inputValidator&&!inputValidator(value)){addMessage(inputError);chatInput.focus();return}
  const handler=inputHandler;addMessage(value,'user');finishInput();handler(value);
});
chatLauncher.addEventListener('click',()=>chatPanel.hidden?openChat():closeChat());
document.querySelectorAll('[data-open-chat]').forEach(button=>button.addEventListener('click',openChat));
document.getElementById('chatClose').addEventListener('click',closeChat);
document.getElementById('chatRestart').addEventListener('click',resetChat);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!chatPanel.hidden)closeChat()});
