// database/transactions.ts
import { DateTime } from "luxon";
import { getDatabase } from "./index";
import {
  Category,
  CategoryBudget,
  CategoryTransactionWithPercent,
  CreditTransaction,
  DailyCategoryCredit,
  DailyCategoryDebit,
  InsertCategory,
  InsertTransactionInput,
  RecurringTransaction,
  TopSpendingCategory,
  UpdateTransactionInput,
} from "./types";

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
    tx.note ?? "",
    tx.created_at ?? new Date().toISOString(),
    tx.is_recurring,
    tx.recurrence_pattern,
    tx.recurrence_interval,
    tx.next_occurrence
  );
};

interface LimitCheckResult {
  isLimitExceeded: boolean;
  currentSpent: number;
  categoryLimit: number | null;
}

export const checkCategoryLimit = async (
  categoryId: number,
  amountToAdd: number,
  type: "debit" | "credit"
): Promise<LimitCheckResult> => {
  if (type !== "debit") {
    // No need to check limits for credits
    return {
      isLimitExceeded: false,
      currentSpent: 0,
      categoryLimit: null,
    };
  }

  const db = await getDatabase();

  // 1. Get category limit
  const category = await db.getFirstAsync<{ category_limit: number | null }>(
    `SELECT category_limit FROM categories WHERE id = ?`,
    [categoryId]
  );

  const limit = category?.category_limit ?? null;
  if (limit === null) {
    // No limit set for this category
    return {
      isLimitExceeded: false,
      currentSpent: 0,
      categoryLimit: null,
    };
  }

  // 2. Calculate current spent this month in this category
  const spentResult = await db.getFirstAsync<{ spent: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS spent
     FROM transactions
     WHERE category_id = ?
       AND type = 'debit'
       AND date(created_at) >= date('now', 'start of month')`,
    [categoryId]
  );

  const currentSpent = spentResult?.spent ?? 0;
  const newTotal = currentSpent + amountToAdd;

  // 3. Check if new total exceeds limit
  const isLimitExceeded = newTotal > limit;

  return {
    isLimitExceeded,
    currentSpent,
    categoryLimit: limit,
  };
};

export const deleteTransaction = async (id: number) => {
  const db = await getDatabase();
  return await db.runAsync("DELETE FROM transactions WHERE id = ?", id);
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
    LIMIT 5;
  `);

  return transactions;
};

export const getTransactionsByAccount = async (accountId: number) => {
  const db = await getDatabase();

  const transactions = await db.getAllAsync(
    `
    SELECT 
      transactions.id,
      transactions.account_id,
      transactions.category_id,
      transactions.amount,
      transactions.note,
      transactions.type,
      transactions.created_at,
      categories.name as category_name,
      categories.icon as category_icon,
      categories.spending_type as spending_type,
      categories.iconSet as category_iconSet
    FROM transactions
    JOIN categories ON transactions.category_id = categories.id
    WHERE transactions.account_id = ?
    ORDER BY transactions.created_at DESC
  `,
    [accountId]
  );

  return transactions;
};

export const getCreditTransactionsThisMonth = async (): Promise<
  CreditTransaction[]
> => {
  const db = await getDatabase();

  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-01`;
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const result = await db.getAllAsync<CreditTransaction>(
    `
    SELECT 
      t.*, 
      c.name as category_name, 
      c.spending_type as spending_type,
      a.name as account_name
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN accounts a ON t.account_id = a.id
    WHERE t.type = 'credit'
      AND date(t.created_at) >= date(?)
      AND date(t.created_at) < date(?)
    ORDER BY t.created_at DESC
  `,
    [startOfMonth, startOfNextMonth]
  );

  return result;
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
    LIMIT 2;
    `
  );

  return results; // [{ category: 'Groceries', total: 4500 }, ...]
};

type CategoryTransactionStats = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  category_limit: number;
  spending_type: "lifestyle" | "essential";
  total: number;
};

export const getCategoryWithTransaction = async (): Promise<
  CategoryTransactionWithPercent[]
