// src/components/BudgetSummaryCard.tsx

import { getProgressColor } from "@/utilities/colors"; // Helper function for colors
import React from "react";
import { Text, View } from "react-native";

type Props = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
};

export default function BudgetSummaryCard({
  totalBudget,
  totalSpent,
  remaining,
}: Props) {
  const progress = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const progressColor = getProgressColor(progress);

  return (
    <View className="bg-card p-5 m-4 rounded-2xl shadow-lg">
      <Text className="text-gray-300 text-sm font-medium">
        Budget Remaining
      </Text>
      <Text className="text-white text-3xl font-bold mt-1">
        Rs {Math.max(0, remaining).toFixed(2)}
      </Text>

      <View className="mt-4">
        {/* Progress Bar Background */}
        <View className="h-2.5 bg-gray-700 rounded-full w-full" />
        {/* Progress Bar Foreground */}
        <View
          className={`absolute h-2.5 rounded-full ${progressColor}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-300 text-sm">
          Spent: Rs {totalSpent.toFixed(2)}
        </Text>
        <Text className="text-gray-300 text-sm">
          Total: Rs {totalBudget.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
