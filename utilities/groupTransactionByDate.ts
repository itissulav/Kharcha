import { TransactionWithCategory } from "@/db/types";
import { DateTime } from "luxon";

export function groupTransactionsByDate(transactions: TransactionWithCategory[]) {
  const grouped: Record<string, TransactionWithCategory[]> = {};

  transactions.forEach((txn) => {
    const txnDate = DateTime.fromISO(txn.created_at); // assuming ISO format like "2025-08-01T12:00:00"

    let label = txnDate.toFormat("MMMM d"); // e.g., "August 1"

    const today = DateTime.local().startOf("day");
    const yesterday = today.minus({ days: 1 });

    if (txnDate.hasSame(today, "day")) {
      label = "Today";
    } else if (txnDate.hasSame(yesterday, "day")) {
      label = "Yesterday";
    }

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(txn);
  });

  return grouped;
}