> => {
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
      c.category_limit AS category_limit,
      c.spending_type AS spending_type,
      COALESCE(SUM(t.amount), 0) AS total
    FROM categories c
    LEFT JOIN transactions t 
      ON t.category_id = c.id 
      AND t.type = 'debit' 
      AND date(t.created_at) >= date('now', 'start of month')
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

export const getLast7DaysCategoryDebits = async (): Promise<
  DailyCategoryDebit[][]
> => {
  try {
    const db = await getDatabase();
    const result: DailyCategoryDebit[][] = [];

    for (let i = 6; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toFormat("yyyy-MM-dd");

      const dailyData: DailyCategoryDebit[] = await db.getAllAsync(
        `
        SELECT 
          c.id AS category_id,
          c.name AS category_name,
          c.icon AS category_icon,
          c.iconSet AS category_iconSet,
          c.spending_type,
          c.category_limit,
          IFNULL(SUM(t.amount), 0) AS total,
          (
            SELECT IFNULL(SUM(t2.amount), 0)
            FROM transactions t2
            WHERE t2.category_id = c.id
              AND t2.type = 'debit'
              AND strftime('%Y-%m', t2.created_at) = strftime('%Y-%m', ?)
          ) AS month_total,
          DATE(?) AS transaction_date
        FROM categories c
        LEFT JOIN transactions t 
          ON c.id = t.category_id
          AND t.type = 'debit'
          AND DATE(t.created_at) = DATE(?)
        WHERE LOWER(c.name) != 'salary'
        GROUP BY c.id
        `,
        [date, date, date]
      );

      result.push(dailyData);
    }

    return result;
  } catch (error) {
    console.error("Error fetching last 7 days debits:", error);
    return [];
  }
};

export const getLast7DaysCategoryCredits = async (): Promise<
  DailyCategoryCredit[][]
> => {
  try {
    const db = await getDatabase();
    const result: DailyCategoryCredit[][] = [];

    for (let i = 6; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toFormat("yyyy-MM-dd");

      let dailyData: DailyCategoryCredit[] = await db.getAllAsync(
        `
        SELECT 
          c.id AS category_id,
          c.name AS category_name,
          c.icon AS category_icon,
          c.iconSet AS category_iconSet,
          c.spending_type,
          c.category_limit,
          SUM(t.amount) AS total,
          DATE(t.created_at) AS transaction_date
        FROM categories c
        INNER JOIN transactions t 
          ON c.id = t.category_id
          AND t.type = 'credit'
          AND DATE(t.created_at) = DATE(?)
        GROUP BY c.id
        ORDER BY total DESC
        `,
        [date]
      );

      // If no credits for the day → return salary category with 0 total
      if (dailyData.length === 0) {
        const salaryCategory = await db.getFirstAsync(
          `
          SELECT 
            c.id AS category_id,
            c.name AS category_name,
            c.icon AS category_icon,
            c.iconSet AS category_iconSet,
            c.spending_type,
            c.category_limit,
            0 AS total,
            DATE(?) AS transaction_date
          FROM categories c
          WHERE LOWER(c.name) = 'salary'
          LIMIT 1
          `,
          [date]
        );

        if (salaryCategory) {
          dailyData = [salaryCategory as DailyCategoryCredit];
        }
      }

      result.push(dailyData);
    }

    return result;
  } catch (error) {
    console.error("Error fetching last 7 days credits:", error);
    return [];
  }
};

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(`
    SELECT 
      id AS category_id, 
      name AS category_name, 
      icon AS category_icon, 
      iconSet As category_iconSet
    FROM categories
    ORDER BY name COLLATE NOCASE ASC
  `);

  // Depending on your db wrapper, `results` might be an array of objects
  // If using better-sqlite3, this returns rows as objects directly
  return results as Category[];
}

export async function getSalaryData(): Promise<Category[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(`
    SELECT 
      id AS category_id, 
      name AS category_name, 
      icon AS category_icon, 
      iconSet AS category_iconSet
    FROM categories
    WHERE LOWER(name) = 'salary'
  `);

  return results as Category[];
}

export async function getSalary(): Promise<TopSpendingCategory[]> {
  const db = await getDatabase();

  const query = `
    SELECT
      id as category_id,
      name as category_name,
      icon as category_icon,
      iconSet as category_iconSet,
      COALESCE(category_limit, 0) as category_limit,
      spending_type
    FROM categories
    WHERE name = 'Salary'
    LIMIT 1;
  `;

  const results = await db.getAllAsync(query);

  return results as TopSpendingCategory[];
}

export async function getCreditCategoriesThisMonth(): Promise<
  TopSpendingCategory[]
> {
  const db = await getDatabase();

  // Get the first day of the current month in YYYY-MM-DD format
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayStr = firstDayOfMonth.toISOString().slice(0, 10); // e.g. '2025-08-01'

  const query = `
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.iconSet AS category_iconSet,
      COALESCE(c.category_limit, 0) AS category_limit,
      c.spending_type,
      SUM(t.amount) AS total
    FROM categories c
    JOIN transactions t ON t.category_id = c.id
    WHERE t.type = 'credit'
      AND DATE(t.created_at) >= ?
    GROUP BY c.id, c.name, c.icon, c.iconSet, c.category_limit, c.spending_type
    ORDER BY total DESC
  `;

  const results = await db.getAllAsync(query, [firstDayStr]);

  return results as TopSpendingCategory[];
}

