import React from "react";
import { Text, View } from "react-native";

const CategoryBudgetCard = () => {
  const categories = [
    { name: "Food", spent: 7500, limit: 10000 },
    { name: "Transport", spent: 2500, limit: 5000 },
    { name: "Entertainment", spent: 6000, limit: 7000 },
  ];

  return (
    <View className="bg-secondary rounded-2xl shadow-md shadow-black/20 p-6 space-y-4">
      <Text className="text-light-100 text-lg font-bold mb-2">Category Budgets</Text>
      {categories.map((cat, i) => {
        const percent = cat.spent / cat.limit;
        return (
          <View key={i}>
            <Text className="text-light-200 text-sm mb-1">{cat.name}: Rs {cat.spent} / {cat.limit}</Text>
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
      })}
    </View>
  );
};

export default CategoryBudgetCard;
