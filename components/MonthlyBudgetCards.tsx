// MonthlySpendingCard.tsx

import React from "react";
import { Text, View } from "react-native";

type Props = {
  totalSpent: number;
  totalEarned: number;
  monthly_spending_limit: number;
};

const MonthlySpendingCard = ({
  totalSpent,
  totalEarned,
  monthly_spending_limit,
}: Props) => {
  // Handle case where totalEarned is 0 to avoid division by zero
  const allowedSpend =
    totalEarned > 0 ? totalEarned * (monthly_spending_limit / 100) : 0;
  const totalPercentSpentOfSpendingLimit =
    allowedSpend > 0 ? (totalSpent / allowedSpend) * 100 : 0;

  let color = "bg-accent"; // Default/Safe
  if (totalPercentSpentOfSpendingLimit >= 80) {
    color = "bg-red-600"; // Critical
  } else if (totalPercentSpentOfSpendingLimit >= 40) {
    color = "bg-warning"; // Caution
  }

  return (
    <View className="bg-secondary rounded-2xl p-5 shadow-lg shadow-black/20">
      <View className="flex-row justify-between items-baseline mb-3">
        <Text className="text-slate-300 text-base font-medium">
          Monthly Spending
        </Text>
        <Text className="text-slate-400 text-sm font-semibold">
          Limit: Rs {Math.round(allowedSpend)?.toLocaleString()}
        </Text>
      </View>

      <Text className="text-white text-3xl font-bold mb-4">
        Rs {totalSpent?.toLocaleString()}
      </Text>

      {/* Progress Bar */}
      <View className="h-2.5 bg-black/30 rounded-full w-full">
        <View
          className={`h-2.5 ${color} rounded-full`}
          style={{
            width: `${Math.min(totalPercentSpentOfSpendingLimit, 100)}%`,
          }}
        />
      </View>
      <View className="flex-row justify-end mt-1">
        <Text className="text-slate-300 text-xs font-semibold">
          {Math.round(totalPercentSpentOfSpendingLimit)}% of limit used
        </Text>
      </View>
    </View>
  );
};

export default MonthlySpendingCard;
