import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
type DatabaseRow = Record<string, unknown>;
const databaseRow=(value:unknown):DatabaseRow=>typeof value==='object'&&value!==null?value as DatabaseRow:{};
export async function authorized(req:Request){
 const user=await getChatGPTUser();if(!user)throw new HttpError(401,'Vui lòng đăng nhập để dùng dữ liệu cá nhân.');
 if(!['GET','HEAD'].includes(req.method)){
  const origin=req.headers.get('origin');
  if(origin&&origin!==new URL(req.url).origin)throw new HttpError(403,'Nguồn yêu cầu không hợp lệ.');
  if(req.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Yêu cầu khác trang đã bị chặn.');
 }
 if(!env.DB)throw new HttpError(503,'Kho dữ liệu chưa sẵn sàng.');
 return {user,db:env.DB};
}
export async function body(req:Request,limit=100000){
 const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Thiếu dữ liệu.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new HttpError(413,'Dữ liệu quá lớn.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes)) as unknown;}catch{throw new HttpError(400,'Dữ liệu JSON không hợp lệ.');}
}
export const run=(fn:()=>Promise<Response>)=>fn().catch(e=>{if(e instanceof HttpError)return json({error:e.message},e.status);console.error('API request failed',e?.name||'Error');return json({error:'Không thể xử lý lúc này. Dữ liệu chưa lưu vẫn được giữ trên màn hình.'},500);});
export function cleanNote(value:unknown){const row=databaseRow(value);return {lessonId:String(row.lesson_id||''),text:String(row.text||''),revision:Number(row.revision||0),updatedAt:String(row.updated_at||'')};}
export function cleanProgress(value:unknown){const row=databaseRow(value);let checks:string[]=[];try{checks=JSON.parse(String(row.checks||'[]'));}catch{}return {lessonId:String(row.lesson_id||''),status:String(row.status||'unread'),checks,updatedAt:String(row.updated_at||'')};}
