import { DailyCategoryDebit } from "@/db/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryCard from "./CategoryCard";

type Props = {
  sevenDaysCategoryDebit: DailyCategoryDebit[][];
  onAdd: (category: DailyCategoryDebit) => void;
};

const ExpenseTab = ({ sevenDaysCategoryDebit, onAdd }: Props) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);
  const screenWidth = Dimensions.get("window").width;

  const [expensePerDay, setExpensePerDay] = useState(0);
  const [date, setDate] = useState(0);
  const [leftButtonDisabled, setLeftButtonDisabled] = useState(false);
  const [rightDisabledButton, setRightDisabledButton] = useState(false);

  useEffect(() => {
    setLeftButtonDisabled(selectedDayIndex === 0);
    setRightDisabledButton(selectedDayIndex === 6);
    setExpensePerDay(expenseByDay(sevenDaysCategoryDebit, selectedDayIndex));
  }, [selectedDayIndex, sevenDaysCategoryDebit]);

  const getDayLabel = (index: number) => {
    const today = new Date();
    today.setDate(today.getDate() - index);
    return today.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getRelativeDayText = (index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Yesterday";
    return `${index} days ago`;
  };

  const expenseByDay = (
    data: DailyCategoryDebit[][],
    index: number
  ): number => {
    if (!data[index]) return 0;
    return data[index].reduce((sum, c) => sum + c.total, 0);
  };

  const categoriesForSelectedDay =
    sevenDaysCategoryDebit[selectedDayIndex] || [];

  return (
    <ScrollView className="flex-1 bg-primary p-4 mb-20">
      {/* Date Navigation */}
      <View className="flex-row items-center justify-between mb-2 bg-secondary rounded-full px-4 py-2 shadow-md">
        <TouchableOpacity
          onPress={() => {
            if (selectedDayIndex > 0) {
              setSelectedDayIndex(selectedDayIndex - 1);
              setDate(date + 1);
            }
          }}
          disabled={leftButtonDisabled}
          className={`p-2 rounded-full ${
            leftButtonDisabled ? "bg-slate-700" : "bg-teal-500"
          }`}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {getDayLabel(date)}
          </Text>
          <Text className="text-gray-400 text-xs">
            {getRelativeDayText(date)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (selectedDayIndex < 6) {
              setSelectedDayIndex(selectedDayIndex + 1);
              setDate(date - 1);
            }
          }}
          disabled={rightDisabledButton}
          className={`p-2 rounded-full ${
            rightDisabledButton ? "bg-slate-700" : "bg-teal-500"
          }`}
        >
          <Ionicons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Instruction hint */}
      <Text className="text-gray-400 text-center mb-4 text-xs">
        Tap arrows or swipe to view expenses for different days
      </Text>

      {/* Total Expenses Card */}
      <View className="bg-secondary rounded-2xl p-5 mb-5 shadow-lg items-center">
        {expensePerDay > 0 ? (
          <>
            <Text className="text-gray-300 text-sm mb-1">
              Total spent on {getDayLabel(date)}
            </Text>
            <Text className="text-white text-4xl font-bold">
              Rs {expensePerDay.toFixed(2)}
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="wallet-outline"
              size={36}
              color="#94a3b8"
              style={{ marginBottom: 6 }}
            />
            <Text className="text-gray-300 text-sm">
              No expenses recorded for this day
            </Text>
          </>
        )}
      </View>

      {/* Section Title */}
      <Text className="text-white text-xl font-bold mb-3">
        Expense Breakdown
      </Text>

      {/* Categories */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {categoriesForSelectedDay.length > 0 ? (
            categoriesForSelectedDay.map((day, index) => (
              <CategoryCard
                key={day.category_id}
                category={day}
                onAdd={(category) => {
                  onAdd(category);
                }}
                type="expense"
              />
            ))
          ) : (
            <View className="w-full mt-12 items-center">
              <Ionicons
                name="list-outline"
                size={40}
                color="#94a3b8"
                style={{ marginBottom: 10 }}
              />
              <Text className="text-gray-400 text-lg font-semibold mb-1">
                Nothing to break down
              </Text>
              <Text className="text-gray-500 text-sm text-center px-10">
                Add some expenses for {getDayLabel(date)} to see them here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

export default ExpenseTab;
