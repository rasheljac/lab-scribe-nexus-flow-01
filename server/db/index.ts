
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Create database file in a data directory
const dbPath = path.join(process.cwd(), 'data', 'database.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Initialize database tables
export const initializeDatabase = () => {
  try {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'planning',
        progress INTEGER NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT,
        researcher TEXT NOT NULL,
        protocols INTEGER NOT NULL DEFAULT 0,
        samples INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        project_id TEXT,
        folder_id TEXT,
        display_order INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiment_notes (
        id TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL REFERENCES experiments(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT,
        folder_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiment_note_attachments (
        id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL REFERENCES experiment_notes(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        filename TEXT NOT NULL,
        file_content TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        location TEXT,
        attendees TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        reminder_enabled INTEGER DEFAULT 0,
        reminder_minutes_before INTEGER,
        reminder_sent INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiment_ideas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        hypothesis TEXT,
        methodology TEXT,
        required_materials TEXT,
        expected_outcomes TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        category TEXT NOT NULL,
        estimated_duration TEXT,
        budget_estimate TEXT,
        status TEXT NOT NULL DEFAULT 'brainstorming',
        tags TEXT,
        display_order INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS idea_notes (
        id TEXT PRIMARY KEY,
        idea_id TEXT NOT NULL REFERENCES experiment_ideas(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
