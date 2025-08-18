import BudgetCategoryCard from "@/components/BudgetCategoryCard";
import BudgetSummaryCard from "@/components/BudgetSummaryCard";
import EditCategoryModal from "@/components/EditCategoryModal";
import { getCategoryBudgets, getUserBudgetSettings } from "@/db/transactions";
import { CategoryBudget } from "@/db/types";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type BudgetSettings = {
  monthly_budget: number;
  spending_percentage: number;
  lifeStyleLimit: number;
};

export default function BudgetPage() {
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overAllBudget, setOverallBudget] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryBudget | null>(null);
  const [editCategoryModalVisible, setEditCategoryModalVisible] =
    useState(false);

  const loadData = async () => {
    try {
      const settingsData = await getUserBudgetSettings();
      const categoryData = await getCategoryBudgets();
      setSettings(settingsData);
      setCategories(categoryData);

      getOverallBudget(categoryData);
    } catch (error) {
      console.error("Failed to load budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallBudget = (categories: CategoryBudget[]) => {
    let budgetSum = 0;
    for (const cat of categories) {
      if (cat.category_limit) {
        budgetSum = budgetSum + cat.category_limit;
      }
    }
    setOverallBudget(budgetSum);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-lg text-white">Loading budget data...</Text>
      </View>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!settings) {
    return (
      <View className="flex-1 items-center justify-center bg-primary px-4">
        <Text className="text-lg text-white text-center">
          No budget settings found. Set your monthly budget to get started.
        </Text>
      </View>
    );
  }

  const monthlyBudget =
    (settings.monthly_budget * settings.spending_percentage) / 100;
  const totalSpent = categories.reduce((sum, cat) => sum + cat.month_total, 0);
  const remaining = monthlyBudget - totalSpent;

  return (
    <SafeAreaView className="flex-1 bg-primary p-5">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#AB8BFF"]}
            tintColor="#AB8BFF"
          />
        }
      >
        <EditCategoryModal
          category={selectedCategory}
          visible={editCategoryModalVisible}
          onClose={() => {
            setEditCategoryModalVisible(false);
          }}
          onSave={() => {
            loadData();
          }}
        />
        <View>
          <BudgetSummaryCard
            totalBudget={monthlyBudget}
            totalSpent={totalSpent}
            remaining={remaining}
          />

          {monthlyBudget < overAllBudget && (
            <View className="bg-red-500/20 border border-red-400 rounded-2xl p-4 mt-5 flex-row items-start gap-3">
              <Feather name="alert-triangle" size={24} color="#f87171" />
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">
                  Category limits exceed monthly budget!
                </Text>
                <Text className="text-red-200 text-sm">
                  Your total category limits are set to{" "}
                  <Text className="font-bold text-white">{overAllBudget}</Text>,
                  which is higher than your allocated monthly budget of{" "}
                  <Text className="font-bold text-white">{monthlyBudget}</Text>.
                  Adjust category budgets to avoid overspending.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="gap-3 mt-6 flex-row flex-wrap">
          {categories &&
            categories.map((cat) => (
              <BudgetCategoryCard
                key={cat.category_id}
                category={cat}
                onAdd={(pressedCategory) => {
                  setSelectedCategory(pressedCategory);
                  setEditCategoryModalVisible(true);
                }}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
