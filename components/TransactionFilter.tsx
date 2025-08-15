import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  categories: { category_name: string; category_icon: string }[];
  onApply: (filters: {
    category: string | null;
    type: "debit" | "credit" | null;
    dateRange: "week" | "month" | "6months" | null;
  }) => void;
  onReset: () => void;
};

export default function TransactionFilter({
  visible,
  categories,
  onApply,
  onReset,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"debit" | "credit" | null>(
    null
  );
  const [selectedDateRange, setSelectedDateRange] = useState<
    "week" | "month" | "6months" | null
  >(null);

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      type: selectedType,
      dateRange: selectedDateRange,
    });
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View className="flex-1 justify-center bg-black/40">
        <View className="bg-primary p-4 rounded-t-3xl">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Channel Filter */}
            <Text className="text-light-100 text-base font-semibold mb-2">
              Channel
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  selectedCategory === null ? "bg-accent" : "bg-dark-200"
                }`}
              >
                <Text className="text-white font-medium">All</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.category_name}
                  onPress={() => setSelectedCategory(cat.category_name)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedCategory === cat.category_name
                      ? "bg-accent"
                      : "bg-dark-200"
                  }`}
                >
                  <Text className="text-white font-medium">
                    {cat.category_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Type Filter */}
            <Text className="text-light-100 text-base font-semibold mb-2">
              Transaction Type
            </Text>
            <View className="flex-row mb-4">
              {["All", "Debit", "Credit"].map((type) => {
                const isSelected =
                  (type === "All" && selectedType === null) ||
                  (type === "Debit" && selectedType === "debit") ||
                  (type === "Credit" && selectedType === "credit");
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      setSelectedType(
                        type === "All"
                          ? null
                          : (type.toLowerCase() as "debit" | "credit")
                      )
                    }
                    className={`px-4 py-2 mr-2 rounded-full ${
                      isSelected ? "bg-accent" : "bg-dark-200"
                    }`}
                  >
                    <Text className="text-white font-medium">{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Range Filter */}
            <Text className="text-light-100 text-base font-semibold mb-2">
              Date
            </Text>
            <View className="flex-row mb-4">
              {[
                { label: "This Week", value: "week" },
                { label: "This Month", value: "month" },
                { label: "Last 6 Months", value: "6months" },
              ].map((range) => (
                <TouchableOpacity
                  key={range.value}
                  onPress={() => setSelectedDateRange(range.value as any)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedDateRange === range.value
                      ? "bg-accent"
                      : "bg-dark-200"
                  }`}
                >
                  <Text className="text-white font-medium">{range.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* OK Button */}
            <View className="items-end flex-row gap-4">
              <TouchableOpacity
                onPress={handleApply}
                className="bg-accent px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold text-base">OK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onReset}
                className="bg-accent px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold text-base">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
