export const validLessonId=(value:unknown):value is string=>typeof value==='string'&&/^c\d{2}-l\d{2}$/.test(value);
export type NoteInput={lessonId:string;text:string;expectedRevision:number};
export type ProgressInput={lessonId:string;status:'unread'|'read'|'practiced'|'verified';checks:string[]};
export type BackupInput={version:1;notes:Array<Pick<NoteInput,'lessonId'|'text'>>;progress:ProgressInput[]};
const record=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null;
export function validNote(data:unknown):data is NoteInput{return record(data)&&validLessonId(data.lessonId)&&typeof data.text==='string'&&data.text.length<=30000&&Number.isInteger(data.expectedRevision)&&Number(data.expectedRevision)>=0;}
export function validProgress(data:unknown):data is ProgressInput{return record(data)&&validLessonId(data.lessonId)&&typeof data.status==='string'&&['unread','read','practiced','verified'].includes(data.status)&&Array.isArray(data.checks)&&data.checks.length<=80&&data.checks.every((c:unknown)=>typeof c==='string'&&c.length<=1000);}
export function validateBackup(data:unknown):data is BackupInput{
 if(!record(data)||data.version!==1||!Array.isArray(data.notes)||!Array.isArray(data.progress)||data.notes.length>500||data.progress.length>500)return false;
 return data.notes.every((n:unknown)=>record(n)&&validLessonId(n.lessonId)&&typeof n.text==='string'&&n.text.length<=30000)&&data.progress.every(validProgress);
}
