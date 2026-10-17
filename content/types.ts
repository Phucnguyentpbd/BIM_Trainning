export type Step = { title: string; action: string; expected: string };
export type Source = { id: string; title: string; url: string; kind: 'official' | 'drive'; version: string };
export type Lesson = { id: string; title: string; minutes: number; objective: string; prerequisites: string[]; steps: Step[]; checks: string[]; mistakes: { symptom: string; fix: string }[]; exercise: string; deliverable: string; sourceIds: string[]; status: 'documented' | 'verified'; diagram?: 'workflow' | 'section' | 'coordinates' | 'exchange' | 'timeline'; };
export type Chapter = { id: string; order: number; title: string; software: 'Quy trình' | 'Civil 3D' | 'Navisworks' | 'InfraWorks' | 'QGIS' | '4D / 5D'; summary: string; lessons: Lesson[] };
