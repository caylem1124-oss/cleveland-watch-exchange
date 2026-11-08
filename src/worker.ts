import { POST } from './inquiries';
interface Env {
 ASSETS: {fetch(request: Request): Promise<Response>}; DB?: D1Database;
 SALES_EMAIL?: string; SALES_PHONE?: string; INQUIRY_TO_EMAIL?: string;
 EMAIL_FROM?: string; RESEND_API_KEY?: string;
}
export default {
 async fetch(request: Request, env: Env): Promise<Response> {
  const path=new URL(request.url).pathname;
  if(path==='/api/contact-config' && request.method==='GET')return Response.json({email:env.SALES_EMAIL||'',phone:env.SALES_PHONE||'',submissionsEnabled:!!env.DB,instagram:'https://www.instagram.com/clewatches/'},{headers:{'Cache-Control':'no-store'}});
  if(path==='/api/inquiries'){
   if(request.method==='POST')return POST(request,env);
   return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
  }
  // The original Sites admin header is not trusted on an independent host.
  // Review leads in your Cloudflare D1 dashboard instead.
  if(path.startsWith('/api/'))return new Response('Not found',{status:404});
  return env.ASSETS.fetch(request);
 }
};
