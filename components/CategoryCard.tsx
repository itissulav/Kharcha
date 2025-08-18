// CategoryCard.tsx

import { DailyCategoryCredit, DailyCategoryDebit } from "@/db/types";
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
  category: DailyCategoryDebit | DailyCategoryCredit;
  onAdd?: (category: DailyCategoryDebit | DailyCategoryCredit) => void;
  type: "income" | "expense";
};

export default function CategoryCard({ category, onAdd, type }: Props) {
  const iconSetKey = category.category_iconSet as keyof typeof ICON_SETS;
  const IconComponent = ICON_SETS[iconSetKey];

  const category_icon = category.category_icon;
  const category_name = category.category_name;
  const total = category.total ?? null;
  const limit = category.category_limit ?? null;
  const monthTotal = category.month_total;

  const percentage =
    typeof monthTotal === "number" && typeof limit === "number" && limit > 0
      ? Math.round((monthTotal / limit) * 100)
      : null;

  console.log(
    `Month total for category : ${category_name} is ${monthTotal} and the percentage is: ${percentage} limt is: ${limit}`
  );

  // Colors & borders (matching TransactionCard style)
  let borderColor = "border-gray-700";
  let fontColor = "text-gray-200";

  if (type === "expense" && percentage !== null) {
    if (percentage >= 80) {
      borderColor = "border-red-600";
      fontColor = "text-red-400";
    } else if (percentage >= 40) {
      borderColor = "border-yellow-500";
      fontColor = "text-yellow-400";
    } else {
      borderColor = "border-teal-500";
      fontColor = "text-teal-300";
    }
  } else if (type === "income") {
    borderColor = "border-green-500";
    fontColor = "text-green-400";
  }

  if (!IconComponent) {
    return (
      <View className="bg-red-500 p-3 rounded-xl w-[48%]">
        <Text className="text-white">Invalid Icon Set</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onAdd?.(category)}
      activeOpacity={0.8}
      className={`flex-row items-center bg-secondary p-4 rounded-xl mb-3 shadow-sm border-l-4 ${borderColor} w-[48%]`}
    >
      {/* Icon */}
      <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center mr-3">
        <IconComponent name={category_icon as any} size={24} color="white" />
      </View>

      {/* Text Section */}
      <View className="flex-1">
        <Text
          className="text-light-100 text-base font-semibold"
          numberOfLines={1}
        >
          {category_name}
        </Text>

        {total !== null && (
          <Text className="text-white font-bold text-lg mb-1">
            Rs {total.toLocaleString()}
          </Text>
        )}

        {percentage !== null && (
          <Text className={`text-xs font-semibold ${fontColor}`}>
            {percentage}% of limit
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
