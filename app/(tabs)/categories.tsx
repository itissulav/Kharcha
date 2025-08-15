import AddTransactionModal from "@/components/AddTransactionModal";
import ExpenseTab from "@/components/ExpenseTab";
import IncomeTab from "@/components/IncomeTab";
import { initDatabase } from "@/db";
import { getAllAccounts } from "@/db/accounts";
import {
  getAllCategories,
  getLast7DaysCategoryCredits,
  getLast7DaysCategoryDebits,
  getSalaryData,
} from "@/db/transactions";
import {
  Account,
  Category,
  DailyCategoryCredit,
  DailyCategoryDebit,
} from "@/db/types";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = () => {
  const [expenseSelected, setExpenseSelected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sevenDaysCategoryDebit, setSevenDaysCategoryDebit] = useState<
    DailyCategoryDebit[][]
  >([]);
  const [sevenDaysCategoryCredit, setSevenDaysCategoryCredit] = useState<
    DailyCategoryCredit[][]
  >([]);

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [addTransactionModalVisible, setAddTransactionModalVisible] =
    useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"credit" | "debit">();

  const [selectedCategory, setSelectedCategory] =
    useState<DailyCategoryCredit>();
  const [salary, setSalary] = useState<Category[]>([]);

  const fetchData = async () => {
    await initDatabase();
    const dailyCategoryDebit = await getLast7DaysCategoryDebits();
    setSevenDaysCategoryDebit(dailyCategoryDebit);

    const dailyCategoryCredit = await getLast7DaysCategoryCredits();
    setSevenDaysCategoryCredit(dailyCategoryCredit);

    const data = await getAllAccounts();
    setAccounts(data);

    const categories = await getAllCategories();
    setCategories(categories);

    const salaryData = await getSalaryData();
    setSalary(salaryData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="p-5 bg-primary flex-1 w-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#AB8BFF"]}
            tintColor="#AB8BFF"
          />
        }
      >
        {selectedCategory && type && (
          <AddTransactionModal
            visible={addTransactionModalVisible}
            onClose={() => {
              setAddTransactionModalVisible(false);
            }}
            onSuccess={() => {
              setAddTransactionModalVisible(false);
            }}
            accounts={accounts}
            categories={categories}
            initialCategory={selectedCategory}
            initialType={type}
          />
        )}
        <View>
          <Text className="text-white text-3xl font-bold items-center h-11">
            Categories
          </Text>
        </View>
        <View>
          <View className="px-4 py-6">
            {/* --- REDESIGNED TAB SWITCHER --- */}
            <View className="flex-row bg-black/40 rounded-full p-1 mb-2 ">
              {/* Expenses Tab */}
              <View
                className={`flex-1 rounded-full p-3 ${
                  expenseSelected ? "bg-accent" : ""
                }`}
              >
                <TouchableOpacity
                  onPress={() => {
                    setExpenseSelected(true);
                  }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      expenseSelected ? "text-primary" : "text-white"
                    }`}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                className={`flex-1 rounded-full p-3 ${
                  !expenseSelected ? "bg-accent" : ""
                }`}
              >
                <TouchableOpacity
                  onPress={() => {
                    setExpenseSelected(false);
                  }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      !expenseSelected ? "text-primary" : "text-white"
                    }`}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {expenseSelected ? (
              <ExpenseTab
                sevenDaysCategoryDebit={sevenDaysCategoryDebit}
                onAdd={(category) => {
                  setSelectedCategory(category);
                  setType("debit");
                  setAddTransactionModalVisible(true);
                }}
              />
            ) : (
              <IncomeTab
                sevenDaysCategoryCredit={sevenDaysCategoryCredit}
                onAdd={(category) => {
                  setSelectedCategory(category);
                  setType("credit");
                  setAddTransactionModalVisible(true);
                }}
              />
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default categories;
