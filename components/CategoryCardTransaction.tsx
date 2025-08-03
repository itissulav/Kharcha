// components/CategoryCard.tsx
import { TopSpendingCategory } from '@/db/types';
import React from 'react';
import { Text, View } from 'react-native';

import {
    Feather,
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from '@expo/vector-icons';

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
};

export default function CategoryCardTransaction({
  category,
}: {
  category: TopSpendingCategory & { percentage?: number }; // allow optional percentage
}) {
  const { category_icon, category_iconSet, category_name, total, percentage } = category;

  // Pick the icon component dynamically based on iconSet string
  const IconComponent = ICON_SETS[category_iconSet as keyof typeof ICON_SETS];

  if (!IconComponent) {
    return (
      <View className="bg-red-500 p-4">
        <Text className="text-white">Invalid Icon Set: {category_iconSet}</Text>
      </View>
    );
  }

  return (
    <View className="bg-secondary rounded-2xl shadow-md p-4 w-[48%] mb-4 items-center">
      <IconComponent name={category_icon as any} size={32} color="#38B2AC" className="mb-2" />

      <Text className="text-light-300 text-sm mb-1">{category_name}</Text>
      <Text className="text-light-300 text-xl font-semibold mb-1">{total}</Text>
      
      {percentage !== undefined && (
        <Text className="text-light-300 text-base">
          {percentage.toFixed(2)}%
        </Text>
      )}
    </View>
  );
}
