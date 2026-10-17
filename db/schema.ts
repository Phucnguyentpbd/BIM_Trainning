import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const notes = sqliteTable('notes', {
 userId: text('user_id').notNull(), lessonId: text('lesson_id').notNull(), text: text('text').notNull(), revision: integer('revision').notNull().default(1), updatedAt: text('updated_at').notNull(),
}, t => [primaryKey({columns:[t.userId,t.lessonId]})]);
export const noteHistory = sqliteTable('note_history', {
 id: text('id').primaryKey(),userId:text('user_id').notNull(),lessonId:text('lesson_id').notNull(),text:text('text').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),
});
export const progress = sqliteTable('progress', {
 userId:text('user_id').notNull(),lessonId:text('lesson_id').notNull(),status:text('status').notNull(),checks:text('checks').notNull().default('[]'),updatedAt:text('updated_at').notNull(),
}, t => [primaryKey({columns:[t.userId,t.lessonId]})]);
export const attachments = sqliteTable('attachments', {
 id:text('id').primaryKey(),userId:text('user_id').notNull(),lessonId:text('lesson_id').notNull(),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),createdAt:text('created_at').notNull(),deletedAt:text('deleted_at'),
});
export const aiUsage = sqliteTable('ai_usage', {
 userId:text('user_id').notNull(),day:text('day').notNull(),count:integer('count').notNull().default(0),
},t=>[primaryKey({columns:[t.userId,t.day]})]);
