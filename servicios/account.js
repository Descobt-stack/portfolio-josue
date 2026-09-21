'use strict';

const ACCOUNT_STORAGE='descotech_accounts_v1';
const SESSION_STORAGE='descotech_session_v1';
const REQUEST_STORAGE='descotech_requests_v1';
const accountDialog=document.getElementById('accountDialog');
const accountStatus=document.getElementById('accountStatus');

function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function getSession(){return readJson(SESSION_STORAGE,null)}
function randomId(){return crypto.randomUUID?crypto.randomUUID():`acct-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function randomSalt(){const bytes=crypto.getRandomValues(new Uint8Array(16));return Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('')}
async function hashPassword(password,salt){
  const data=new TextEncoder().encode(`${salt}:${password}`);const hash=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(hash),value=>value.toString(16).padStart(2,'0')).join('');
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function statusLabel(value){return ({new:'Nueva',reviewing:'En revisión',waiting:'Falta información',approved:'Aprobada',closed:'Cerrada'})[value]||value}
function formatDate(value){if(!value)return 'Fecha pendiente';return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`))}
function showStatus(message,type='info'){accountStatus.textContent=message;accountStatus.dataset.type=type}
function switchView(view){
  document.querySelectorAll('[data-auth-view]').forEach(button=>button.classList.toggle('active',button.dataset.authView===view));
  document.querySelectorAll('[data-auth-panel]').forEach(panel=>panel.hidden=panel.dataset.authPanel!==view);showStatus('');
}
function renderTickets(){
  const session=getSession();const container=document.getElementById('memberTickets');if(!session||!container)return;
  const requests=readJson(REQUEST_STORAGE,[]).filter(request=>request.accountId===session.accountId);
  document.getElementById('memberTicketCount').textContent=requests.length;container.replaceChildren();
  if(!requests.length){container.innerHTML='<div class="emptyMemberTickets"><strong>Todavía no tienes tickets</strong><span>Crea uno desde el asistente o vincula un folio anterior.</span></div>';return}
  requests.forEach(request=>{
    const card=document.createElement('article');card.className='memberTicket';
    card.innerHTML=`<div><span class="ticketStatus ${escapeHtml(request.status)}">${escapeHtml(statusLabel(request.status))}</span><strong>${escapeHtml(request.id)}</strong><p>${escapeHtml(request.service)}</p></div><div class="ticketMeta"><b>${escapeHtml(request.estimate||'Cotización pendiente')}</b><span>${escapeHtml(formatDate(request.appointmentDate))}${request.appointmentTime?` · ${escapeHtml(request.appointmentTime)}`:''}</span></div>`;
    container.appendChild(card);
  });
}
function renderAccount(){
  const session=getSession();document.getElementById('accountGuest').hidden=Boolean(session);document.getElementById('accountMember').hidden=!session;
  const accountButton=document.getElementById('accountButton');
  if(session){
    document.getElementById('memberName').textContent=`Hola, ${session.name}`;document.getElementById('memberEmail').textContent=session.email;
    accountButton.textContent='Mis tickets';renderTickets();
  }else accountButton.textContent='Mi cuenta';
}
function openAccount(view='login'){switchView(view);renderAccount();accountDialog.showModal()}

document.querySelectorAll('[data-open-account]').forEach(button=>button.addEventListener('click',()=>openAccount('login')));
document.querySelectorAll('[data-auth-view]').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.authView)));
document.getElementById('accountClose').addEventListener('click',()=>accountDialog.close());
accountDialog.addEventListener('click',event=>{if(event.target===accountDialog)accountDialog.close()});

document.getElementById('registerForm').addEventListener('submit',async event=>{
  event.preventDefault();const name=document.getElementById('registerName').value.trim();const email=document.getElementById('registerEmail').value.trim().toLowerCase();const password=document.getElementById('registerPassword').value;
  const accounts=readJson(ACCOUNT_STORAGE,[]);if(accounts.some(account=>account.email===email)){showStatus('Ese correo ya tiene una cuenta. Intenta ingresar.','error');return}
  const salt=randomSalt();const passwordHash=await hashPassword(password,salt);const account={id:randomId(),name,email,salt,passwordHash,createdAt:new Date().toISOString()};
  accounts.push(account);writeJson(ACCOUNT_STORAGE,accounts);writeJson(SESSION_STORAGE,{accountId:account.id,name,email});event.target.reset();renderAccount();showStatus('');
});

document.getElementById('loginForm').addEventListener('submit',async event=>{
  event.preventDefault();const email=document.getElementById('loginEmail').value.trim().toLowerCase();const password=document.getElementById('loginPassword').value;
  const account=readJson(ACCOUNT_STORAGE,[]).find(item=>item.email===email);
  if(!account||await hashPassword(password,account.salt)!==account.passwordHash){showStatus('Correo o contraseña incorrectos.','error');return}
  writeJson(SESSION_STORAGE,{accountId:account.id,name:account.name,email:account.email});event.target.reset();renderAccount();showStatus('');
});

document.getElementById('recoverForm').addEventListener('submit',event=>{
  event.preventDefault();const email=document.getElementById('recoverEmail').value.trim().toLowerCase();const exists=readJson(ACCOUNT_STORAGE,[]).some(account=>account.email===email);
  showStatus(exists?'Cuenta localizada. En la versión final recibirías un enlace seguro por correo.':'No encontramos una cuenta con ese correo.',exists?'success':'error');
});

document.getElementById('logoutButton').addEventListener('click',()=>{localStorage.removeItem(SESSION_STORAGE);renderAccount();switchView('login')});
document.getElementById('linkTicketForm').addEventListener('submit',event=>{
  event.preventDefault();const session=getSession();if(!session)return;
  const id=document.getElementById('linkTicketId').value.trim().toUpperCase();const phone=document.getElementById('linkTicketPhone').value.replace(/\D/g,'');const requests=readJson(REQUEST_STORAGE,[]);
  const index=requests.findIndex(request=>request.id===id&&String(request.phone||'').replace(/\D/g,'')===phone);
  if(index<0){showStatus('No encontramos un ticket que coincida con ese folio y teléfono.','error');return}
  requests[index]={...requests[index],accountId:session.accountId,accountEmail:session.email,updatedAt:new Date().toISOString()};writeJson(REQUEST_STORAGE,requests);event.target.reset();renderTickets();showStatus('Ticket vinculado correctamente.','success');
});

document.querySelectorAll('#accountMember [data-open-chat]').forEach(button=>button.addEventListener('click',()=>accountDialog.close()));
window.addEventListener('storage',event=>{if([SESSION_STORAGE,REQUEST_STORAGE].includes(event.key))renderAccount()});
window.DescoAccount={getSession,open:openAccount,renderTickets};
renderAccount();

