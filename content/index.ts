import { bimChapters } from './bim';
import { bimSources } from './sources-bim';
import { infraGisChapters } from './infra-gis';
import { infraGisSources } from './sources-infra-gis';

export { bimChapters, bimSources, infraGisChapters, infraGisSources };

export const chapters = [...bimChapters, ...infraGisChapters].sort((a, b) => a.order - b.order);
export const sources = [...bimSources, ...infraGisSources].filter((item, i, all) => all.findIndex(s => s.id === item.id) === i);
export const lessons = chapters.flatMap(chapter => chapter.lessons.map(lesson => ({ ...lesson, chapterId: chapter.id, chapterTitle: chapter.title, software: chapter.software, chapterOrder: chapter.order })));
