import type { Chapter } from '../content/types';
export const normalize = (s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
export function retrieve(chapters:Chapter[], query:string, lessonId?:string) {
 const tokens=[...new Set(normalize(query).split(/[^a-z0-9]+/).filter(t=>t.length>1))];
 return chapters.flatMap(c=>c.lessons.map(l=>{
  const title=normalize(l.title),body=normalize([l.objective,...l.steps.flatMap(s=>[s.title,s.action,s.expected]),...l.checks,...l.mistakes.flatMap(m=>[m.symptom,m.fix])].join(' '));
  const score=tokens.reduce((n,t)=>n+(title.includes(t)?5:0)+(body.includes(t)?1:0),0)+(l.id===lessonId?1:0);
  return {lesson:l,chapter:c.title,score};
 })).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
}
