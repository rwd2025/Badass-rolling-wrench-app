const DEFAULTS={rate:135,service:250,tax:7,card:0,markup:15,rent:1500,insurance:145,electric:250,other:0,backend:'https://rolling-wrench-ai-backend.onrender.com',supabase:'https://uxpkqwcmvtqvubibbrek.supabase.co',supabaseKey:'sb_publishable_MIwgVQm6UPIbd76uIm2-tw_NzSw19ym',theme:'green',mode:'shop'};
function $(id){return document.getElementById(id)}
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(n){return '$'+Number(n||0).toFixed(2)}
function now(){return new Date().toLocaleString()}
function settings(){return {...DEFAULTS,...store.get('settings',{})}}
let current='home',hist=[];
function show(id){if(!$(id))return;if(current!==id)hist.push(current);current=id;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');scrollTo({top:0,behavior:'smooth'});renderAll()}
function goBack(){const last=hist.pop();if(last){current=last;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(last)?.classList.add('active')}else show('home')}
function alertMsg(msg){const a=store.get('alerts',[]);a.unshift({msg,date:now()});store.set('alerts',a.slice(0,20));renderAlerts()}
function renderAlerts(){const box=$('alertsBox');if(!box)return;const a=store.get('alerts',[]);box.textContent=a.length?a.map(x=>`${x.date} — ${x.msg}`).join('\n'):'NO ALERTS'}
function clearAlerts(){store.set('alerts',[]);renderAlerts()}
function signIn(){const n=$('loginName').value.trim();if(!n)return alert('Enter employee name');localStorage.setItem('employeeName',n);$('login').classList.add('hide');alertMsg(n+' signed in')}
function quickStart(){localStorage.setItem('employeeName','James Jacobs');$('login').classList.add('hide')}
function loadLogin(){if(localStorage.getItem('employeeName'))$('login').classList.add('hide')}
function setTheme(t){document.body.className=document.body.className.replace(/\b(green|orange|red|blue|night|chrome|patriot|forge|carbon|diamond|steel|flag|wide|compact|tablet)\b/g,'').trim();document.body.classList.add(t||'green');const s=settings();s.theme=t||'green';store.set('settings',s);document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#00ff7a')}
function setBackground(bg){document.body.className=document.body.className.replace(/\b(carbon|diamond|steel|flag)\b/g,'').trim();document.body.classList.add(bg||'carbon');const s=settings();s.background=bg||'carbon';store.set('settings',s)}
function setLayout(l){document.body.className=document.body.className.replace(/\b(wide|compact|tablet)\b/g,'').trim();document.body.classList.add(l||'tablet');const s=settings();s.layout=l||'tablet';store.set('settings',s)}
function setMode(m){const s=settings();s.mode=m;store.set('settings',s);$('modeBadge').textContent=m==='roadside'?'ROADSIDE MODE':'SHOP MODE';$('serviceToggle').checked=m==='roadside';$('shopBtn')?.classList.toggle('active',m!=='roadside');$('roadBtn')?.classList.toggle('active',m==='roadside');alertMsg((m==='roadside'?'Roadside':'Shop')+' mode')}
function saveSettings(){const s=settings();s.rate=+$('setRate').value||DEFAULTS.rate;s.backend=$('backendUrl').value.trim()||DEFAULTS.backend;s.supabase=$('supabaseUrl').value.trim()||DEFAULTS.supabase;s.supabaseKey=$('supabaseKey').value.trim()||DEFAULTS.supabaseKey;s.theme=$('theme').value||'green';s.background=$('bgStyle')?.value||'carbon';s.layout=$('layoutStyle')?.value||'tablet';s.owner=$('ownerName').value.trim()||'James Jacobs';s.role=$('role').value;store.set('settings',s);setTheme(s.theme);setBackground(s.background);setLayout(s.layout);$('settingsOut').textContent='Settings saved. '+now();alertMsg('Settings saved')}
function loadSettings(){const s=settings();$('quoteRate').value=s.rate;$('serviceCall').value=s.service;$('taxRate').value=s.tax;$('cardFee').value=s.card;$('partsMarkup').value=s.markup;$('rent').value=s.rent;$('insurance').value=s.insurance;$('electric').value=s.electric;$('otherExpense').value=s.other;$('backendUrl').value=s.backend;$('supabaseUrl').value=s.supabase;$('supabaseKey').value=s.supabaseKey;$('setRate').value=s.rate;$('ownerName').value=s.owner||localStorage.getItem('employeeName')||'James Jacobs';$('theme').value=s.theme||'green'; if($('bgStyle')) $('bgStyle').value=s.background||'carbon'; if($('layoutStyle')) $('layoutStyle').value=s.layout||'tablet'; setTheme(s.theme||'green');setBackground(s.background||'carbon');setLayout(s.layout||'tablet');setMode(s.mode||'shop')}
async function decodeVin(){const vin=$('vin').value.trim().toUpperCase();if(!vin)return alert('Enter VIN');$('truckOut').textContent='Decoding VIN...';try{const r=await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/'+encodeURIComponent(vin)+'?format=json');const d=(await r.json()).Results?.[0]||{};$('year').value=d.ModelYear||$('year').value;$('make').value=d.Make||$('make').value;$('model').value=d.Model||$('model').value;$('engine').value=d.EngineModel||d.EngineManufacturer||$('engine').value;$('truckOut').textContent='VIN decoded. Verify engine/transmission before quote.';saveTruck(false)}catch(e){$('truckOut').textContent='VIN decode failed: '+e.message}}
function saveTruck(showAlert=true){const t={vin:$('vin').value.trim().toUpperCase(),unit:$('unit').value.trim(),year:$('year').value.trim(),make:$('make').value.trim(),model:$('model').value.trim(),engine:$('engine').value.trim(),mileage:$('mileage').value.trim()};store.set('truck',t);if(showAlert)alertMsg('Truck saved');renderAll()}
function clearTruck(){['vin','unit','year','make','model','engine','mileage'].forEach(id=>$(id).value='');store.set('truck',{});renderAll()}
async function saveCustomer(){
  const c={
    name:$('custName').value.trim(),
    phone:$('custPhone').value.trim(),
    email:$('custEmail').value.trim(),
    address:$('custAddress').value.trim()
  };
  if(!c.name && !c.phone){alert('Enter customer name or phone');return;}
  store.set('customer',c);
  renderAll();
  try{
    await supabaseInsert('customers',c);
    alertMsg('Customer saved to Supabase');
    alert('Customer saved to Supabase');
  }catch(e){
    alertMsg('Customer saved locally only: '+e.message);
    alert('Customer saved locally only: '+e.message);
  }
}
function clearCustomer(){['custName','custPhone','custEmail','custAddress'].forEach(id=>$(id).value='');store.set('customer',{});renderAll()}
let clocks={A:{elapsed:0,running:false,start:0,label:''},B:{elapsed:0,running:false,start:0,label:''},C:{elapsed:0,running:false,start:0,label:''}};
function loadClocks(){clocks={...clocks,...store.get('clocks',{})}}
function saveClocks(){['A','B','C'].forEach(k=>{const el=$('clock'+k+'Label');if(el)clocks[k].label=el.value});store.set('clocks',clocks)}
function clockMs(k){const c=clocks[k];return c.elapsed+(c.running?Date.now()-c.start:0)}
function hours(k){return clockMs(k)/36e5}
function clockStart(k){const c=clocks[k];if(!c.running){c.running=true;c.start=Date.now();alertMsg('Clock '+k+' running')}saveClocks();renderClocks()}
function clockPause(k){const c=clocks[k];if(c.running){c.elapsed+=Date.now()-c.start;c.running=false;alertMsg('Clock '+k+' paused')}saveClocks();renderClocks()}
function clockStop(k){clockPause(k);$('clock'+k+'Status').textContent='STOPPED';alertMsg('Clock '+k+' stopped')}
function clockReset(k){clocks[k]={elapsed:0,running:false,start:0,label:''};$('clock'+k+'Label').value='';saveClocks();renderClocks();alertMsg('Clock '+k+' cleared')}
function clockToInvoice(k){const h=hours(k);$('quoteHours').value=h.toFixed(2);$('invoiceNotes').value+=`\nClock ${k}: ${h.toFixed(2)} hrs ${money(h*settings().rate)}`;show('invoice')}
function renderClocks(){['A','B','C'].forEach(k=>{const ms=clockMs(k),sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;const rate=+$('quoteRate')?.value||settings().rate;$('clock'+k+'Time').textContent=[h,m,s].map(x=>String(x).padStart(2,'0')).join(':');$('clock'+k+'Money').textContent=money(ms/36e5*rate);$('clock'+k+'Status').textContent=clocks[k].running?'RUNNING':(ms?'PAUSED':'READY');$('clock'+k+'Label').value=clocks[k].label||''})}
async function lookupPart(){const q=$('partQuery').value.trim();if(!q)return alert('Enter part');$('partsOut').textContent='Searching...';const local=localPartSearch(q);$('partsOut').textContent=local;try{const x=await tryBackend('/api/parts',{q,query:q,vehicle:store.get('truck',{})});$('partsOut').textContent=formatBackendPart(x,q)||local;alertMsg('Backend parts lookup complete')}catch(e){$('partsOut').textContent=local+'\n\nBackend parts lookup unavailable. Use supplier buttons.'}}
function localPartSearch(q){const parts=[['4376357','Cummins ISX Water Pump','Cooling'],['2881753','Cummins ISX Turbocharger','Air'],['4954200','Cummins ISX Fuel Injector','Fuel'],['4309129','Cummins ISX NOx Sensor','Emissions'],['A4722001601','Detroit DD15 Water Pump','Cooling'],['2293961','PACCAR MX-13 NOx Sensor','Emissions'],['1931652','PACCAR MX-13 Turbo Actuator','Air'],['1848410C94','International DT466 ICP Sensor','Sensors'],['1876105C95','MaxxForce 13 EGR Valve','Emissions']];const s=q.toLowerCase();const hits=parts.filter(p=>p.join(' ').toLowerCase().includes(s)||s.split(/\s+/).some(w=>w.length>2&&p.join(' ').toLowerCase().includes(w)));return hits.length?hits.map(p=>`${p[0]} — ${p[1]} — ${p[2]}\nVERIFY BY VIN/ESN BEFORE ORDERING`).join('\n\n'):`No local match for: ${q}`}
function formatBackendPart(x,q){if(!x)return'';if(typeof x==='string')return x;return JSON.stringify(x,null,2)}
function supplier(s){const q=encodeURIComponent($('partQuery').value||'diesel truck parts');const urls={fleetpride:`https://www.google.com/search?q=site:fleetpride.com+${q}`,napa:`https://www.napaonline.com/en/search?text=${q}`,oreilly:`https://www.oreillyauto.com/search?q=${q}`,truckpro:`https://www.google.com/search?q=site:truckpro.com+${q}`,google:`https://www.google.com/search?q=${q}`,dealer:`https://www.google.com/maps/search/heavy+duty+truck+parts+${q}`};window.open(urls[s],'_blank')}
function addPartLine(){const q=$('partQuery').value.trim();if(!q)return; $('quoteDesc').value+='\nPart: '+q; alertMsg('Part added to quote notes')}
function clearParts(){$('partQuery').value='';$('partsOut').textContent=''}
async function scanImage(e){const f=e.target.files?.[0];if(!f)return;const p=$('scanPreview');p.src=URL.createObjectURL(f);p.style.display='block';$('scanOut').textContent='Reading image...';try{if(!window.Tesseract)throw new Error('OCR library not loaded');const r=await Tesseract.recognize(f,'eng');$('scanText').value=r.data.text||'';$('scanOut').textContent='OCR complete. Tap PARSE.'}catch(err){$('scanOut').textContent='OCR failed: '+err.message}}
function parsedScan(){const text=$('scanText').value||'';const prices=[...(text.matchAll(/\$?\s*(\d{1,5}\.\d{2})/g))].map(m=>m[1]);const part=(text.match(/\b[A-Z]{0,4}\d{4,10}[A-Z0-9-]{0,8}\b/i)||[''])[0];const vendor=(text.match(/(FleetPride|NAPA|O.?Reilly|TruckPro|Cummins|Detroit|Peterbilt|Kenworth|Freightliner)/i)||[''])[0];return{part,price:prices.pop()||'',vendor,text}}
function parseScan(){const p=parsedScan();$('scanOut').textContent=`VENDOR: ${p.vendor||'UNKNOWN'}\nPART: ${p.part||'UNKNOWN'}\nPRICE: ${p.price||'UNKNOWN'}\nTYPE: ${$('scanType').value}`}
function scanToQuote(){parseScan();const p=parsedScan();if(p.price)$('quoteParts').value=(+$('quoteParts').value||0)+parseFloat(p.price);if(p.part)$('quoteDesc').value+=`\nScanned part: ${p.part} ${p.vendor?`(${p.vendor})`:''}`;show('quote')}
function scanToInvoice(){parseScan();$('invoiceNotes').value+='\nSCAN:\n'+$('scanOut').textContent;scanToQuote();show('invoice')}
function clearScan(){$('scanText').value='';$('scanOut').textContent='';$('scanFile').value='';$('scanPreview').style.display='none'}
function sayQuote(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return alert('Voice not supported on this browser');const r=new SR();r.lang='en-US';r.onresult=e=>{const t=e.results[0][0].transcript;$('quoteJob').value=t;autoBuildFromWords(t)};r.start()}
function autoBuildFromWords(t){const s=t.toLowerCase();$('quoteDesc').value=t; if(s.includes('brake')){$('quoteHours').value=s.includes('trailer')?'3.5':'4';$('quoteJob').value='Brake Job'} else if(s.includes('clutch')){$('quoteHours').value='11';$('quoteJob').value='Clutch Job'} else if(s.includes('water pump')){$('quoteHours').value='4';$('quoteJob').value='Water Pump'} else if(s.includes('diagnos')){$('quoteHours').value='1';$('quoteJob').value='Diagnostic'} buildQuote()}
function calcTotals(){const h=+$('quoteHours').value||0,r=+$('quoteRate').value||settings().rate,rawParts=+$('quoteParts').value||0,markup=+$('partsMarkup').value||0,p=rawParts*(1+markup/100),svc=$('serviceToggle').checked?(+$('serviceCall').value||0):0,taxPct=+$('taxRate').value||0,cardPct=+$('cardFee').value||0;const labor=h*r,sub=labor+p+svc,tax=sub*taxPct/100,card=(sub+tax)*cardPct/100,total=sub+tax+card;return{h,r,rawParts,markup,p,svc,labor,sub,tax,card,total}}
function businessInfo(){const s=settings();return {name:'Rolling Wrench Diesel', owner:s.owner||'James Jacobs', phone:'260-502-6222', web:'www.rollingwrenchdiesel.com'}}
function truckLine(){const t=store.get('truck',{});return [t.unit,t.year,t.make,t.model,t.engine].filter(Boolean).join(' ')||'—'}
function invoiceHeader(title){
  const b=businessInfo(), c=store.get('customer',{}), t=store.get('truck',{});
  return `<div class="rw-invoice">
    <div class="rw-inv-top">
      <div class="rw-logoBox"><img src="logo.svg" alt="RW"></div>
      <div class="rw-shop">
        <h2>${esc(b.name)}</h2>
        <div>${esc(b.owner)} • ${esc(b.phone)}</div>
        <div>${esc(b.web)}</div>
      </div>
      <div class="rw-inv-title"><b>${esc(title)}</b><span>${now()}</span></div>
    </div>
    <div class="rw-inv-grid">
      <div><label>BILL TO</label><strong>${esc(c.name||'—')}</strong><span>${esc(c.phone||'')}</span><span>${esc(c.email||'')}</span></div>
      <div><label>UNIT / TRUCK</label><strong>${esc(truckLine())}</strong><span>VIN: ${esc(t.vin||'—')}</span><span>Mileage: ${esc(t.mileage||'—')}</span></div>
    </div>`;
}
function invoiceMoneyTable(x){
  return `<div class="rw-money-table">
    <div><span>Labor</span><b>${money(x.labor)}</b></div>
    <div><span>Service Call</span><b>${money(x.svc)}</b></div>
    <div><span>Parts</span><b>${money(x.p)}</b></div>
    <div><span>Tax</span><b>${money(x.tax)}</b></div>
    <div><span>Card Fee</span><b>${money(x.card)}</b></div>
    <div class="rw-total"><span>TOTAL DUE</span><b>${money(x.total)}</b></div>
  </div>`;
}
function invoiceTerms(){return `<div class="rw-terms"><b>Terms:</b> Payment due upon completion unless otherwise agreed. Parts pricing and availability may change. Customer authorizes Rolling Wrench Diesel to perform the listed work. Recommended re-checks and road-test limitations should be noted on the invoice when applicable.</div>`}
function buildQuote(){
  const x=calcTotals();
  $('quoteOut').innerHTML=invoiceHeader('QUOTE')+`<div class="rw-section"><h3>${esc($('quoteJob').value||'Quote')}</h3><p>${esc($('quoteDesc').value||'').replace(/\n/g,'<br>')}</p></div>${invoiceMoneyTable(x)}${invoiceTerms()}</div>`;
  store.set('lastQuote',x);updateFinance();alertMsg('Quote built')
}
function clearQuote(){['quoteJob','quoteHours','quoteParts','quoteDesc'].forEach(id=>$(id).value='');$('quoteOut').innerHTML=''}
function writeProfessional(type){const map={quote:'quoteDesc',workorder:'woWork'};const id=map[type]||'invoiceNotes';const v=$(id).value.trim();$(id).value='Work will be completed professionally, verified after repair, and documented for customer records. '+v;alertMsg('Professional wording added')}
function quoteToInvoice(){buildQuote();$('invoiceNotes').value=$('quoteOut').innerText;show('invoice')}
function buildWorkOrder(){$('woOut').innerHTML=invoiceHeader('WORK ORDER')+`<div class="rw-section"><h3>Complaint</h3><p>${esc($('woComplaint').value).replace(/\n/g,'<br>')}</p></div><div class="rw-section"><h3>Diagnosis</h3><p>${esc($('woDiagnosis').value).replace(/\n/g,'<br>')}</p></div><div class="rw-section"><h3>Work Performed</h3><p>${esc($('woWork').value).replace(/\n/g,'<br>')}</p></div>${invoiceTerms()}</div>`;alertMsg('Work order built')}
function clearWorkOrder(){['woComplaint','woDiagnosis','woWork'].forEach(id=>$(id).value='');$('woOut').innerHTML=''}
function workToInvoice(){buildWorkOrder();$('invoiceNotes').value=$('woOut').innerText;show('invoice')}
function sigData(){return $('sigCanvas').toDataURL('image/png')}
function isCanvasBlank(c){const blank=document.createElement('canvas');blank.width=c.width;blank.height=c.height;return c.toDataURL()===blank.toDataURL()}
function buildOneInvoice(copyTitle,x,signed){
  const work=esc($('invoiceNotes').value||$('quoteDesc').value||'').replace(/\n/g,'<br>');
  let html=invoiceHeader(copyTitle)+`<div class="rw-section"><h3>Work Performed / Invoice Notes</h3><p>${work||'—'}</p></div>`+invoiceMoneyTable(x)+invoiceTerms()+`<div class="rw-sig-block"><b>Customer Signature</b>`;
  if(signed) html+=`<img src="${sigData()}" alt="Customer signature">`;
  else html+=`<div class="rw-not-signed">NOT SIGNED</div>`;
  html+=`</div></div>`;
  return html;
}
function buildInvoice(){
  const x=calcTotals(), copy=$('invoiceType').value, canvas=$('sigCanvas'), signed=!isCanvasBlank(canvas);
  let html='';
  if(copy==='Both Copies') html=buildOneInvoice('CUSTOMER INVOICE COPY',x,signed)+'<div class="rw-page-break"></div>'+buildOneInvoice('SHOP COPY',x,signed);
  else html=buildOneInvoice(copy.toUpperCase(),x,signed);
  $('invoiceOut').innerHTML=html;
  store.set('lastInvoice',{total:x.total,date:now(),html,plain:$('invoiceOut').innerText,signed});
  updateFinance();alertMsg(signed?'Invoice built with signature':'Invoice built - no signature')
}
function clearInvoice(){['invoiceNotes'].forEach(id=>$(id).value='');$('invoiceOut').innerHTML='';clearSignature()}
function textInvoice(){buildInvoice();const c=store.get('customer',{});location.href=`sms:${c.phone||''}?&body=${encodeURIComponent($('invoiceOut').innerText)}`}
async function saveInvoice(){buildInvoice();const list=store.get('invoices',[]);list.unshift(store.get('lastInvoice',{}));store.set('invoices',list);try{await supabaseInsert('invoices',{customer:store.get('customer',{}),truck:store.get('truck',{}),total:store.get('lastInvoice',{}).total,html:store.get('lastInvoice',{}).html,created_at:new Date().toISOString()});alertMsg('Invoice saved local + Supabase')}catch(e){alertMsg('Invoice saved local. Supabase unavailable.')}updateFinance()}
function addSchedule(){const list=store.get('schedule',[]);list.unshift({date:$('schDate').value,time:$('schTime').value,customer:$('schCustomer').value,job:$('schJob').value});store.set('schedule',list);renderSchedule();alertMsg('Schedule added')}
function renderSchedule(){const l=store.get('schedule',[]);$('scheduleOut').textContent=l.length?l.map(x=>`${x.date} ${x.time} — ${x.customer} — ${x.job}`).join('\n'):'NO SCHEDULED WORK'}
function clearSchedule(){store.set('schedule',[]);renderSchedule()}
function updateFinance(){const s=settings();const inv=store.get('invoices',[]).reduce((sum,i)=>sum+(+i.total||0),0);const h=['A','B','C'].reduce((sum,k)=>sum+hours(k),0),labor=h*s.rate;const over=(+$('rent').value||0)+ (+$('insurance').value||0)+ (+$('electric').value||0)+ (+$('otherExpense').value||0);$('finLabor').textContent=money(labor);$('finParts').textContent=money(+$('quoteParts').value||0);$('finInvoices').textContent=money(inv);$('finBreakEven').textContent=money(over)}
async function testBackend(){const out=$('settingsOut');out.textContent='Testing backend...';const base=(settings().backend||'').replace(/\/$/,'');try{let r=await fetch(base+'/api/health');if(!r.ok)r=await fetch(base);out.textContent='Backend: '+r.status}catch(e){out.textContent='Backend failed: '+e.message}}
async function testSupabase(){
  const out=$('settingsOut');out.textContent='Testing Supabase...';
  const s=settings();
  try{
    const base=s.supabase.replace(/\/$/,'');
    const r=await fetch(base+'/rest/v1/customers?select=id&limit=1',{
      headers:{apikey:s.supabaseKey,Authorization:'Bearer '+s.supabaseKey}
    });
    let msg='Supabase: '+r.status;
    if(r.ok) msg='Supabase: connected';
    else msg+=' — '+(await r.text()).slice(0,140);
    out.textContent=msg;
  }catch(e){out.textContent='Supabase failed: '+e.message}
}
async function supabaseInsert(table,row){
  const s=settings();
  const url=`${s.supabase.replace(/\/$/,'')}/rest/v1/${table}`;
  const r=await fetch(url,{method:'POST',headers:{apikey:s.supabaseKey,Authorization:'Bearer '+s.supabaseKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});
  if(!r.ok){let txt='';try{txt=await r.text()}catch(e){};throw new Error('Supabase '+r.status+' '+txt.slice(0,120));}
  return true;
}
async function tryBackend(path,body){const base=(settings().backend||'').replace(/\/$/,'');const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('backend '+r.status);return r.json()}
function resetApp(){if(confirm('Reset local app data?')){localStorage.clear();location.reload()}}
function renderAll(){const t=store.get('truck',{}),c=store.get('customer',{});$('activeTruckBox').innerHTML=t.vin?`${esc(t.unit||'')} ${esc(t.year||'')} ${esc(t.make||'')} ${esc(t.model||'')}<br>${esc(t.engine||'')}<br>${esc(t.vin||'')}`:'NO ACTIVE TRUCK';$('activeCustomerBox').innerHTML=c.name?`${esc(c.name)}<br>${esc(c.phone||'')}<br>${esc(c.email||'')}`:'NO CUSTOMER SELECTED';renderClocks();renderAlerts();renderSchedule();updateFinance()}
function loadFields(){const t=store.get('truck',{}),c=store.get('customer',{});Object.entries({vin:t.vin,unit:t.unit,year:t.year,make:t.make,model:t.model,engine:t.engine,mileage:t.mileage,custName:c.name,custPhone:c.phone,custEmail:c.email,custAddress:c.address}).forEach(([k,v])=>{if($(k))$(k).value=v||''})}
function initSig(){const canvas=$('sigCanvas'),ctx=canvas.getContext('2d');function resize(){const ratio=Math.max(devicePixelRatio||1,1),rect=canvas.getBoundingClientRect(),data=ctx.getImageData(0,0,canvas.width,canvas.height);canvas.width=rect.width*ratio;canvas.height=180*ratio;ctx.putImageData(data,0,0);ctx.scale(ratio,ratio);ctx.lineWidth=4;ctx.lineCap='round';ctx.strokeStyle='#000'}setTimeout(resize,100);let drawing=false;function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}function start(e){drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);canvas.setPointerCapture?.(e.pointerId);e.preventDefault()}function move(e){if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}function end(e){drawing=false;e.preventDefault()}canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end)}
function clearSignature(){const c=$('sigCanvas');c.getContext('2d').clearRect(0,0,c.width,c.height);alertMsg('Signature cleared')}
window.addEventListener('DOMContentLoaded',()=>{loadLogin();loadSettings();loadClocks();loadFields();initSig();renderAll();setInterval(()=>{renderClocks();updateFinance();saveClocks()},1000);if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{})});

/* ===== RW FINAL WORKFLOW UPGRADE: one-clock, smart parts, quote approval, finance, accessibility ===== */
let activeClock = store.get('activeClock','A') || 'A';
function safeSet(id, value){ const el=$(id); if(el) el.textContent=value; }
function safeVal(id, value){ const el=$(id); if(el) el.value=value ?? ''; }
function clockStatus(k){ const c=clocks[k]||{}; if(c.running) return 'RUNNING'; if(c.status==='STOPPED') return 'STOPPED'; if(c.elapsed) return 'PAUSED'; return 'READY'; }
function selectClock(k){ activeClock=k; store.set('activeClock',k); ['A','B','C'].forEach(x=>$('tab'+x)?.classList.toggle('active',x===k)); renderClocks(); }
function loadClocks(){ clocks={A:{elapsed:0,running:false,start:0,label:'',status:'READY'},B:{elapsed:0,running:false,start:0,label:'',status:'READY'},C:{elapsed:0,running:false,start:0,label:'',status:'READY'},...store.get('clocks',{})}; activeClock=store.get('activeClock','A')||'A'; }
function saveClocks(){ const ac=$('activeClockLabel'); if(ac && clocks[activeClock]) clocks[activeClock].label=ac.value; store.set('clocks',clocks); store.set('activeClock',activeClock); }
function clockStart(k){ const c=clocks[k]; if(!c.running){ c.running=true; c.start=Date.now(); c.status='RUNNING'; alertMsg('Clock '+k+' running'); } saveClocks(); renderClocks(); }
function clockPause(k){ const c=clocks[k]; if(c.running){ c.elapsed+=Date.now()-c.start; c.running=false; } if(c.elapsed) c.status='PAUSED'; alertMsg('Clock '+k+' paused'); saveClocks(); renderClocks(); }
function clockStop(k){ const c=clocks[k]; if(c.running){ c.elapsed+=Date.now()-c.start; c.running=false; } c.status='STOPPED'; alertMsg('Clock '+k+' stopped'); saveClocks(); renderClocks(); try{ supabaseInsert('clock_entries',{clock_name:k,customer:store.get('customer',{}).name||'',truck_vin:store.get('truck',{}).vin||'',hours:+hours(k).toFixed(2),labor_rate:settings().rate,total:+(hours(k)*settings().rate).toFixed(2),status:'stopped',created_at:new Date().toISOString()}); }catch(e){} }
function clockReset(k){ clocks[k]={elapsed:0,running:false,start:0,label:'',status:'READY'}; if(activeClock===k) safeVal('activeClockLabel',''); saveClocks(); renderClocks(); alertMsg('Clock '+k+' cleared'); }
function clockToInvoice(k){ const h=hours(k), total=h*settings().rate; safeVal('quoteHours', h.toFixed(2)); const label=(clocks[k].label||'Labor'); $('invoiceNotes').value+=`\nClock ${k}: ${label} — ${h.toFixed(2)} hrs — ${money(total)}`; addHistory('clock_to_invoice',`Clock ${k} sent to invoice: ${h.toFixed(2)} hrs ${money(total)}`); show('invoice'); }
function renderClocks(){
  ['A','B','C'].forEach(k=>{ const ms=clockMs(k), sec=Math.floor(ms/1000), h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60; const text=[h,m,s].map(x=>String(x).padStart(2,'0')).join(':'); const amount=money(ms/36e5*(+$('quoteRate')?.value||settings().rate)); const status=clockStatus(k); safeSet('chip'+k,status); const tab=$('tab'+k); if(tab){tab.classList.toggle('running',status==='RUNNING');tab.classList.toggle('paused',status==='PAUSED');tab.classList.toggle('stopped',status==='STOPPED');tab.classList.toggle('active',activeClock===k);} });
  const k=activeClock, ms=clockMs(k), sec=Math.floor(ms/1000), h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60; safeSet('activeClockName',k); safeSet('activeClockStatus',clockStatus(k)); safeSet('activeClockTime',[h,m,s].map(x=>String(x).padStart(2,'0')).join(':')); safeSet('activeClockMoney',money(ms/36e5*(+$('quoteRate')?.value||settings().rate))); safeVal('activeClockLabel',clocks[k]?.label||''); const c=store.get('customer',{}), t=store.get('truck',{}); safeSet('activeClockCustomer',c.name||'NO CUSTOMER'); safeSet('activeClockTruck',t.vin||t.unit||'NO TRUCK'); }
function startJobWizard(){ const c=$('jobCustomer').value.trim() || store.get('customer',{}).name || ''; const t=$('jobTruck').value.trim() || store.get('truck',{}).vin || ''; const k=$('jobClock').value||'A'; const mode=$('jobMode').value||'shop'; if(c) { const cur=store.get('customer',{}); cur.name=c; store.set('customer',cur); safeVal('custName',c); } if(t){ const tr=store.get('truck',{}); if(t.length>=10) tr.vin=t.toUpperCase(); else tr.unit=t; store.set('truck',tr); safeVal('vin',tr.vin||''); safeVal('unit',tr.unit||''); } setMode(mode); selectClock(k); clocks[k].label=$('jobNote').value.trim()||'Active Job'; clockStart(k); $('jobOut').textContent=`Started Clock ${k}\nCustomer: ${c||'—'}\nTruck: ${t||'—'}\nMode: ${mode}`; addHistory('job_started',$('jobOut').textContent); renderAll(); }
function clearStartJob(){ ['jobCustomer','jobTruck','jobNote'].forEach(id=>safeVal(id,'')); $('jobOut').textContent=''; }
function jobToQuote(){ const note=$('jobNote').value.trim(); if(note){$('quoteJob').value=note.split('\n')[0]; $('quoteDesc').value=note;} autoBuildFromWords(note||$('quoteJob').value||'diagnostic'); show('quote'); }
function getPartsLines(){ return store.get('partsLines',[]); }
function savePartsLines(list){ store.set('partsLines',(list||[]).slice(0,100)); }
function addPartsLineObj(p){ const list=getPartsLines(); list.push({part:p.part||p.number||'',desc:p.desc||p.description||p.part||'Part',vendor:p.vendor||'',qty:+p.qty||1,cost:+p.cost||+p.price||0,source:p.source||'manual'}); savePartsLines(list); renderPartsLines(); }
function renderPartsLines(){ const list=getPartsLines(); const box=$('partsOut'); if(!box) return; if(!list.length && !box.innerHTML) return; const html=list.map((p,i)=>`<div class="partResult"><b>${esc(p.part||'PART')}</b><span>${esc(p.desc||'')}</span><small>${esc(p.vendor||'')} Qty ${p.qty||1} Cost ${money(p.cost||0)}</small><button onclick="removePartsLine(${i})">Remove</button></div>`).join(''); const existing=box.dataset.searchHtml||''; box.innerHTML=existing+(html?`<h3>JOB PARTS</h3>${html}`:''); }
function removePartsLine(i){ const l=getPartsLines(); l.splice(i,1); savePartsLines(l); $('partsOut').dataset.searchHtml=''; renderPartsLines(); }
function localPartHits(q){ const parts=[['4376357','Cummins ISX Water Pump','Cooling'],['2881753','Cummins ISX Turbocharger','Air'],['4954200','Cummins ISX Fuel Injector','Fuel'],['4309129','Cummins ISX NOx Sensor','Emissions'],['A4722001601','Detroit DD15 Water Pump','Cooling'],['A4710902552','Detroit DD15 Fuel Filter','Fuel'],['2293961','PACCAR MX-13 NOx Sensor','Emissions'],['1931652','PACCAR MX-13 Turbo Actuator','Air'],['1831541','PACCAR MX-13 Fan Clutch','Cooling'],['1848410C94','International DT466 ICP Sensor','Sensors'],['1830669C92','International DT466 IPR Valve','Fuel'],['1876105C95','MaxxForce 13 EGR Valve','Emissions'],['3007353C92','Navistar A26 Oil Cooler','Cooling'],['4707','16.5 x 7 Brake Shoes / Lining','Brakes'],['KIT-BRAKE-1657','16.5 x 7 Brake Job Kit: shoes, drums, hardware, seals as needed','Brakes']]; const s=q.toLowerCase(); return parts.filter(p=>p.join(' ').toLowerCase().includes(s)||s.split(/\s+/).some(w=>w.length>2&&p.join(' ').toLowerCase().includes(w))); }
function renderPartSearchCards(hits,q,backendNote=''){ const html=hits.length?hits.map((p,i)=>`<div class="partResult"><b>${esc(p[0])}</b><span>${esc(p[1])}</span><small>${esc(p[2])} • VERIFY BY VIN/ESN BEFORE ORDERING</small><button onclick="addSearchHitToQuote(${i})">Add to Quote</button><button onclick="addSearchHitToInvoice(${i})">Add to Invoice</button></div>`).join(''):`<div class="partResult"><b>No local match</b><span>${esc(q)}</span><small>Try supplier buttons or backend search.</small></div>`; store.set('lastPartHits',hits); $('partsOut').dataset.searchHtml=`${backendNote?`<div class="smartNote">${esc(backendNote)}</div>`:''}${html}`; $('partsOut').innerHTML=$('partsOut').dataset.searchHtml; renderPartsLines(); }
async function lookupPart(){ const q=$('partQuery').value.trim(); if(!q)return alert('Enter part'); $('partsOut').innerHTML='Searching inside app first...'; const hits=localPartHits(q); renderPartSearchCards(hits,q); try{ const x=await tryBackend('/api/parts',{q,query:q,vehicle:store.get('truck',{})}); const note=formatBackendPart(x,q); if(note) $('partsOut').dataset.searchHtml=`<pre class="backendResult">${esc(note)}</pre>`+($('partsOut').dataset.searchHtml||''); $('partsOut').innerHTML=$('partsOut').dataset.searchHtml; renderPartsLines(); alertMsg('Parts search complete'); }catch(e){ alertMsg('Local parts shown. Backend unavailable.'); } }
function addSearchHitToQuote(i){ const h=store.get('lastPartHits',[])[i]; if(!h)return; $('quoteDesc').value+=`\nPart needed: ${h[0]} — ${h[1]}`; addPartsLineObj({part:h[0],desc:h[1],source:'lookup'}); show('quote'); }
function addSearchHitToInvoice(i){ addSearchHitToQuote(i); $('invoiceNotes').value+=`\nPart needed: ${$('quoteDesc').value.split('\n').pop()}`; show('invoice'); }
function addPartLine(){ const q=$('partQuery').value.trim(); if(!q)return; addPartsLineObj({part:q,desc:q,source:'manual'}); $('quoteDesc').value+='\nPart needed: '+q; alertMsg('Part added to quote'); }
function addPartToInvoice(){ const q=$('partQuery').value.trim(); if(q) addPartsLineObj({part:q,desc:q,source:'manual'}); $('invoiceNotes').value+='\nPart needed: '+(q||'scanned/selected part'); show('invoice'); }
function clearParts(){ $('partQuery').value=''; $('partsOut').innerHTML=''; $('partsOut').dataset.searchHtml=''; savePartsLines([]); }
function parsedScan(){ const text=$('scanText').value||''; const prices=[...(text.matchAll(/\$?\s*(\d{1,5}\.\d{2})/g))].map(m=>m[1]); const part=(text.match(/\b(?:[A-Z]{1,5}[- ]?)?\d{3,10}[A-Z0-9-]{0,8}\b/i)||[''])[0].replace(/\s+/g,''); const vendor=(text.match(/(FleetPride|NAPA|O.?Reilly|TruckPro|Cummins|Detroit|Peterbilt|Kenworth|Freightliner|Rush|Wiers)/i)||[''])[0]; const qty=(text.match(/\bQTY\s*[:#]?\s*(\d+)/i)||['','1'])[1]; return{part,price:prices.pop()||'',vendor,qty,text}; }
function parseScan(){ const p=parsedScan(); $('scanOut').textContent=`VENDOR: ${p.vendor||'UNKNOWN'}\nPART: ${p.part||'UNKNOWN'}\nQTY: ${p.qty||'1'}\nPRICE: ${p.price||'UNKNOWN'}\nTYPE: ${$('scanType').value}`; if(p.part||p.price) addPartsLineObj({part:p.part,desc:'Scanned receipt/part',vendor:p.vendor,qty:p.qty,cost:p.price,source:'ocr'}); }
function scanToQuote(){ parseScan(); const p=parsedScan(); if(p.price) $('quoteParts').value=(+$('quoteParts').value||0)+parseFloat(p.price)*(+p.qty||1); if(p.part) $('quoteDesc').value+=`\nScanned part: ${p.part} ${p.vendor?`(${p.vendor})`:''} ${p.price?money(p.price):''}`; show('quote'); }
function scanToInvoice(){ scanToQuote(); $('invoiceNotes').value+='\nSCAN LINE:\n'+$('scanOut').textContent; show('invoice'); }
function quoteSigData(){ const c=$('quoteSigCanvas'); return c?c.toDataURL('image/png'):''; }
function quoteSigned(){ const c=$('quoteSigCanvas'); return c?!isCanvasBlank(c):false; }
function buildQuote(){ const x=calcTotals(); const parts=getPartsLines(); const partsHtml=parts.length?`<div class="rw-section"><h3>Parts Needed</h3>${parts.map(p=>`<p><b>${esc(p.part||'PART')}</b> — ${esc(p.desc||'')} ${p.cost?money(p.cost):''}</p>`).join('')}</div>`:''; let sig=''; if(quoteSigned()) sig=`<div class="rw-sig-block"><b>Customer Quote Approval Signature</b><img src="${quoteSigData()}" alt="Quote signature"></div>`; $('quoteOut').innerHTML=invoiceHeader('QUOTE')+`<div class="rw-section"><h3>${esc($('quoteJob').value||'Quote')}</h3><p>${esc($('quoteDesc').value||'').replace(/\n/g,'<br>')}</p></div>${partsHtml}${invoiceMoneyTable(x)}${invoiceTerms()}${sig}</div>`; store.set('lastQuote',{...x,html:$('quoteOut').innerHTML,plain:$('quoteOut').innerText,status:quoteSigned()?'approved_signed':'draft',signed:quoteSigned(),date:now()}); updateFinance(); alertMsg(quoteSigned()?'Signed quote built':'Quote built'); }
function clearQuote(){ ['quoteJob','quoteHours','quoteParts','quoteDesc'].forEach(id=>$(id).value=''); $('quoteOut').innerHTML=''; clearQuoteSignature(); }
function sendQuoteText(){ buildQuote(); const c=store.get('customer',{}); location.href=`sms:${c.phone||''}?&body=${encodeURIComponent($('quoteOut').innerText+'\n\nReply APPROVED or sign in person to approve.')}`; }
async function approveQuote(){ buildQuote(); const q=store.get('lastQuote',{}); q.status='approved'; q.signed=quoteSigned(); store.set('lastQuote',q); const list=store.get('quotes',[]); list.unshift(q); store.set('quotes',list); try{ await supabaseInsert('quotes',{customer:store.get('customer',{}).name||'',truck_vin:store.get('truck',{}).vin||'',description:$('quoteDesc').value,total:q.total,status:q.status,created_at:new Date().toISOString()}); alertMsg('Quote approved + saved'); }catch(e){ alertMsg('Quote approved local only'); } }
function quoteToInvoice(){ buildQuote(); const q=store.get('lastQuote',{}); $('invoiceNotes').value=`APPROVED QUOTE\n${$('quoteOut').innerText}`; store.set('lastQuote',{...q,status:q.status||'converted'}); show('invoice'); }
function clearQuoteSignature(){ const c=$('quoteSigCanvas'); if(c) c.getContext('2d').clearRect(0,0,c.width,c.height); }
function buildOneInvoice(copyTitle,x,signed){ const work=esc($('invoiceNotes').value||$('quoteDesc').value||'').replace(/\n/g,'<br>'); const paid=+$('amountPaid')?.value||0; const status=$('paymentStatus')?.value||'Unpaid'; const balance=Math.max(0,x.total-paid); let html=invoiceHeader(copyTitle)+`<div class="rw-section"><h3>Work Performed / Invoice Notes</h3><p>${work||'—'}</p></div>`+invoiceMoneyTable(x)+`<div class="rw-money-table"><div><span>Payment Status</span><b>${esc(status)}</b></div><div><span>Amount Paid</span><b>${money(paid)}</b></div><div class="rw-total"><span>Balance Due</span><b>${money(balance)}</b></div></div>`+invoiceTerms()+`<div class="rw-sig-block"><b>Customer Signature</b>`; if(signed) html+=`<img src="${sigData()}" alt="Customer signature">`; else html+=`<div class="rw-not-signed">NOT SIGNED</div>`; html+=`</div></div>`; return html; }
function saveInvoice(){ buildInvoice(); const inv=store.get('lastInvoice',{}); const list=store.get('invoices',[]); list.unshift(inv); store.set('invoices',list); addHistory('invoice_saved',`Invoice saved: ${money(inv.total||0)} ${$('paymentStatus')?.value||''}`); try{ supabaseInsert('invoices',{customer:store.get('customer',{}).name||'',truck_vin:store.get('truck',{}).vin||'',total:inv.total,signature:inv.signed?'signed':'',status:$('paymentStatus')?.value||'Unpaid',created_at:new Date().toISOString()}); alertMsg('Invoice saved local + Supabase'); }catch(e){ alertMsg('Invoice saved local. Supabase unavailable.'); } updateFinance(); }
function readDocument(id){ const txt=$(id)?.innerText||''; if(!txt)return alert('Nothing to read'); if(!('speechSynthesis'in window))return alert('Read aloud not supported'); speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(txt.slice(0,2500)); u.rate=.92; speechSynthesis.speak(u); }
function setAccessMode(m){ document.body.classList.remove('largeText','highContrast','colorBlind','simpleMode'); if(m==='large')document.body.classList.add('largeText'); if(m==='contrast')document.body.classList.add('highContrast'); if(m==='colorblind')document.body.classList.add('colorBlind'); const s=settings(); s.accessMode=m; store.set('settings',s); }
function saveFinanceSettings(){ const s=settings(); s.rent=+$('rent').value||0; s.insurance=+$('insurance').value||0; s.electric=+$('electric').value||0; s.other=+$('otherExpense').value||0; s.weeklyGoal=+$('weeklyGoal').value||0; s.partsBudget=+$('partsBudget').value||0; store.set('settings',s); updateFinance(); alertMsg('Finance settings saved'); }
function clearFinance(){ ['rent','insurance','electric','otherExpense','weeklyGoal','partsBudget'].forEach(id=>safeVal(id,'')); updateFinance(); }
function updateFinance(){ const s=settings(); const inv=store.get('invoices',[]).reduce((sum,i)=>sum+(+i.total||0),0); const h=['A','B','C'].reduce((sum,k)=>sum+hours(k),0), labor=h*s.rate; const over=(+$('rent').value||s.rent||0)+ (+$('insurance').value||s.insurance||0)+ (+$('electric').value||s.electric||0)+ (+$('otherExpense').value||s.other||0); const weekly=+$('weeklyGoal')?.value||s.weeklyGoal||0; const parts=+$('quoteParts')?.value||0; const needed= s.rate ? over/s.rate : 0; safeSet('finLabor',money(labor)); safeSet('finParts',money(parts)); safeSet('finInvoices',money(inv)); safeSet('finBreakEven',money(over)); safeSet('finHoursNeeded',needed.toFixed(1)); safeSet('finWeeklyTarget',money(weekly)); safeSet('finProfit',money(inv+labor-over-parts)); safeSet('finCashNeed',money(Math.max(0,over-(inv+labor)))); const advice=$('financeAdvice'); if(advice) advice.textContent=`Monthly overhead: ${money(over)}\nBillable hours needed at ${money(s.rate)}/hr: ${needed.toFixed(1)}\nWeekly goal: ${money(weekly)}\nSuggested daily target: ${money(weekly/5)}\nCurrent projected profit: ${money(inv+labor-over-parts)}`; }
function addHistory(type,note){ const h=store.get('history',[]); const c=store.get('customer',{}), t=store.get('truck',{}); h.unshift({type,note,date:now(),customer:c.name||'',truck:t.vin||t.unit||''}); store.set('history',h.slice(0,200)); }
function renderHistory(){ const h=store.get('history',[]); $('historyOut').textContent=h.length?h.map(x=>`${x.date} — ${x.type}\nCustomer: ${x.customer||'—'} Truck: ${x.truck||'—'}\n${x.note}`).join('\n\n'):'NO HISTORY YET'; }
function clearHistory(){ if(confirm('Clear local history?')){store.set('history',[]);renderHistory();} }
function renderAll(){ const t=store.get('truck',{}), c=store.get('customer',{}); $('activeTruckBox').innerHTML=t.vin?`${esc(t.unit||'')} ${esc(t.year||'')} ${esc(t.make||'')} ${esc(t.model||'')}<br>${esc(t.engine||'')}<br>${esc(t.vin||'')}`:'NO ACTIVE TRUCK'; $('activeCustomerBox').innerHTML=c.name?`${esc(c.name)}<br>${esc(c.phone||'')}<br>${esc(c.email||'')}`:'NO CUSTOMER SELECTED'; renderClocks(); renderAlerts(); renderSchedule(); updateFinance(); }
function loadSettings(){ const s=settings(); $('quoteRate').value=s.rate; $('serviceCall').value=s.service; $('taxRate').value=s.tax; $('cardFee').value=s.card; $('partsMarkup').value=s.markup; $('rent').value=s.rent; $('insurance').value=s.insurance; $('electric').value=s.electric; $('otherExpense').value=s.other; safeVal('weeklyGoal',s.weeklyGoal||''); safeVal('partsBudget',s.partsBudget||''); $('backendUrl').value=s.backend; $('supabaseUrl').value=s.supabase; $('supabaseKey').value=s.supabaseKey; $('setRate').value=s.rate; $('ownerName').value=s.owner||localStorage.getItem('employeeName')||'James Jacobs'; $('theme').value=s.theme||'green'; if($('bgStyle')) $('bgStyle').value=s.background||'carbon'; if($('layoutStyle')) $('layoutStyle').value=s.layout||'tablet'; if($('accessMode')) $('accessMode').value=s.accessMode||'normal'; setTheme(s.theme||'green'); setBackground(s.background||'carbon'); setLayout(s.layout||'tablet'); setAccessMode(s.accessMode||'normal'); setMode(s.mode||'shop'); }
function initSignatureCanvas(id){ const canvas=$(id); if(!canvas) return; const ctx=canvas.getContext('2d'); function resize(){ const ratio=Math.max(devicePixelRatio||1,1), rect=canvas.getBoundingClientRect(); canvas.width=Math.max(1,rect.width*ratio); canvas.height=190*ratio; ctx.scale(ratio,ratio); ctx.lineWidth=4; ctx.lineCap='round'; ctx.strokeStyle='#000'; } setTimeout(resize,80); let drawing=false; function pos(e){ const r=canvas.getBoundingClientRect(); return{x:e.clientX-r.left,y:e.clientY-r.top}; } function start(e){ drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); canvas.setPointerCapture?.(e.pointerId); e.preventDefault(); } function move(e){ if(!drawing)return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault(); } function end(e){ drawing=false; e.preventDefault(); } canvas.addEventListener('pointerdown',start); canvas.addEventListener('pointermove',move); canvas.addEventListener('pointerup',end); canvas.addEventListener('pointercancel',end); }
function initSig(){ initSignatureCanvas('sigCanvas'); initSignatureCanvas('quoteSigCanvas'); }
