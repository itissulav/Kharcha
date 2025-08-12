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
  const allowedSpend = totalEarned * (monthly_spending_limit / 100);
  const totalPercentSpentOfSpendingLimit = (totalSpent / allowedSpend) * 100;

  const limitExceeded = totalPercentSpentOfSpendingLimit > 100;

  let color = "bg-accent";
  if (
    totalPercentSpentOfSpendingLimit >= 80 &&
    totalPercentSpentOfSpendingLimit < 100 &&
    !limitExceeded
  ) {
    color = "bg-warning";
  } else if (totalPercentSpentOfSpendingLimit >= 100 || limitExceeded) {
    color = "bg-red-800";
  }

  return (
    <View className="bg-secondary rounded-2xl shadow-md shadow-black/20 p-6 w-full">
      <Text className="text-light-300 text-base mb-1">Monthly Spent</Text>
      <Text className="text-light-100 text-2xl font-bold mb-3">
        Rs {totalSpent}
      </Text>

      {/* Progress Bar */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-3 bg-dark-300 rounded-full overflow-hidden">
          <View
            className={`h-3 ${color} rounded-full`}
            style={{
              width: `${Math.min(totalPercentSpentOfSpendingLimit, 100)}%`,
            }}
          />
        </View>
        <Text className="text-light-300 text-xs font-semibold">
          {Math.min(Math.round(totalPercentSpentOfSpendingLimit), 100)}%
        </Text>
      </View>
    </View>
  );
};

export default MonthlySpendingCard;