export const insertCategory = async (
  category: InsertCategory
): Promise<boolean> => {
  const db = await getDatabase();

  try {
    await db.runAsync(
      `INSERT INTO categories (name, icon, iconSet, category_limit, spending_type) VALUES (?, ?, ?, ?, ?);`,
      [
        category.name,
        category.icon,
        category.iconSet,
        category.categoryLimit,
        category.spending_type,
      ]
    );
    return true;
  } catch (error) {
    alert(error);
    console.error("Failed to insert category:", error);
    return false;
  }
};
export interface UpdateCategory {
  id: number;
  name: string;
  icon: string;
  iconSet: string;
  categoryLimit?: number | null;
  spending_type: "essential" | "lifestyle";
}

export const updateCategory = async (
  category: UpdateCategory
): Promise<boolean> => {
  const db = await getDatabase();

  try {
    await db.runAsync(
      `UPDATE categories 
       SET name = ?, icon = ?, iconSet = ?, category_limit = ?, spending_type = ?
       WHERE id = ?;`,
      [
        category.name,
        category.icon,
        category.iconSet,
        category.categoryLimit ?? null,
        category.spending_type,
        category.id,
      ]
    );
    return true;
  } catch (error) {
    alert(error);
    console.error("Failed to update category:", error);
    return false;
  }
};

export type MonthlyExpense = {
  month: string; // 'YYYY-MM'
  total_spent: number;
};

export const getTotalSpentPerMonth = async () => {
  const db = await getDatabase();

  const startOfMonth = DateTime.now().startOf("month").toISO();
  const endOfMonth = DateTime.now().endOf("month").toISO();

  const result = await db.getFirstAsync<{ total_spent: number | null }>(
    `
    SELECT SUM (amount) as total_spent
    FROM transactions
    WHERE type = 'debit' AND created_at BETWEEN ? AND ?    
  `,
    [startOfMonth, endOfMonth]
  );

  return result?.total_spent ?? 0;
};

export const getTotalEarnedPerMonth = async () => {
  const db = await getDatabase();

  const startOfMonth = DateTime.now().startOf("month").toISO();
  const endOfMonth = DateTime.now().endOf("month").toISO();

  const result = await db.getFirstAsync<{ total_spent: number | null }>(
    `
    SELECT SUM (amount) as total_spent
    FROM transactions
    WHERE type = 'credit' AND created_at BETWEEN ? AND ?    
  `,
    [startOfMonth, endOfMonth]
  );

  return result?.total_spent ?? 0;
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
  return result.map((row) => ({
    month: row.month,
    total_spent: Number(row.total_spent),
  }));
};

export const getMonthlyEarning = async (): Promise<MonthlyExpense[]> => {
  const db = await getDatabase();

  const query = `
    SELECT 
      strftime('%Y-%m', created_at) AS month,
      SUM(amount) AS total_spent
    FROM transactions
    WHERE type = 'credit'  -- filter only spending
    GROUP BY month
    ORDER BY month ASC;
  `;

  const result = await db.getAllAsync<MonthlyExpense>(query);

  // Optionally convert totals to number if needed (SQLite can return strings)
  return result.map((row) => ({
    month: row.month,
    total_spent: Number(row.total_spent),
  }));
};

export const getDailyExpensesForMonth = async (
  yearMonth: string
): Promise<DailyExpense[]> => {
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

export const getWeeklyExpensesForYear = async (
  year: string
): Promise<WeeklyExpense[]> => {
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

export const updateTransaction = async (
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
    transaction.note ?? " ",
    transaction.created_at ?? new Date().toISOString(),
    transaction.transaction_id
  );
};

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

export const getRecurringTransactions = async (): Promise<
  RecurringTransaction[]
> => {
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

// Type for user budget settings
export type UserBudgetSettings = {
  monthly_budget: number;
  spending_percentage: number;
  lifeStyleLimit: number;
  showMonthlyLimitAlert: boolean;
  showCategoryLimitAlert: boolean;
};

// 1. Fetch user budget settings
export async function getUserBudgetSettings(): Promise<UserBudgetSettings> {
  const db = await getDatabase();
  const results = await db.getAllAsync<UserBudgetSettings>(`
    SELECT 
      monthly_budget, 
      spending_percentage, 
      lifeStyleLimit,
      showMonthlyLimitAlert,
      showCategoryLimitAlert
    FROM user_settings
    WHERE id = 1
  `);

  return results[0]; // only one row
}

// 2. Fetch category budgets with spent amount
export async function getCategoryBudgets(): Promise<CategoryBudget[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<CategoryBudget>(`
    SELECT 
      c.id AS category_id,
      c.name As category_name,
      c.icon AS category_icon,
      c.iconSet AS category_iconSet,
      c.spending_type AS spending_type,
      c.category_limit,
      IFNULL(SUM(t.amount), 0) as month_total
    FROM categories c
    LEFT JOIN transactions t 
      ON c.id = t.category_id 
      AND t.type = 'debit'
      AND strftime('%Y-%m', t.created_at) = strftime('%Y-%m', 'now')
    GROUP BY c.id, c.name, c.icon, c.iconSet, c.category_limit
    ORDER BY c.name ASC
  `);

  return results;
}
