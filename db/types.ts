
export type IconSetName =
  | "Ionicons"
  | "FontAwesome"
  | "Feather"
  | "MaterialCommunityIcons"
  | "MaterialIcons";

export type TopSpendingCategory = {
  category_id: number;
  category_name: string;
  category_icon: string;      // icon name string (not just IoniconName, to cover all sets)
  category_iconSet: string;
  total: number;
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
  type: 'credit' | 'debit';
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
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_interval: number | null;
  next_occurrence: string | null;
};

export type UpdateTransactionInput = {
  transaction_id: number,
  account_id: number;
  type: "credit" | "debit";
  amount: number;
  category_id: number;
  note?: string;
  created_at?: string;
};


export type Category = {
  id: number;
  name: string;
  icon: string;
  iconSet: string;
};

export type RecurringTransaction = {
  id: number;
  account_id: number;
  type: 'credit' | 'debit';
  category: string;
  category_id: number;
  note: string;
  amount: number;
  created_at: string;
  is_recurring: Boolean;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly';
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
};

export type CategoryTransactionWithPercent = {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_iconSet: string;
  total: number;
  percentage: number;  // percentage of total spending in last 30 days
};

