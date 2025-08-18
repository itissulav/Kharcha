// database/index.ts
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("finance.db");
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
  }
  return db;
};

export const initDatabase = async () => {
  try {
    const db = await getDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        iconSet TEXT NOT NULL,
        spending_type TEXT NOT NULL CHECK (spending_type IN ('essential', 'lifestyle')) DEFAULT 'lifestyle',
        category_limit INTEGER DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_id INTEGER NOT NULL,
          type TEXT CHECK(type IN ('credit', 'debit')),
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

      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monthly_budget REAL,
        spending_percentage REAL DEFAULT 100, 
        lifeStyleLimit REAL DEFAULT 70, 
        showMonthlyLimitAlert BOOLEAN DEFAULT 1,
        showCategoryLimitAlert BOOLEAN Default 1
      );
    `);
    await db.execAsync(`
      INSERT OR IGNORE INTO user_settings (id, monthly_budget, spending_percentage, lifeStyleLimit)
      VALUES (1, 20000, 100, 70);
    `);
  } catch (error) {
    console.error(error);
  }
};

export const resetDatabase = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS user_settings;
  `);
  await initDatabase();
};
