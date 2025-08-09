import { getCategoryWithTransaction } from '@/db/transactions';
import { CategoryTransactionWithPercent, TopSpendingCategory } from '@/db/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CategoryCardTransaction from './CategoryCardTransaction';

type Props = {
  onAdd?: (category: TopSpendingCategory & { percentage?: number }) => void;
};

const TopCategoriesModal = ({onAdd}: Props) => {
  const [topCategories, setTopSpendingCategories] = useState<CategoryTransactionWithPercent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTopCategories = async () => {
    const categoryWithTransactions = await getCategoryWithTransaction();
    const filteredCategories = (categoryWithTransactions as CategoryTransactionWithPercent[]).filter(
      (cat) => cat.category_name.toLowerCase() !== 'salary'
    );
    setTopSpendingCategories(filteredCategories);
  };


  useEffect(() => {
    fetchTopCategories();
  }, []);

  return (
    <View className="justify-between px-4 gap-2">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-light-200 text-lg font-semibold mb-3">
          Top Spending Categories
        </Text>

        {/* Info Icon */}
        <TouchableOpacity onPress={() => setModalVisible(true)} className="mb-3 p-1">
          <Ionicons name="information-circle-outline" size={24} color="#AB8BFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/category')}>
          <Text className="text-light-200 text-lg font-semibold mb-3 border-b border-white">
            View all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View className="flex-row flex-wrap gap-4 items-center justify-center">
        {topCategories.length > 0 ? (
          (topCategories.slice(0, 4) as CategoryTransactionWithPercent[]).map((cat) => (
            <CategoryCardTransaction key={cat.category_name} category={cat} onAdd={(category) => onAdd?.(category)}/>
          ))
        ) : (
          <Text className="text-muted-100 italic">No transactions yet.</Text>
        )}
      </View>

      {/* Info Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-70 px-6">
          <View className="bg-primary rounded-2xl p-6 max-w-md w-full">
            <Text className="text-white text-xl font-bold mb-4">Color Legend</Text>

            <Text className="text-white font-semibold mb-2">Spending Limit Usage (Border Colors)</Text>
            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-blue-800 mr-3 rounded-sm" />
                <Text className="text-white">Safe: Below 40% of limit used</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-orange-500 mr-3 rounded-sm" />
                <Text className="text-white">Caution: 40% - 80% of limit used</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 border-b-4 border-red-800 mr-3 rounded-sm" />
                <Text className="text-white">Critical: 80% or more of limit used</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setModalVisible(false)}
              className="self-end bg-accent rounded-2xl px-4 py-2 shadow-md"
            >
              <Text className="text-black font-semibold text-base">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TopCategoriesModal;
