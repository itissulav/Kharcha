// TopSpendingSection.tsx
// I've renamed TopCategoriesModal to be more accurate

import { getCategoryWithTransaction } from "@/db/transactions";
import {
  CategoryTransactionWithPercent,
  DailyCategoryDebit,
  TopSpendingCategory,
} from "@/db/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import CategoryCard from "./CategoryCard"; // We will use the redesigned CategoryCard

type Props = {
  onAdd?: (
    category:
      | (TopSpendingCategory & { percentage?: number })
      | DailyCategoryDebit
  ) => void;
};

const TopSpendingSection = ({ onAdd }: Props) => {
  const [topCategories, setTopSpendingCategories] = useState<
    CategoryTransactionWithPercent[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTopCategories = async () => {
    const categoryWithTransactions = await getCategoryWithTransaction();
    const filteredCategories = (
      categoryWithTransactions as CategoryTransactionWithPercent[]
    ).filter((cat) => cat.category_name.toLowerCase() !== "salary");
    setTopSpendingCategories(filteredCategories);
  };

  useEffect(() => {
    fetchTopCategories();
  }, []);

  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-white text-xl font-bold">Top Spending</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#94a3b8"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/category")}>
          <Text className="text-accent font-semibold">View all</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      <View className="flex-row flex-wrap justify-between">
        {topCategories.length > 0 ? (
          topCategories.map((cat) => (
            <View key={cat.category_id} className="w-[48%] mb-4">
              <CategoryCard
                category={cat}
                onAdd={(category) => onAdd?.(category)}
                type="expense"
              />
            </View>
          ))
        ) : (
          <View className="w-full h-24 items-center justify-center bg-secondary rounded-2xl">
            <Text className="text-slate-400 italic">
              No spending data for this month.
            </Text>
          </View>
        )}
      </View>

      {/* Info Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/70"
        >
          <Pressable className="bg-primary border border-slate-700 rounded-2xl p-6 w-[90%]">
            <Text className="text-white text-xl font-bold mb-4">
              Color Legend
            </Text>
            <Text className="text-slate-300 font-semibold mb-3">
              Category spending relative to its budget:
            </Text>

            <View className="gap-y-3">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-accent mr-3 rounded-full" />
                <Text className="text-white flex-1">Safe (Under 40%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-warning mr-3 rounded-full" />
                <Text className="text-white flex-1">Caution (40% - 80%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-red-600 mr-3 rounded-full" />
                <Text className="text-white flex-1">Critical (Over 80%)</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="self-center bg-accent rounded-full px-6 py-3 mt-6"
            >
              <Text className="text-primary font-bold">Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TopSpendingSection;
