const WHATSAPP_NUMBER = ""; // Agrega aquí solo dígitos con código de país, por ejemplo: 521XXXXXXXXXX

const menuBtn=document.getElementById("menuBtn");
const nav=document.getElementById("navLinks");
menuBtn?.addEventListener("click",()=>nav.classList.toggle("open"));
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
document.getElementById("year").textContent=new Date().getFullYear();

const device=document.getElementById("device");
const service=document.getElementById("service");
const mode=document.getElementById("mode");
const details=document.getElementById("details");
const estimate=document.getElementById("estimate");
const status=document.getElementById("quoteStatus");
const copyBtn=document.getElementById("copyQuote");
const whatsappBtn=document.getElementById("whatsappBtn");
const toast=document.getElementById("toast");

const servicePrices={
  maintenance:{pc:650,laptop:800,stream:650},
  windows:{pc:700,laptop:700,stream:700},
  upgrade:{pc:300,laptop:400,stream:300},
  clone:{pc:500,laptop:550,stream:500},
  boot:{pc:600,laptop:650,stream:600},
  gaming:{pc:500,laptop:600,stream:500},
  build:{pc:900,laptop:0,stream:900},
  obs:{pc:600,laptop:600,stream:600}
};
const labels={
  device:{pc:"PC de escritorio",laptop:"Laptop",stream:"Setup de streaming"},
  service:{
    maintenance:"Mantenimiento / limpieza",
    windows:"Windows / formateo",
    upgrade:"Instalación de SSD / RAM / GPU",
    clone:"Clonación de disco",
    boot:"Equipo o Windows no inicia",
    gaming:"Optimización gaming",
    build:"Armado completo de PC",
    obs:"OBS / streaming"
  },
  mode:{local:"Presencial",remote:"Remoto"}
};

function price(){
  const value=servicePrices[service.value]?.[device.value] ?? 0;
  estimate.textContent=value?("Desde $"+value.toLocaleString("es-MX")+" MXN"):"Requiere revisión";
  return value;
}
function message(){
  const p=price();
  const extra=details.value.trim()||"Sin detalles adicionales.";
  return [
    "Hola, quiero solicitar una cotización en DescoTech.",
    "",
    "Equipo: "+labels.device[device.value],
    "Servicio: "+labels.service[service.value],
    "Modalidad: "+labels.mode[mode.value],
    "Estimado inicial mostrado: "+(p?"Desde $"+p.toLocaleString("es-MX")+" MXN":"Requiere revisión"),
    "Detalles: "+extra,
    "",
    "Entiendo que el precio final se confirma después del diagnóstico."
  ].join("\n");
}
function showToast(text){
  toast.textContent=text;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>toast.classList.remove("show"),3200);
}
function updateWhatsapp(){
  if(!WHATSAPP_NUMBER){
    whatsappBtn.hidden=true;
    return;
  }
  whatsappBtn.hidden=false;
  whatsappBtn.href="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message());
}
[device,service,mode,details].forEach(el=>el.addEventListener("input",()=>{price();updateWhatsapp()}));

copyBtn.addEventListener("click",async()=>{
  const text=message();
  try{
    await navigator.clipboard.writeText(text);
    status.textContent="Solicitud generada y copiada. Ya puedes pegarla en tu app de mensajería.";
    showToast("Solicitud copiada.");
  }catch{
    status.textContent="Tu solicitud está lista. Selecciona y copia los datos desde este formulario.";
    showToast("Solicitud generada.");
  }
  updateWhatsapp();
});

document.querySelectorAll(".selectPackage").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const name=btn.dataset.package;
    details.value="Me interesa el paquete "+name+". Quiero confirmar qué incluye para mi equipo.";
    if(name==="PC Fresh"){device.value="pc";service.value="maintenance"}
    if(name==="Gamer Ready"){device.value="pc";service.value="gaming"}
    if(name==="Streamer Setup"){device.value="stream";service.value="obs"}
    price();updateWhatsapp();
    document.getElementById("cotizador").scrollIntoView({behavior:"smooth"});
  });
});
price();
updateWhatsapp();