import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync('flash8.db');
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS thoughts (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      duration_minutes REAL NOT NULL DEFAULT 1440
    );
  `);
  await db.runAsync(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  return db;
}

export async function insertThought(content: string, durationMinutes = 1440) {
  const database = await getDatabase();
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  const now = Date.now();
  await database.runAsync(
    `INSERT INTO thoughts (id, content, done, pinned, created_at, expires_at, duration_minutes) VALUES (?, ?, 0, 0, ?, ?, ?)`,
    [id, content, now, now + durationMinutes * 60000, durationMinutes]
  );
  return id;
}

export async function getActiveThoughts() {
  const database = await getDatabase();
  return database.getAllAsync<{
    id: string; content: string; done: number; pinned: number;
    created_at: number; expires_at: number; duration_minutes: number;
  }>('SELECT * FROM thoughts WHERE expires_at > ? ORDER BY pinned DESC, expires_at ASC', [Date.now()]);
}

export async function getRecentThoughts(limit = 3) {
  const database = await getDatabase();
  return database.getAllAsync<{
    id: string; content: string; done: number; pinned: number;
    created_at: number; expires_at: number; duration_minutes: number;
  }>('SELECT * FROM thoughts WHERE expires_at > ? ORDER BY pinned DESC, expires_at ASC LIMIT ?', [Date.now(), limit]);
}

export async function updateDone(id: string, done: number) {
  const database = await getDatabase();
  await database.runAsync('UPDATE thoughts SET done = ? WHERE id = ?', [done, id]);
}

export async function updatePin(id: string, pinned: number) {
  const database = await getDatabase();
  await database.runAsync('UPDATE thoughts SET pinned = ? WHERE id = ?', [pinned, id]);
}

export async function deleteThought(id: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM thoughts WHERE id = ?', [id]);
}

export async function cleanExpired() {
  const database = await getDatabase();
  const r = await database.runAsync('DELETE FROM thoughts WHERE expires_at <= ?', [Date.now()]);
  return r.changes ?? 0;
}

export async function getRecentlyExpired(): Promise<{
  id: string; content: string; expires_at: number;
}[]> {
  const database = await getDatabase();
  const aMinuteAgo = Date.now() - 60000;
  return database.getAllAsync<{ id: string; content: string; expires_at: number; }>(
    'SELECT id, content, expires_at FROM thoughts WHERE expires_at <= ? AND expires_at > ?',
    [Date.now(), aMinuteAgo]
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const database = await getDatabase();
  await database.runAsync('INSERT OR REPLACE INTO settings VALUES (?, ?)', [key, value]);
}
