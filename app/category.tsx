// app/category.tsx

import CategoryCardTransaction from '@/components/CategoryCardTransaction';
import { getCategoryWithTransaction } from '@/db/transactions';
import { CategoryTransactionWithPercent } from '@/db/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Category() {
  const [categories, setCategories] = useState<CategoryTransactionWithPercent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
            colors={['#AB8BFF']}
            tintColor="#AB8BFF"
          />
        }
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-4 gap-4">
          <Text className="text-light-100 text-2xl font-bold mb-2">
            All Categories
          </Text>
          <Text className="text-light-300 mb-4">
            Explore the breakdown of your recent expenses by category.
          </Text>

          <View className="flex-row flex-wrap gap-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCardTransaction key={category.category_name} category={category} />
              ))
            ) : (
              <Text className="text-muted-100 italic">No transactions found.</Text>
            )}
          </View>

          <View className="mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-accent px-6 py-3 rounded-2xl self-start shadow-md flex-row items-center gap-2"
            >
              <Ionicons name="arrow-back-sharp" size={18} color="#000000" />
              <Text className="text-black font-semibold text-base">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
