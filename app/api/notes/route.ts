import {authorized,run,json,body,HttpError,cleanNote} from '../../../lib/api';
import {validNote} from '../../../lib/validation';
export const PUT=(req:Request)=>run(async()=>{
 const {user,db}=await authorized(req);const d=await body(req);if(!validNote(d))throw new HttpError(400,'Ghi chú hoặc phiên bản không hợp lệ (tối đa 30.000 ký tự).');
 const now=new Date().toISOString();
 const results=await db.batch([
 db.prepare('INSERT INTO note_history (id,user_id,lesson_id,text,revision,updated_at) SELECT ?,user_id,lesson_id,text,revision,updated_at FROM notes WHERE user_id=? AND lesson_id=? AND revision=?').bind(crypto.randomUUID(),user.userId,d.lessonId,d.expectedRevision),
 db.prepare('INSERT INTO notes (user_id,lesson_id,text,revision,updated_at) SELECT ?,?,?,1,? WHERE ?=0 OR EXISTS (SELECT 1 FROM notes WHERE user_id=? AND lesson_id=?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET text=excluded.text,revision=notes.revision+1,updated_at=excluded.updated_at WHERE notes.revision=? RETURNING *').bind(user.userId,d.lessonId,d.text,now,d.expectedRevision,user.userId,d.lessonId,d.expectedRevision)
 ]);
 const changed=results[1].results[0];if(!changed){const current=await db.prepare('SELECT * FROM notes WHERE user_id=? AND lesson_id=?').bind(user.userId,d.lessonId).first();return json({error:'Ghi chú đã thay đổi trên thiết bị khác. Hãy giữ bản nháp và chọn cách hợp nhất.',current:current?cleanNote(current):null},409);}
 return json({note:cleanNote(changed)});
});
export const GET=(req:Request)=>run(async()=>{const {user,db}=await authorized(req);const lessonId=new URL(req.url).searchParams.get('lessonId');const rows=await db.prepare('SELECT * FROM note_history WHERE user_id=? AND lesson_id=? ORDER BY revision DESC LIMIT 30').bind(user.userId,lessonId||'').all();return json({history:rows.results.map(cleanNote)});});
