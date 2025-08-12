import { initDatabase } from "@/db";
import { updateAccountBalance } from "@/db/accounts";
import {
  checkCategoryLimit,
  getTotalEarnedPerMonth,
  getTotalSpentPerMonth,
  insertTransaction,
} from "@/db/transactions";
import { Account, UserData } from "@/db/types";
import { getUserPreference, updateMonthlyCategoryLimitAlert } from "@/db/user";
import * as Localization from "expo-localization";
import { router } from "expo-router";
import { DateTime } from "luxon";
import { createThreeButtonAlert } from "./showAlert";

type AddTransactionParams = {
  date: Date;
  amount: number;
  type: "credit" | "debit";
  selectedAccountId: number | null;
  selectedCategoryId: number | null;
  accounts: Account[];
  isRecurring: boolean;
  recurrencePattern: "daily" | "weekly" | "monthly" | null;
  recurrenceInterval: string | null;
};

const onButton1 = () => {
  router.push("/preference");
};

const onButton2 = async () => {
  await initDatabase();

  try {
    const success = await updateMonthlyCategoryLimitAlert(false);
  } catch (error) {
    console.error(error);
    alert("There was an error updating Preference");
  }
};
const onButton3 = () => {};

const getNextOccurrence = (
  currentDate: Date,
  pattern: "daily" | "weekly" | "monthly",
  interval: number
): string => {
  const next = new Date(currentDate);
  if (pattern === "daily") next.setDate(next.getDate() + interval);
  else if (pattern === "weekly") next.setDate(next.getDate() + interval * 7);
  else if (pattern === "monthly") next.setMonth(next.getMonth() + interval);
  return next.toISOString();
};

export const handleAddTransaction = async ({
  date,
  amount,
  type,
  selectedAccountId,
  selectedCategoryId,
  accounts,
  isRecurring,
  recurrencePattern,
  recurrenceInterval,
}: AddTransactionParams): Promise<boolean> => {
  if (!selectedAccountId || !selectedCategoryId || !amount) {
    console.warn("Missing required fields");
    return false;
  }

  const userPreference: UserData | undefined = await getUserPreference();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  if (!selectedAccount) {
    console.warn("Account not found");
    return false;
  }

  const zone = Localization.getCalendars()[0]?.timeZone || "UTC";
  const createdAt = DateTime.fromJSDate(date)
    .setZone(zone)
    .toFormat("yyyy-MM-dd'T'HH:mm:ss");

  // Initialize recurring variables
  let recurrence_pattern: "daily" | "weekly" | "monthly" | null = null;
  let recurrence_interval: number | null = null;
  let next_occurrence: string | null = null;

  if (isRecurring) {
    // Validate recurrence fields
    if (!recurrencePattern) {
      console.warn("Recurring pattern is required");
      return false;
    }

    if (!recurrenceInterval || isNaN(parseInt(recurrenceInterval))) {
      console.warn("Valid recurrence interval is required");
      return false;
    }

    recurrence_pattern = recurrencePattern;
    recurrence_interval = parseInt(recurrenceInterval);
    next_occurrence = getNextOccurrence(
      date,
      recurrence_pattern,
      recurrence_interval
    );
  }

  console.log("Alert Boolean: ", userPreference?.showMonthlyLimitAlert);

  if (type !== "credit" && (userPreference?.showMonthlyLimitAlert ?? true)) {
    const totalSpent = await getTotalSpentPerMonth();
    const totalEarned = await getTotalEarnedPerMonth();

    console.log("Total Earned: ", totalEarned);
    console.log(
      "spending_percentage: ",
      userPreference?.spending_percentage ?? "No data"
    );

    const monthly_limitExceeded =
      totalSpent + amount >
      ((userPreference?.spending_percentage ?? 0) / 100) * totalEarned;
    console.log("Monthly Limit Exceeded", monthly_limitExceeded);

    const { isLimitExceeded, currentSpent, categoryLimit } =
      await checkCategoryLimit(selectedCategoryId, amount, type);

    if (isLimitExceeded) {
      alert("Your Limit for this category for the month has exceeded");
    }

    if (monthly_limitExceeded) {
      createThreeButtonAlert({
        alertTitle: "Limit Exceeded!",
        alertMsg: "Your Monthly Limit has Exceeded!",
        button1: "Change Limit",
        button2: "Don't Show Again",
        button3: "Ok",
        onButton1: () => {
          onButton1();
        },
        onButton2: () => {
          onButton2();
        },
        onButton3: () => {
          onButton3();
        },
      });
    }
  }

  await insertTransaction({
    account_id: selectedAccountId,
    type,
    category_id: selectedCategoryId,
    note: "Manual Entry",
    amount,
    created_at: createdAt,
    is_recurring: isRecurring,
    recurrence_pattern,
    recurrence_interval,
    next_occurrence,
  });

  const updatedBalance =
    type === "credit"
      ? selectedAccount.balance + amount
      : selectedAccount.balance - amount;
  try {
    await updateAccountBalance(selectedAccountId, updatedBalance);
    selectedAccount.balance = updatedBalance;
  } catch (error) {
    console.error(error);
  }

  return true;
};
