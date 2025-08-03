// database/transactions.ts
import { getDatabase } from './index';
import { Category, CategoryTransactionWithPercent, InsertTransactionInput, RecurringTransaction, UpdateTransactionInput } from './types';

export const getAllTransactions = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT transactions.*, accounts.name AS account_name
    FROM transactions
    LEFT JOIN accounts ON transactions.account_id = accounts.id
    ORDER BY created_at DESC
  `);
};


export const insertTransaction = async (tx: InsertTransactionInput) => {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO transactions (account_id, type, amount, category_id, note, created_at, is_recurring, recurrence_pattern, recurrence_interval, next_occurrence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    tx.account_id,
    tx.type,
    tx.amount,
    tx.category_id,
    tx.note ?? '',
    tx.created_at ?? new Date().toISOString(),
    tx.is_recurring,
    tx.recurrence_pattern,
    tx.recurrence_interval,
    tx.next_occurrence
  );
};


export const deleteTransaction = async (id: number) => {
  const db = await getDatabase();
  return await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
};

export const getRecentTransactions = async () => {
  const db = await getDatabase();

  const transactions = await db.getAllAsync(`
    SELECT 
      transactions.id,
      transactions.amount,
      transactions.note,
      transactions.type,
      transactions.created_at,
      categories.name as category_name,
      categories.icon as category_icon
    FROM transactions
    JOIN categories ON transactions.category_id = categories.id
    ORDER BY transactions.created_at DESC
    LIMIT 3
  `);

  return transactions;
};

export const getTransactionsByAccount = async (accountId: number) => {
  const db = await getDatabase();

  const transactions = await db.getAllAsync(`
    SELECT 
      transactions.id,
      transactions.account_id,
      transactions.category_id,
      transactions.amount,
      transactions.note,
      transactions.type,
      transactions.created_at,
      categories.name as category_name,
      categories.icon as category_icon
    FROM transactions
    JOIN categories ON transactions.category_id = categories.id
    WHERE transactions.account_id = ?
    ORDER BY transactions.created_at DESC
  `, [accountId]);

  return transactions;
};



export const getTopSpendingCategories = async () => {
  const db = await getDatabase();
  const results = await db.getAllAsync(
    `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.iconSet As category_iconSet,
      SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'debit' 
      AND t.created_at >= datetime('now', '-30 days')
    GROUP BY c.id, c.name, c.icon
    ORDER BY total DESC
    LIMIT 5;
    `
  );

  return results; // [{ category: 'Groceries', total: 4500 }, ...]
};


type CategoryTransactionStats = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  total: number;
};

export const getCategoryWithTransaction = async (): Promise<CategoryTransactionWithPercent[]> => {
  const db = await getDatabase();

  // Step 1: Get total spending in the last 30 days
  const totalResult = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'debit' AND created_at >= datetime('now', '-30 days')`
  );

  const totalSpent = totalResult?.total ?? 0;

  // Step 2: Get per-category spending
  const categoryResults = await db.getAllAsync<CategoryTransactionStats>(
    `SELECT 
       c.id AS category_id,
       c.name AS category_name,
       c.icon AS category_icon,
       c.iconSet AS category_iconSet,
       COALESCE(SUM(t.amount), 0) AS total
     FROM categories c
     LEFT JOIN transactions t 
       ON t.category_id = c.id 
       AND t.type = 'debit' 
       AND t.created_at >= datetime('now', '-30 days')
     GROUP BY c.id, c.name, c.icon, c.iconSet
     ORDER BY total DESC`
  );

  // Step 3: Add percentage to each result
  const categoryWithPercent = categoryResults.map((cat) => ({
    ...cat,
    percentage: totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0,
  }));

  return categoryWithPercent;
};



export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(`
    SELECT id, name, icon, iconSet
    FROM categories
    ORDER BY name COLLATE NOCASE ASC
  `);

  // Depending on your db wrapper, `results` might be an array of objects
  // If using better-sqlite3, this returns rows as objects directly
  return results as Category[];
}

export const insertCategory = async (category: Category): Promise<boolean> => {
  const db = await getDatabase();

  try {
    await db.runAsync(
      `INSERT INTO categories (name, icon, iconSet) VALUES (?, ?, ?);`,
      [
        category.name,
        category.icon,
        category.iconSet,
      ]
    );
    return true;
  } catch (error) {
    console.error("Failed to insert category:", error);
    return false;
  }
};

export type MonthlyExpense = {
  month: string; // 'YYYY-MM'
  total_spent: number;
};

export const getMonthlyExpenses = async (): Promise<MonthlyExpense[]> => {
  const db = await getDatabase();

  const query = `
    SELECT 
      strftime('%Y-%m', created_at) AS month,
      SUM(amount) AS total_spent
    FROM transactions
    WHERE type = 'debit'  -- filter only spending
    GROUP BY month
    ORDER BY month ASC;
  `;

  const result = await db.getAllAsync<MonthlyExpense>(query);

  // Optionally convert totals to number if needed (SQLite can return strings)
  return result.map(row => ({
    month: row.month,
    total_spent: Number(row.total_spent),
  }));
};

export const getDailyExpensesForMonth = async (yearMonth: string): Promise<DailyExpense[]> => {
  const db = await getDatabase();

  const query = `
    SELECT 
      strftime('%Y-%m-%d', created_at) AS day,
      SUM(amount) AS total_spent
    FROM transactions
    WHERE type = 'debit' 
      AND strftime('%Y-%m', created_at) = ?
    GROUP BY day
    ORDER BY day ASC;
  `;

  const result = await db.getAllAsync(query, [yearMonth]);
  return result.map((row: any) => ({
    day: row.day,
    total_spent: row.total_spent,
  }));
};

export type DailyExpense = {
  day: string; // e.g., '2025-07-27'
  total_spent: number;
};

export const getWeeklyExpensesForYear = async (year: string): Promise<WeeklyExpense[]> => {
  const db = await getDatabase();

  const query = `
    SELECT 
      strftime('%Y-W%W', created_at) AS week,
      SUM(amount) AS total_spent
    FROM transactions
    WHERE type = 'debit'
      AND strftime('%Y', created_at) = ?
    GROUP BY week
    ORDER BY week ASC;
  `;

  const result = await db.getAllAsync(query, [year]);
  return result.map((row: any) => ({
    week: row.week,
    total_spent: row.total_spent,
  }));
};

export type WeeklyExpense = {
  week: string; // e.g., '2025-W30'
  total_spent: number;
};

export const updateTransaction = async(
  transaction: UpdateTransactionInput
) => {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE transactions SET account_id =?, type = ?, amount = ?, category_id = ?, note = ?, created_at = ? WHERE  id = ?;
    `,
    transaction.account_id,
    transaction.type,
    transaction.amount,
    transaction.category_id,
    transaction.note?? " ",
    transaction.created_at ?? new Date().toISOString(),
    transaction.transaction_id
  );
}


export const getSpendingByCategory = async () => {
  const db = await getDatabase();

  const results = await db.getAllAsync(`
    SELECT 
      c.id as category_id,
      c.name as category_name,
      c.icon,
      SUM(t.amount) as total_spent
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'debit'
    GROUP BY c.id, c.name, c.icon
    ORDER BY total_spent DESC
  `);

  return results;
};

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  const db = await getDatabase();

  try {
    return await db.getAllAsync(
      `SELECT * FROM transactions WHERE is_recurring = 1`
    );
  } catch (err) {
    console.error("Error fetching recurring transactions:", err);
    return [];
  }
};

