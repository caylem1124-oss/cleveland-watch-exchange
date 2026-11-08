'use strict';
(() => {
 const get=id=>document.getElementById(id),form=get('saintInquiry'),dialog=get('inquiryDialog');
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
 let config={submissionsEnabled:false,email:'',phone:''},requestId=crypto.randomUUID();
 if(new URLSearchParams(location.search).get('page')==='privacy')get('privacyPage').hidden=false;
 get('timezoneLabel').textContent='Your timezone: '+zone;
 const localMin=new Date(Date.now()+10*60000);const offset=localMin.getTimezoneOffset()*60000;
 form.elements.callbackLocal.min=new Date(localMin.getTime()-offset).toISOString().slice(0,16);
 const updateMethod=()=>{const callback=form.elements.method.value==='callback';get('callbackTimeLabel').hidden=!callback;form.elements.callbackLocal.required=false;form.elements.phone.required=callback;form.elements.email.required=!callback;get('emailHint').textContent=callback?'(optional)':'(required for email quotes)';get('phoneHint').textContent=callback?'(required for callbacks)':'(optional)';get('submitInquiry').textContent=callback?'Request a callback ↗':'Request an email quote ↗'};
 form.querySelectorAll('[name=method]').forEach(x=>x.addEventListener('change',updateMethod));
 window.openSaintInquiry=(method='callback',product=null)=>{
   document.querySelectorAll('dialog[open]').forEach(x=>x.close());
   form.elements.method.value=method;
   const selection=product?[product]:typeof saved!=='undefined'?saved.map(id=>byId.get(id)).filter(Boolean):[];
   form.elements.watch.value=selection.map(p=>p.title+(p.reference?' · Ref '+p.reference:'')+(p.sku?' · SKU '+p.sku:'')+' [ID '+p.id+']').join('\n').slice(0,1000);
   get('inquiryStatus').textContent='';updateMethod();dialog.showModal();
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-inquire]');if(b){e.preventDefault();window.openSaintInquiry(b.dataset.inquire)}});
 const attribution=()=>JSON.stringify(Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].filter(k=>new URLSearchParams(location.search).has(k)).map(k=>[k,new URLSearchParams(location.search).get(k)?.slice(0,150)])));
 get('copyContactInquiry').onclick=async()=>{
   const data=new FormData(form),callback=data.get('method')==='callback';
   const message=['Hi CLE Watches,',String(data.get('watch')||'I would like help finding a watch.'),`Preferred contact: ${callback?'Callback':'Email'}`,data.get('name')?`Name: ${data.get('name')}`:'',data.get('email')?`Email: ${data.get('email')}`:'',data.get('phone')?`Phone: ${data.get('phone')}`:'',callback&&data.get('callbackLocal')?`Preferred time: ${data.get('callbackLocal')} (${zone})`:'',data.has('photos')?'Please send photos or video of the exact piece.':'',String(data.get('message')||'')].filter(Boolean).join('\n\n');
   try{await navigator.clipboard.writeText(message);get('inquiryStatus').textContent='Copied. Open Instagram and paste your inquiry. Nothing has been sent yet.'}catch{get('inquiryStatus').textContent='Clipboard unavailable. Please message CLE Watches directly on Instagram.'}
 };
 const loadConfig=async()=>{
   try{const res=await fetch('/api/contact-config');if(!res.ok)throw Error();config=await res.json()}catch{}
   get('submitInquiry').disabled=!config.submissionsEnabled;
   get('inquirySetup').hidden=!!config.submissionsEnabled;
   get('inquirySetup').textContent='Online quote and callback requests are being set up. For now, copy your details below and send them to CLE Watches on Instagram.';
   const container=get('directContact');
   if(config.email){const a=document.createElement('a');a.className='underlink';a.href='mailto:'+config.email;a.textContent='Email '+config.email+' ↗';container.append(a)}
   if(config.phone){const a=document.createElement('a');a.className='underlink';a.href='tel:'+config.phone.replace(/[^+\d]/g,'');a.textContent='Call '+config.phone+' ↗';container.append(a)}
 };
 form.onsubmit=async e=>{
   e.preventDefault();if(!config.submissionsEnabled){get('inquiryStatus').textContent='Please message CLE Watches on Instagram while online requests are being set up.';return}
   if(!form.reportValidity())return;
   const d=new FormData(form);let callbackAt='';
   if(d.get('method')==='callback'&&d.get('callbackLocal')){
     const time=new Date(String(d.get('callbackLocal')));
     if(!Number.isFinite(time.getTime())||time.getTime()<Date.now()+300000||time.getTime()>Date.now()+31*86400000){get('inquiryStatus').textContent='Choose a time at least five minutes from now and within 30 days.';return}callbackAt=time.toISOString();
   }
   get('submitInquiry').disabled=true;get('inquiryStatus').textContent='Sending your inquiry…';
   try{
     const res=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:requestId,name:d.get('name'),email:d.get('email'),phone:d.get('phone'),method:d.get('method'),watch:d.get('watch'),callbackAt,timezone:zone,message:d.get('message'),photos:d.has('photos'),consent:d.has('consent'),website:d.get('website'),attribution:attribution()})});
     const body=await res.json();if(!res.ok||!body.received)throw Error(body.error||'We could not confirm your request. Please try again.');
     get('inquiryStatus').textContent='Your inquiry has been saved. Keep this reference for follow-up: '+body.id.slice(0,8)+'.';
     requestId=crypto.randomUUID();form.reset();updateMethod();
   }catch(err){get('inquiryStatus').textContent=err.message||'Please try again or message CLE Watches on Instagram.'}
   finally{get('submitInquiry').disabled=!config.submissionsEnabled}
 };
 updateMethod();loadConfig();
})();
