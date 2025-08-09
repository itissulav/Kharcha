import { getDatabase, initDatabase } from "@/db";
import { getRecurringTransactions } from "@/db/transactions";
import { Account, RecurringTransaction } from "@/db/types";
import { handleAddTransaction } from "./handleAddTransaction";

export function getNextOccurrenceDate(
  currentDateStr: string,
  pattern: "daily" | "weekly" | "monthly",
  interval: number
): string {
  const date = new Date(currentDateStr);
  date.setUTCHours(0, 0, 0, 0);

  switch (pattern) {
    case "daily":
      date.setUTCDate(date.getUTCDate() + interval);
      break;
    case "weekly":
      date.setUTCDate(date.getUTCDate() + 7 * interval);
      break;
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + interval);
      break;
  }

  return date.toISOString();
}

export const handleRecurringTransactions = async (account: Account[]) => {

  await initDatabase();

  const recurringTxns: RecurringTransaction[] = await getRecurringTransactions();

  if (!recurringTxns.length) {
    return;
  }

  const db = await getDatabase();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const tx of recurringTxns) {

    if (!tx.next_occurrence || !tx.recurrence_pattern || !tx.recurrence_interval) {
      continue;
    }

    let nextDateObj = new Date(tx.next_occurrence);
    nextDateObj.setUTCHours(0, 0, 0, 0);

    while (nextDateObj <= today) {
      const isoDateOnly = nextDateObj.toISOString().split("T")[0];

      const duplicate = await db.getFirstAsync(
        `SELECT id FROM transactions
         WHERE account_id = ? AND amount = ? AND type = ? AND category_id = ? 
           AND DATE(created_at) = DATE(?)`,
        [
          tx.account_id,
          tx.amount,
          tx.type,
          tx.category_id,
          isoDateOnly,
        ]
      );

      if (duplicate) {
      } else {
        try {
          const success = await handleAddTransaction({
            amount: tx.amount,
            date: nextDateObj,
            type: tx.type,
            selectedAccountId: tx.account_id,
            selectedCategoryId: tx.category_id,
            accounts: account,
            isRecurring: false,
            recurrencePattern: null,
            recurrenceInterval: null,
          });
          console.log("success: ", success);
        } catch (error) {
          console.error(error);
        }


      }

      const next = getNextOccurrenceDate(
        nextDateObj.toISOString(),
        tx.recurrence_pattern,
        tx.recurrence_interval
      );
      nextDateObj = new Date(next);
      nextDateObj.setUTCHours(0, 0, 0, 0);
    }

    await db.runAsync(
      `UPDATE transactions SET next_occurrence = ? WHERE id = ?`,
      [nextDateObj.toISOString(), tx.id]
    );
  }
};
