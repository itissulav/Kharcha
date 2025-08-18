import { CategoryBudget } from "@/db/types";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
};

type Props = {
  category: CategoryBudget;

  onAdd: (category: CategoryBudget) => void;
};

export default function BudgetCategoryCard({ category, onAdd }: Props) {
  const iconSetKey = category.category_iconSet as keyof typeof ICON_SETS;
  const IconComponent = ICON_SETS[iconSetKey];

  if (!IconComponent) {
    return (
      <View className="bg-red-500 p-3 rounded-xl w-[48%]">
        <Text className="text-white">Invalid Icon Set</Text>
      </View>
    );
  }

  const { category_name, category_icon, category_limit, month_total } =
    category;

  const percentage =
    typeof month_total === "number" &&
    typeof category_limit === "number" &&
    category_limit > 0
      ? Math.min(Math.round((month_total / category_limit) * 100), 100) // clamp at 100%
      : 0;

  return (
    <TouchableOpacity
      className="relative w-[48%] mb-3"
      onPress={() => {
        onAdd(category);
      }}
    >
      {/* Background progress fill */}
      <View
        className="absolute top-0 left-0 h-full bg-accent/40 rounded-xl"
        style={{ width: `${percentage}%` }}
      />

      {/* Foreground card */}
      <View className="flex-row items-center bg-secondary p-4 rounded-xl shadow-sm border border-gray-700">
        {/* Icon */}
        <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center mr-3">
          <IconComponent name={category_icon as any} size={24} color="white" />
        </View>

        {/* Text Section */}
        <View className="flex-1">
          <Text
            className="text-white text-base font-semibold"
            numberOfLines={1}
          >
            {category_name}
          </Text>

          {typeof category_limit === "number" && (
            <Text className="text-white text-sm mb-1">
              Rs {month_total?.toLocaleString() || 0} /{" "}
              {category_limit.toLocaleString()}
            </Text>
          )}

          <Text className="text-white text-xs font-semibold">
            {percentage}% used
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
