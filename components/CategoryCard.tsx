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
  category : TopSpendingCategory;
  onAdd?: (category: TopSpendingCategory) => void

}

export default function CategoryCard({
  category,
  onAdd
}: Props) {

  // Determine iconSet key safely (handle casing differences)
  const iconSetKey = (category.category_iconSet as keyof typeof ICON_SETS);

  // Determine icon name safely
  const category_icon = category.category_icon;

  // Optional fields
  const category_name = category.category_name;
  const total = (category as TopSpendingCategory).total ?? null; // total only exists on TopSpendingCategory

  const IconComponent = ICON_SETS[iconSetKey];

  if (!IconComponent) {
    return (
      <View className="bg-red-500 p-4 rounded-lg">
        <Text className="text-white">Invalid Icon Set: {iconSetKey}</Text>
      </View>
    );
  }

  return (
    <View
      className={`border-b-4 rounded-2xl bg-secondary p-3 my-2 shadow-md items-center w-40`}
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
      
      {total && (
        <Text className="text-white text-xl font-bold mb-1">
          Rs {total.toLocaleString()}
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
