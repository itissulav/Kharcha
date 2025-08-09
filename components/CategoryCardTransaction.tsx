// components/CategoryCard.tsx
import { TopSpendingCategory } from '@/db/types';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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

type Props = {
  category: TopSpendingCategory & { percentage?: number };
  onAdd?: (category: TopSpendingCategory & { percentage?: number }) => void;
};

export default function CategoryCardTransaction({ category, onAdd }: Props) {
  const {
    category_icon,
    category_iconSet,
    category_name,
    total,
    percentage,
    category_limit,
  } = category;

  const limitRatio = category_limit ? total / category_limit : 0;

  let borderColorClass = 'border-blue-600';
  if (limitRatio > 0.8) {
    borderColorClass = 'border-red-700';
  } else if (limitRatio > 0.4) {
    borderColorClass = 'border-orange-600';
  }

  const IconComponent = ICON_SETS[category_iconSet as keyof typeof ICON_SETS];

  if (!IconComponent) {
    return (
      <View className="bg-red-600 p-3 rounded-lg items-center justify-center w-40">
        <Text className="text-white font-semibold text-center">
          Invalid Icon Set: {category_iconSet}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`${borderColorClass} border-b-4 rounded-2xl bg-secondary p-3 my-2 shadow-md items-center w-40`}
    >
      <IconComponent
        name={category_icon as any}
        size={28}
        color="#14B8A6" // teal-500
        className="mb-2"
      />

      <Text className="text-light-300 text-xs mb-1 font-medium capitalize text-center">
        {category_name}
      </Text>

      <Text className="text-white text-xl font-bold mb-1">
        Rs {total.toLocaleString()}
      </Text>

      {percentage !== undefined && (
        <Text className="text-light-300 text-sm font-semibold mb-2">
          {percentage.toFixed(1)}%
        </Text>
      )}

      <TouchableOpacity
        onPress={() => onAdd && onAdd(category)}
        activeOpacity={0.7}
        className="mt-2 rounded-lg border-b-2 w-full h-10 items-center justify-center bg-slate-700"
      >
        <Ionicons name="add" size={22} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}
