import { env } from 'cloudflare:workers';
import {authorized,run,json,cleanNote,cleanProgress} from '../../../lib/api';
export const GET=(req:Request)=>run(async()=>{const {user,db}=await authorized(req);const [n,p]=await Promise.all([db.prepare('SELECT * FROM notes WHERE user_id = ?').bind(user.userId).all(),db.prepare('SELECT * FROM progress WHERE user_id = ?').bind(user.userId).all()]);return json({notes:n.results.map(cleanNote),progress:p.results.map(cleanProgress),user:{name:user.displayName,email:user.email},aiConfigured:!!env.GEMINI_API_KEY});});
