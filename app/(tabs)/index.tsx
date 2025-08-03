import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import AddAccountModal from "@/components/AddAccountModal";
import AddCard from "@/components/AddCard";
import CardOptionsModal from "@/components/CardOptionsModal";
import EditAccountModal from "@/components/EditAccountModal";
import StorageCard from "@/components/StorageCard";
import TotalCard from "@/components/TotalCard";
import TransactionCard from "@/components/TransactionCard";

import { initDatabase, resetDatabase } from "@/db";
import { getAllAccounts } from "@/db/accounts";
import {
  getAllCategories,
  getMonthlyExpenses,
  getRecentTransactions,
  MonthlyExpense,
} from "@/db/transactions";
import { Account, Category, TransactionWithCategory } from "@/db/types";

import AddCategoryModal from "@/components/AddCategoryModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import { icons } from "@/constants/icons";
import { handleDelete, handleLongPress } from "@/utilities/accountActions";
import { handleRecurringTransactions } from "@/utilities/handleRecurringTransactions";
import { router } from "expo-router";

export default function Index() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithCategory[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAccountModalVisible, setEditAccountModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expenseByMonth, setExpenseByMonth] = useState<MonthlyExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const fetchData = async () => {
    await initDatabase();

    const data = await getAllAccounts();
    const recent = await getRecentTransactions();
    const expenses = await getMonthlyExpenses();
    const categories = await getAllCategories();

    setAccounts(data as Account[]);
    setRecentTransactions(recent as TransactionWithCategory[]);
    setExpenseByMonth(expenses);
    setCategories(categories);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleRecurringTransactions(accounts);
    await fetchData();
    setRefreshing(false);
  };

  const handleReset = async () => {
    await resetDatabase();
    Alert.alert("Database Reset", "All data has been reset.");
    await fetchData();
  };

  const formatMonth = (month: string): string | null => {
    if (!month) return null;

    const [year, monthNum] = month.split("-");
    const date = new Date(Number(year), Number(monthNum) - 1);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  const labels = expenseByMonth
    .map((item) => formatMonth(item.month))
    .filter((month): month is string => month !== null);

  const values = expenseByMonth
    .map((item) => Number(item.total_spent))
    .filter((val) => !isNaN(val) && isFinite(val));

  useEffect(() => {
    handleRecurringTransactions(accounts);
    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary pb-8">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#AB8BFF"]}
            tintColor="#AB8BFF"
          />
        }
      >
        {/* Add Transaction Modal */}
        <AddTransactionModal
          visible={addTransactionModalVisible}
          onClose={() => setAddTransactionModalVisible(false)}
          onSuccess={fetchData}
          accounts={accounts}
          categories={categories}
        />

        <AddCategoryModal
          visible = {addCategoryModalVisible}
          onClose={ () => {setAddCategoryModalVisible(false)}}
          onSave={() => {
            setAddCategoryModalVisible(false);
            fetchData();
          }}
        />

        {/* Modals */}
        <AddAccountModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={fetchData}
        />
        <EditAccountModal
          visible={editAccountModalVisible}
          onClose={() => setEditAccountModalVisible(false)}
          onSuccess={fetchData}
          account={selectedAccount}
        />
        <CardOptionsModal
          visible={optionsVisible}
          onClose={() => setOptionsVisible(false)}
          onEdit={() => {
            setEditAccountModalVisible(true);
            setOptionsVisible(false);
          }}
          onDelete={() => handleDelete(selectedAccount, setAccounts, setOptionsVisible)}
        />

        {/* Profile Image and Greeting */}
        <View className="bg-primary rounded-2xl flex-row items-center justify-between px-4 py-2">
          <Pressable onPress={() => router.push("/profile")}>
            <Image
              source={{ uri: "https://i.pravatar.cc/300" }}
              className="w-16 h-16 rounded-full border-4 border-accent"
            />
          </Pressable>
          <Text className="text-light-100 text-2xl font-bold mt-4 mb-2">Hi, Sulav</Text>
        </View>

        {/* Header */}
        <Text className="text-light-100 text-2xl font-bold mt-4 mb-2">Your Balance</Text>
        <Text className="text-light-300 mb-6">
          Track and manage all your accounts in one place.
        </Text>

        {/* Total Balance */}
        <View className="items-center mb-6">
          <TotalCard amount={totalBalance} />
        </View>

        {/* Storage Cards */}
        <View className="mb-8">
          <Text className="text-light-200 text-lg font-semibold mb-3">Storage Accounts</Text>
          <View className="flex-row justify-center gap-4 items-center flex-wrap">
            {accounts.map((account) => (
              <StorageCard
                key={account.id}
                account={account}
                onLongPress={() =>
                  handleLongPress(account, setSelectedAccount, setOptionsVisible)
                }
              />
            ))}
            <AddCard onPress={() => setModalVisible(true)} />
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mb-8">
          <Text className="text-light-200 text-lg font-semibold mb-3">Recent Transactions</Text>
          {recentTransactions.length > 0 ? (
            <View className="bg-secondary rounded-xl p-4 space-y-4 shadow-md shadow-black/20">
              {recentTransactions.map((recentTransaction) => (
                <TransactionCard
                  key={recentTransaction.id}
                  recentTransaction={recentTransaction}
                />
              ))}
            </View>
          ) : (
            <Text className="text-muted-100 italic">No transactions found.</Text>
          )}
        </View>

        {/* Monthly Expenses Chart */}
        <View className="mb-8">
          <Text className="text-light-200 text-lg font-semibold mb-3">Monthly Expenses</Text>
          {labels.length > 0 && values.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels,
                  datasets: [{ data: values, strokeWidth: 2 }],
                }}
                width={Math.max(labels.length * 80, screenWidth)}
                height={220}
                chartConfig={{
                  backgroundColor: "#0f0d23",
                  backgroundGradientFrom: "#0f0d23",
                  backgroundGradientTo: "#0f0d23",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(171, 139, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#AB8BFF",
                  },
                }}
                bezier
                style={{
                  borderRadius: 16,
                  marginVertical: 8,
                }}
              />
            </ScrollView>
          ) : (
            <Text className="text-muted-100 italic mt-2">Not enough data to display chart.</Text>
          )}
        </View>

        {/* Reset Database Button */}
        <TouchableOpacity
          onPress={handleReset}
          className="bg-error px-5 py-3 rounded-xl self-center"
        >
          <Text className="text-white font-semibold">Reset Database</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating + Button */}
      <View className="absolute bottom-36 right-10 z-50">
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          className="w-16 h-16 rounded-full bg-success shadow-lg items-center justify-center"
        >
          <Image
            source={icons.addtransactions}
            className="w-10 h-10"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black/50">
            <View className="absolute bottom-[15rem] right-8 w-56 rounded-xl bg-secondary p-2 shadow-lg shadow-black/30 border border-accent/20">
              <View className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 transform bg-secondary border-b border-r border-accent/20" />

              {/* Add Card Option */}
              <TouchableOpacity
                className="flex-row items-center gap-3 rounded-lg p-3"
                onPress={() => {
                  setMenuVisible(false);
                  setAddCategoryModalVisible(true);
                }}
              >
                <Image
                  source={icons.addtransactions}
                  className="h-6 w-6"
                  resizeMode="contain"
                  tintColor="#AB8BFF"
                />
                <Text className="text-lg font-semibold text-light-100">Add Category</Text>
              </TouchableOpacity>

              <View className="my-1 h-[1px] bg-accent/20" />

              {/* Add Transaction Option */}
              <TouchableOpacity
                className="flex-row items-center gap-3 rounded-lg p-3"
                onPress={() => {
                  setMenuVisible(false);
                  setAddTransactionModalVisible(true);
                }}
              >
                <Image
                  source={icons.addtransactions}
                  className="h-6 w-6"
                  resizeMode="contain"
                  tintColor="#AB8BFF"
                />
                <Text className="text-lg font-semibold text-light-100">Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
