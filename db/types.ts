export type IconSetName =
  | "Ionicons"
  | "FontAwesome"
  | "Feather"
  | "MaterialCommunityIcons"
  | "MaterialIcons";

export type TopSpendingCategory = {
  category_id: number;
  category_name: string;
  category_icon: string; // icon name string (not just IoniconName, to cover all sets)
  category_iconSet: string;
  category_limit: number;
  spending_type: "lifestyle" | "essential";
  total: number;
};

export type UserPreference = {
  spending_percentage: number;
  lifeStyleLimit: number;
};

// database/types.ts
export type Account = {
  id: number;
  name: string;
  icon: string;
  balance: number;
};

export type Transaction = {
  id: number;
  account_id: number;
  type: "credit" | "debit";
  category: string;
  note: string;
  amount: number;
  created_at: string;
};

export type InsertTransactionInput = {
  account_id: number;
  type: "credit" | "debit";
  amount: number;
  category_id: number;
  note?: string;
  created_at?: string | null;
  is_recurring: boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly" | null;
  recurrence_interval: number | null;
  next_occurrence: string | null;
};

export type UserData = {
  monthly_income: number;
  spending_percentage: number;
  lifeStyleLimit: number;
  showMonthlyLimitAlert: number;
  showCategoryLimitAlert: number;
};

export type UpdateTransactionInput = {
  transaction_id: number;
  account_id: number;
  type: "credit" | "debit";
  amount: number;
  category_id: number;
  note?: string;
  created_at?: string;
};

export type Category = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  category_limit: number | null;
  spending_type: "lifestyle" | "essential";
};
export type InsertCategory = {
  name: string;
  icon: string;
  iconSet: string;
  categoryLimit: number;
  spending_type: "lifestyle" | "essential";
};

export type RecurringTransaction = {
  id: number;
  account_id: number;
  type: "credit" | "debit";
  category: string;
  category_id: number;
  note: string;
  amount: number;
  created_at: string;
  is_recurring: Boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly";
  recurrence_interval: number;
  next_occurrence: string;
};

export type TransactionWithCategory = {
  id: number;
  account_id: number;
  category_id: number;
  amount: number;
  note: string | null;
  type: "credit" | "debit";
  created_at: string; // ISO timestamp
  category_name: string;
  category_icon: string;
  spending_type: "essential" | "lifestyle";
};

export type CategoryTransactionWithPercent = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  spending_type: "lifestyle" | "essential";
  total: number;
  category_limit: number;
  percentage: number; // percentage of total spending in last 30 days
};
// types.ts (or add to your existing types file)
// types.ts
export type DailyCategoryDebit = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  spending_type: "essential" | "lifestyle";
  category_limit: number | null;
  total: number; // daily total for that category
  month_total: number; // total spent in this month for that category
  transaction_date: string; // format "YYYY-MM-DD"
};

export type DailyCategoryCredit = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  spending_type: "essential" | "lifestyle";
  category_limit: number | null;
  total: number;
  month_total: number; // total spent in this month for that category
  transaction_date: string; // Format: "YYYY-MM-DD"
};

export type CreditTransaction = {
  id: number;
  account_id: number;
  type: "credit";
  category_id: number;
  note: string | null;
  amount: number;
  is_recurring: 0 | 1;
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  next_occurrence: string | null;
  created_at: string;
  category_name: string;
  account_name: string;
  spending_type: "essential" | "lifestyle";
};
