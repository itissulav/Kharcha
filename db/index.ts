// database/index.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('finance.db');
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
  }
  return db;
};

export const initDatabase = async () => {

  try{
    const db = await getDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        iconSet Text Not Null
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
        category_id INTEGER NOT NULL,
        note TEXT,
        amount INTEGER NOT NULL,
        is_recurring BOOLEAN DEFAULT 0,
        recurrence_pattern TEXT DEFAULT 'monthly',
        recurrence_interval INTEGER DEFAULT 1,
        next_occurrence TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);
  }catch (error){
    console.error(error);
  }
};

export const resetDatabase = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS accounts;
  `);
  await initDatabase();
};
