import {authorized,run,json,body,HttpError,cleanProgress} from '../../../lib/api';
import {validProgress} from '../../../lib/validation';
export const PUT=(req:Request)=>run(async()=>{const {user,db}=await authorized(req);const d=await body(req);if(!validProgress(d))throw new HttpError(400,'Trạng thái hoặc checklist không hợp lệ.');
 const row=await db.prepare('INSERT INTO progress (user_id,lesson_id,status,checks,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET status=excluded.status,checks=excluded.checks,updated_at=excluded.updated_at RETURNING *').bind(user.userId,d.lessonId,d.status,JSON.stringify(d.checks),new Date().toISOString()).first();return json({progress:cleanProgress(row)});
});
