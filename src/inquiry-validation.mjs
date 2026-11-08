export function validateInquiry(input, now = Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error:'Invalid submission.'};
  const clean = (key, max) => typeof input[key] === 'string' ? input[key].trim().slice(0, max) : '';
  const value = {id:clean('id',50),name:clean('name',100),email:clean('email',254),phone:clean('phone',40),method:clean('method',20),watch:clean('watch',1000),callbackAt:clean('callbackAt',50),timezone:clean('timezone',100),message:clean('message',2500),photos:input.photos===true,attribution:clean('attribution',1500)};
  if(clean('website',100))return {error:'Please contact CLE Watches on Instagram.'};
  if(!/^[a-f0-9-]{36}$/i.test(value.id))return {error:'Please refresh and try again.'};
  if(value.name.length<2)return {error:'Enter your name.'};
  if(value.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))return {error:'Enter a valid email address or leave the optional email field empty.'};
  if(value.phone&&(!/^\+?[\d\s().-]{7,40}$/.test(value.phone)||value.phone.replace(/\D/g,'').length<7||value.phone.replace(/\D/g,'').length>15))return {error:'Enter a valid phone number, including the country code.'};
  if(!['email','callback'].includes(value.method)||!value.watch||input.consent!==true)return {error:'Choose your inquiry method, watch and contact permission.'};
  if(value.method==='callback'){
    if(!value.phone)return {error:'Enter a callback number, including the country code.'};
    if(value.callbackAt){const time=Date.parse(value.callbackAt);
    if(!Number.isFinite(time)||time<now+300000||time>now+31*86400000)return {error:'Choose a callback time at least five minutes from now and within 30 days.'};}
    try{if(!value.timezone)throw Error();new Intl.DateTimeFormat('en',{timeZone:value.timezone})}catch{return {error:'Choose a valid timezone.'}}
  }else{if(!value.email)return {error:'Enter an email address for your email quote.'};value.callbackAt='';}
  return {value};
}
