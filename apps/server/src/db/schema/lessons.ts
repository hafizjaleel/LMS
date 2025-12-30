import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { modules } from "./modules";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { courseWatchedLessons } from "./course";
import { files } from "./files";


export const lessonTypeEnum = pgEnum("lesson_type", ["video", "pdf", "file", "audio", "text"]);

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lessonType: lessonTypeEnum("lesson_type").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => user.id),
  lessonOrder: integer("lesson_order").notNull(),
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  muxUploadId: text("mux_upload_id"),
  videoStatus: text("video_status"),
  videoDuration: integer("video_duration"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const lessonComments = pgTable("lesson_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  commentText: text("comment_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const lessonFiles = pgTable("lesson_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const lessonFilesRelations = relations(lessonFiles, ({ one }) => ({
  file: one(files, {
    fields: [lessonFiles.fileId],
    references: [files.id],
  }),
  lesson: one(lessons, {
    fields: [lessonFiles.lessonId],
    references: [lessons.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  uploader: one(user, {
    fields: [lessons.uploadedBy],
    references: [user.id],
  }),
  comments: many(lessonComments),
  watchedLessons: many(courseWatchedLessons),
  lessonFiles: many(lessonFiles),
}));

export const lessonCommentsRelations = relations(lessonComments, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonComments.lessonId],
    references: [lessons.id],
  }),
  user: one(user, {
    fields: [lessonComments.userId],
    references: [user.id],
  }),
}));

