import React from "react";
import { Text, View } from "react-native";

type Props = {
    totalSpent: number;
    totalEarned: number;
}

const MonthlySpendingCard = ({totalSpent, totalEarned}: Props) => {
    const percent = (totalSpent/totalEarned)
  return (
    <View className="bg-secondary rounded-2xl shadow-md shadow-black/20 p-6 w-full">
      <Text className="text-light-300 text-base mb-1">Monthly Spent</Text>
      <Text className="text-light-100 text-2xl font-bold mb-3">Rs {totalSpent}</Text>

      {/* Progress Bar */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-3 bg-dark-300 rounded-full overflow-hidden">
          <View
            className="h-3 bg-accent rounded-full"
            style={{ width: `${Math.min(percent * 100, 100)}%` }}
          />
        </View>
        <Text className="text-light-300 text-xs font-semibold">
          {Math.min(Math.round(percent * 100), 100)}%
        </Text>
      </View>
    </View>
  );
};

export default MonthlySpendingCard;
