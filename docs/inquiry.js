'use strict';
(() => {
 const get=id=>document.getElementById(id),form=get('saintInquiry'),dialog=get('inquiryDialog');
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
 if(new URLSearchParams(location.search).get('page')==='privacy')get('privacyPage').hidden=false;
 get('timezoneLabel').textContent='Your timezone: '+zone;
 const localMin=new Date(Date.now()+10*60000);const offset=localMin.getTimezoneOffset()*60000;
 form.elements.callbackLocal.min=new Date(localMin.getTime()-offset).toISOString().slice(0,16);

 // WhatsApp icon into every placeholder slot, and keep every plain WhatsApp link on the shared number.
 document.querySelectorAll('.wa-slot').forEach(s=>{s.outerHTML=waIcon});
 document.querySelectorAll('.js-wa').forEach(a=>{a.href=waLink(waProductMessage(null))});

 // Floating button: on a watch page it pre-fills that watch; elsewhere a general hello.
 const floatBtn=document.querySelector('.js-wa-float');
 if(floatBtn){
   const pid=new URLSearchParams(location.search).get('product');
   const product=pid&&typeof byId!=='undefined'?byId.get(pid):null;
   floatBtn.href=waLink(waProductMessage(product));
 }

 const updateMethod=()=>{const callback=form.elements.method.value==='callback';get('callbackTimeLabel').hidden=!callback;form.elements.callbackLocal.required=false;form.elements.phone.required=callback;form.elements.email.required=!callback;get('emailHint').textContent=callback?'(optional)':'(required for email quotes)';get('phoneHint').textContent=callback?'(required for callbacks)':'(optional)';get('submitLabel').textContent=callback?'Send callback request on WhatsApp ↗':'Send quote request on WhatsApp ↗'};
 form.querySelectorAll('[name=method]').forEach(x=>x.addEventListener('change',updateMethod));
 window.openSaintInquiry=(method='callback',product=null)=>{
   document.querySelectorAll('dialog[open]').forEach(x=>x.close());
   form.elements.method.value=method;
   const selection=product?[product]:typeof saved!=='undefined'?saved.map(id=>byId.get(id)).filter(Boolean):[];
   form.elements.watch.value=selection.map(p=>p.title+(p.reference&&!p.title.includes(p.reference)?' · Ref '+p.reference:'')).join('\n').slice(0,1000);form.dataset.links=selection.map(p=>location.origin+'/?product='+encodeURIComponent(p.id)).join('\n');
   get('inquiryStatus').textContent='';updateMethod();dialog.showModal();
   form.elements.watch.oninput=()=>{form.dataset.links=''};
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-inquire]');if(b){e.preventDefault();window.openSaintInquiry(b.dataset.inquire)}});

 const formatTime=value=>{const t=new Date(value);return Number.isFinite(t.getTime())?t.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ('+zone+')':''};
 const buildMessage=d=>{
   const callback=d.get('method')==='callback';
   return [
     'Hi CLE Watches,',
     callback?'I’d like to request a callback.':'I’d like to request a quote by email.',
     'Watch: '+(String(d.get('watch')||'').trim()||'I’d like help finding a watch.'),
     'Name: '+String(d.get('name')||'').trim(),
     d.get('phone')?'Phone: '+String(d.get('phone')).trim():'',
     d.get('email')?'Email: '+String(d.get('email')).trim():'',
     callback&&d.get('callbackLocal')?'Preferred callback time: '+formatTime(String(d.get('callbackLocal'))):'',
     d.has('photos')?'Please send photos or video of the exact watch.':'',
     String(d.get('message')||'').trim()?'Message: '+String(d.get('message')).trim():'',
     form.dataset.links?'\n'+form.dataset.links:''
   ].filter(Boolean).join('\n');
 };

 form.onsubmit=e=>{
   e.preventDefault();
   if(form.elements.website.value)return; // spam trap
   if(!form.reportValidity())return;
   const d=new FormData(form);
   if(d.get('method')==='callback'&&d.get('callbackLocal')){
     const time=new Date(String(d.get('callbackLocal')));
     if(!Number.isFinite(time.getTime())||time.getTime()<Date.now()+300000||time.getTime()>Date.now()+31*86400000){get('inquiryStatus').textContent='Choose a time at least five minutes from now and within 30 days.';return}
   }
   const url=waLink(buildMessage(d));
   const opened=window.open(url,'_blank');if(opened)try{opened.opener=null}catch{}
   const status=get('inquiryStatus');status.textContent='';
   const text=document.createElement('span');text.textContent='WhatsApp is opening with your request filled in. Press send in WhatsApp to reach CLE Watches. ';
   const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent='Didn’t open? Tap here ↗';
   status.append(text,link);
   if(!opened&&/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))location.href=url;
 };
 updateMethod();
})();
