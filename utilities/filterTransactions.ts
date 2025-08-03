import { TransactionWithCategory } from "@/db/types";

export type TransactionFilterOptions = {
  category: string | null;
  type: "debit" | "credit" | null;
  dateRange: "week" | "month" | "6months" | null;
};

export function filterTransactions(
  transactions: TransactionWithCategory[],
  filters: TransactionFilterOptions
): TransactionWithCategory[] {
  const now = new Date();
  let startDate: Date | null = null;

  // Compute start date based on selected range
  if (filters.dateRange === "week") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (filters.dateRange === "month") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  } else if (filters.dateRange === "6months") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 6);
  }

  return transactions.filter((txn) => {
    const txnDate = new Date(txn.created_at);

    const matchCategory =
      !filters.category || txn.category_name.toLowerCase() === filters.category.toLowerCase();

    const matchType = !filters.type || txn.type.toLowerCase() === filters.type.toLowerCase();

    const matchDate =
      !startDate || txnDate >= startDate;

    return matchCategory && matchType && matchDate;
  });
}
