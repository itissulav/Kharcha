import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryPanel from "@/components/CategoryPanel";
import EditCategoryModal from "@/components/EditCategoryModal";
import { getCategoryWithTransaction } from "@/db/transactions";
import { CategoryTransactionWithPercent } from "@/db/types";
import { router } from "expo-router";

export default function Category() {
  const [categories, setCategories] = useState<
    CategoryTransactionWithPercent[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryTransactionWithPercent | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = async () => {
    const categoryWithTransactions = await getCategoryWithTransaction();
    setCategories(categoryWithTransactions);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#AB8BFF"]}
            tintColor="#AB8BFF"
          />
        }
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory && (
          <EditCategoryModal
            visible={editCategoryModalVisible}
            category={selectedCategory}
            onClose={() => setEditCategoryModalVisible(false)}
            onSave={() => {}}
          />
        )}

        <View className="pt-4 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-light-100 text-2xl font-bold mb-2">
              All Categories
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="p-2"
            >
              <Ionicons
                name="information-circle-outline"
                size={28}
                color="#AB8BFF"
              />
            </TouchableOpacity>
          </View>

          <Text className="text-light-300 mb-6">
            Review your recent expenses by category.
          </Text>

          {/* Category List */}
          <View className="gap-1">
            {categories.length > 0 ? (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.category_name}
                  onPress={() => {
                    setSelectedCategory(category);
                    setEditCategoryModalVisible(true);
                  }}
                >
                  <CategoryPanel category={category} />
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-muted-100 italic">
                No transactions found.
              </Text>
            )}
          </View>

          {/* Back Button */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-accent px-6 py-3 rounded-2xl self-start shadow-md flex-row items-center gap-2"
            >
              <Ionicons name="arrow-back-sharp" size={18} color="#000000" />
              <Text className="text-black font-semibold text-base">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-70 px-6">
          <View className="bg-primary rounded-2xl p-6 max-w-md w-full">
            <Text className="text-white text-xl font-bold mb-4">
              Color Legend
            </Text>

            <Text className="text-white font-semibold mb-2">
              Spending Limit Usage (Border Colors)
            </Text>
            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-blue-800 mr-3 rounded-sm" />
                <Text className="text-white">Safe: 0% - 40% of limit used</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-orange-500 mr-3 rounded-sm" />
                <Text className="text-white">
                  Caution: 40% - 80% of limit used
                </Text>
              </View>
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-red-800 mr-3 rounded-sm" />
                <Text className="text-white">Critical: 80%+ of limit used</Text>
              </View>
            </View>

            <Text className="text-white font-semibold mb-2">
              Spending Type (Text Colors)
            </Text>
            <View className="mb-6">
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 bg-blue-500 rounded-sm mr-3" />
                <Text className="text-white">
                  Essential: Necessary expenses (groceries, rent, utilities)
                </Text>
              </View>
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 bg-red-500 rounded-sm mr-3" />
                <Text className="text-white">
                  Lifestyle: Discretionary spending (luxury, wants)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="self-end bg-accent rounded-2xl px-4 py-2 shadow-md"
            >
              <Text className="text-black font-semibold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
