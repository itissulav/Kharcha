// components/CategoryPanel.tsx
import { TopSpendingCategory } from '@/db/types';
import {
    Feather,
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
};

export default function CategoryPanel({
  category,
}: {
  category: TopSpendingCategory & { percentage?: number };
}) {
  const {
    category_icon,
    category_iconSet,
    category_name,
    total,
    percentage,
    category_limit,
    spending_type,
  } = category;

  const limitRatio = category_limit ? total / category_limit : 0;

  // Border color based on limit usage
  let border = 'border-blue-800'; // Safe
  if (limitRatio > 0.8) {
    border = 'border-red-800'; // Critical
  } else if (limitRatio > 0.4) {
    border = 'border-orange-500'; // Caution
  }

  // Text color based on spending type
  let textColor = 'text-red-500'; // Lifestyle by default
  if (spending_type === 'essential') {
    textColor = 'text-blue-500';
  }

  const IconComponent = ICON_SETS[category_iconSet as keyof typeof ICON_SETS];
  if (!IconComponent) {
    return (
      <View className="bg-red-500 p-4">
        <Text className="text-white">Invalid Icon Set: {category_iconSet}</Text>
      </View>
    );
  }

  return (
    <View
      className={`bg-secondary rounded-2xl shadow-md p-4 w-full mb-4 items-center border-b-4 ${border} flex-row justify-between`}
    >
      {/* Left: Icon + Category Name */}
      <View className="flex-row items-center gap-4">
        <IconComponent name={category_icon as any} size={32} color="#38B2AC" />
        <Text className="text-white text-l font-bold">{category_name}</Text>
      </View>

      {/* Right: Amount + % of Limit */}
      <View className="flex-row items-center gap-2">
        <View>
          <Text className={`text-xl font-semibold ${textColor}`}>
            {total}
          </Text>
          {percentage !== undefined && (
            <Text className="text-light-300 text-base">
              {(limitRatio * 100).toFixed(0)}%
            </Text>
          )}
        </View>
        <Ionicons name="arrow-forward" size={18} color="white" />
      </View>
    </View>
  );
}
