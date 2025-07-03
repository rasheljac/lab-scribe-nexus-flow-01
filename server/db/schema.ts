
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// Experiments table
export const experiments = sqliteTable('experiments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['planning', 'in_progress', 'completed', 'on_hold'] }).notNull().default('planning'),
  progress: integer('progress').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  researcher: text('researcher').notNull(),
  protocols: integer('protocols').notNull().default(0),
  samples: integer('samples').notNull().default(0),
  category: text('category').notNull(),
  projectId: text('project_id'),
  folderId: text('folder_id'),
  displayOrder: integer('display_order').notNull().default(1),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// Experiment Notes table
export const experimentNotes = sqliteTable('experiment_notes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  experimentId: text('experiment_id').notNull().references(() => experiments.id),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content'),
  folderId: text('folder_id'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// Experiment Note Attachments table
export const experimentNoteAttachments = sqliteTable('experiment_note_attachments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  noteId: text('note_id').notNull().references(() => experimentNotes.id),
  userId: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  fileContent: text('file_content').notNull(), // base64 encoded
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// Calendar Events table
export const calendarEvents = sqliteTable('calendar_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  eventType: text('event_type', { enum: ['meeting', 'maintenance', 'experiment', 'training', 'booking'] }).notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  location: text('location'),
  attendees: text('attendees'), // JSON array as string
  status: text('status', { enum: ['scheduled', 'cancelled', 'completed'] }).notNull().default('scheduled'),
  reminderEnabled: integer('reminder_enabled', { mode: 'boolean' }).default(false),
  reminderMinutesBefore: integer('reminder_minutes_before'),
  reminderSent: integer('reminder_sent', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// Experiment Ideas table
export const experimentIdeas = sqliteTable('experiment_ideas', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  hypothesis: text('hypothesis'),
  methodology: text('methodology'),
  requiredMaterials: text('required_materials'),
  expectedOutcomes: text('expected_outcomes'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  category: text('category').notNull(),
  estimatedDuration: text('estimated_duration'),
  budgetEstimate: text('budget_estimate'),
  status: text('status', { enum: ['brainstorming', 'researching', 'planning', 'ready', 'archived'] }).notNull().default('brainstorming'),
  tags: text('tags'), // JSON array as string
  displayOrder: integer('display_order').notNull().default(1),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// Idea Notes table
export const ideaNotes = sqliteTable('idea_notes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  ideaId: text('idea_id').notNull().references(() => experimentIdeas.id),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});
