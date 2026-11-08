import { validateInquiry } from './inquiry-validation.mjs';
type InquiryEnv={DB?:D1Database;INQUIRY_TO_EMAIL?:string;EMAIL_FROM?:string;RESEND_API_KEY?:string};
const reply=(data:object,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request, env:InquiryEnv){
 const e=env as unknown as InquiryEnv;
 if(!e.DB)return reply({error:'Online requests are temporarily unavailable. Please message @clewatches on Instagram.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Please submit from the CLE Watches website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'Invalid submission.'},415);
 if(Number(request.headers.get('content-length')||0)>15000)return reply({error:'Your message is too long.'},413);
 try{
  const body=await request.text();if(body.length>15000)return reply({error:'Your message is too long.'},413);
  let input;try{input=JSON.parse(body)}catch{return reply({error:'Invalid submission.'},400)}
  const result=validateInquiry(input);if(result.error)return reply({error:result.error},400);const v=result.value!;
  const old=await e.DB.prepare('SELECT notification FROM inquiries WHERE id = ?').bind(v.id).first<{notification:string}>();
  if(old)return reply({id:v.id,received:true,notification:old.notification});
  const ip=request.headers.get('cf-connecting-ip')||'unknown';
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+new Date().toISOString().slice(0,10)));
  const key=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('')+':'+Math.floor(Date.now()/3600000);
  const limit=await e.DB.prepare('INSERT INTO inquiry_limits (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key).first<{count:number}>();
  if((limit?.count||0)>8)return reply({error:'Too many requests. Please try again later or message CLE Watches on Instagram.'},429);
  const now=new Date().toISOString();
  await e.DB.prepare('INSERT INTO inquiries (id,name,email,phone,method,watch,callback_at,timezone,message,photos,created_at,attribution,notification,status,consent_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(v.id,v.name,v.email,v.phone,v.method,v.watch,v.callbackAt||null,v.timezone,v.message,v.photos?1:0,now,v.attribution,'pending','new','inquiry-contact-v1').run();
  const text=[`CLE Watches — ${v.method==='callback'?'Callback request':'Email quote request'}`,`Reference: ${v.id}`,`Name: ${v.name}`,`Email: ${v.email}`,`Phone: ${v.phone||'Not supplied'}`,`Watch: ${v.watch}`,`Requested callback (UTC): ${v.callbackAt||'Not requested'}`,`Timezone: ${v.timezone}`,`Photos/video requested: ${v.photos?'Yes':'No'}`,`Message: ${v.message}`,`Source: ${v.attribution}`,`Received: ${now}`,'Requested time is a preference; confirm the appointment with the customer.'].join('\n\n');
  let notification='not_configured';
  if(e.INQUIRY_TO_EMAIL&&e.EMAIL_FROM&&e.RESEND_API_KEY){notification='failed';
  try{const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':v.id},body:JSON.stringify({from:e.EMAIL_FROM,to:[e.INQUIRY_TO_EMAIL],...(v.email?{reply_to:v.email}:{}),subject:`CLE Watches inquiry: ${v.method==='callback'?'Callback':'Quote'} — ${v.id.slice(0,8)}`,text}),signal:AbortSignal.timeout(10000)});if(sent.ok)notification='accepted'}catch{}}
  await e.DB.prepare('UPDATE inquiries SET notification = ? WHERE id = ?').bind(notification,v.id).run();
  return reply({id:v.id,received:true,notification},201);
 }catch{return reply({error:'We could not confirm your request. Please try again or message CLE Watches on Instagram.'},500)}
}
