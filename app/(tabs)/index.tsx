import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

import AddAccountModal from "@/components/AddAccountModal";
import AddCard from "@/components/AddCard";
import CardOptionsModal from "@/components/CardOptionsModal";
import EditAccountModal from "@/components/EditAccountModal";
import StorageCard from "@/components/StorageCard";

import { initDatabase, resetDatabase } from "@/db";
import { getAllAccounts } from "@/db/accounts";
import {
  getAllCategories,
  getTotalEarnedPerMonth,
  getTotalSpentPerMonth
} from "@/db/transactions";
import { Account, Category, TopSpendingCategory } from "@/db/types";

import AddCategoryModal from "@/components/AddCategoryModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import HomeCards from "@/components/HomeCards";
import IncomeTab from "@/components/IncomeTab";
import MonthlySpendingCard from "@/components/MonthlyBudgetCards";
import TopCategoriesModal from "@/components/TopCategoriesModal";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { handleDelete, handleLongPress } from "@/utilities/accountActions";
import { handleRecurringTransactions } from "@/utilities/handleRecurringTransactions";
import { router } from "expo-router";

const screenWidth = Dimensions.get("window").width;



export default function Index() {
  const { user, loading: isLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAccountModalVisible, setEditAccountModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
  const [totalSpent, setTotalSpent] = useState<number>();
  const [totalEarned, setTotalEarned] = useState<number>();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const [incomeTabPressed, SetIncomeTabPressed] = useState(false);
  const [expenseTabPressed, setExpenseTabPressed] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TopSpendingCategory & { percentage?: number }>();




  const fetchData = async () => {
    await initDatabase();

    const data = await getAllAccounts();
    const categories = await getAllCategories();
    const totalSpentPerMonth = await getTotalSpentPerMonth();
    const totalEarnedPerMonth = await getTotalEarnedPerMonth();


    setAccounts(data as Account[]);
    setCategories(categories);
    setTotalSpent(totalSpentPerMonth);
    setTotalEarned(totalEarnedPerMonth);
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

  useEffect(() => {
    fetchData();
    handleRecurringTransactions(accounts);
  }, []);

  if (isLoading){
    return (
      <ActivityIndicator></ActivityIndicator>
    )
  }

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
          initialCategory={selectedCategory}
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
          <Text className="text-light-100 text-2xl font-bold mt-4 mb-2">Hi, {user?.displayName || "there"}</Text>
          <Pressable onPress={() => router.push("/profile")}>
            <Image
              source={icons.person}
              className="w-12 h-12"
              style={{ tintColor: "#03A6A1" }} // subtle muted gray for inactive
            />
          </Pressable>
        </View>

        <HomeCards
          totalEarned={totalEarned || 0}
          totalSpent={totalSpent || 0}
          totalBalance={totalBalance}
        />

        {/* Header */}
        <Text className="text-light-100 text-2xl font-bold  mb-2">Your Balance</Text>
        <Text className="text-light-300 mb-6">
          Track and manage all your accounts in one place.
        </Text>


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
        {/* Reset Database Button */}
        <TouchableOpacity
          onPress={handleReset}
          className="bg-error px-5 py-3 rounded-xl self-center"
        >
          <Text className="text-white font-semibold">Reset Database</Text>
        </TouchableOpacity>

        <View className="bg-primary border rounded-2xl py-8 px-3 mt-5 ">
          <View className="flex-row justify-around mb-8">
            <TouchableOpacity className={`w-[40%] ${expenseTabPressed?  "bg-accent": "" } px-5 py-3 rounded-xl self-center  border border-gray-800`}
              onPress={() => {
                setExpenseTabPressed(true);
                SetIncomeTabPressed(false);
              }}
            >
                <Text className="text-white text-center">Expenses</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-[40%] ${incomeTabPressed?  "bg-accent": "" } px-5 py-3 rounded-xl self-center border border-gray-800`}
              onPress={() =>{
                SetIncomeTabPressed(true);
                setExpenseTabPressed(false);
              }}
            >
                <Text className="text-white text-center">Income</Text>
            </TouchableOpacity>
          </View>
            {expenseTabPressed?(
              <View className="items-center justify-center gap-4">
                <TopCategoriesModal
                  onAdd={(category) => {
                    setSelectedCategory(category as TopSpendingCategory & { percentage?: number })
                    setAddTransactionModalVisible(true);
                  }}
                />
                <MonthlySpendingCard
                  totalEarned={totalEarned!}
                  totalSpent={totalSpent!}
                />
              </View>
            ): (
              <View>
                <IncomeTab
                  onAdd={(category) => {
                    setSelectedCategory(category);
                    setAddTransactionModalVisible(true);
                  }}
                />
              </View>
            )}
        </View>



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
