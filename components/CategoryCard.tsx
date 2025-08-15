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

  let borderColor = "border-gray-700";
  let iconColor = "text-teal-400";
  let fontColor = "text-gray-200";

  if (type === "expense" && percentage !== null) {
    iconColor = "text-blue-400";
    if (percentage >= 80) {
      borderColor = "border-red-600";
      fontColor = "text-red-600";
      iconColor = "text-red-600";
    } else if (percentage >= 40) {
      borderColor = "border-yellow-500";
      fontColor = "text-yellow-500";
      iconColor = "text-yellow-400";
    } else {
      borderColor = "border-teal-500";
      fontColor = "text-teal-400";
      iconColor = "text-teal-300";
    }
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
      className={`flex-row items-center bg-gray-800 rounded-xl border ${borderColor} p-3 w-[48%] mb-3`}
      onPress={() => onAdd?.(category)}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center mr-3">
        <IconComponent name={category_icon as any} size={24} color="white" />
      </View>

      {/* Text Section */}
      <View className="flex-1">
        <Text
          className="text-gray-200 font-semibold text-base mb-1"
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
          <Text className={`text-sm font-semibold ${fontColor}`}>
            {percentage}% of limit
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
