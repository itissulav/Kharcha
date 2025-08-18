import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { initDatabase } from "@/db";
import { getAllAccounts } from "@/db/accounts";
import { getAllCategories } from "@/db/transactions";
import { Account, Category } from "@/db/types";

import AddCategoryModal from "@/components/AddCategoryModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import TotalBalanceCard from "@/components/TotalCard";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { handleDelete, handleLongPress } from "@/utilities/accountActions";
import { handleRecurringTransactions } from "@/utilities/handleRecurringTransactions";
import { router } from "expo-router";

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
  const [addTransactionModalVisible, setAddTransactionModalVisible] =
    useState(false);
  const [totalSpent, setTotalSpent] = useState<number>();
  const [totalEarned, setTotalEarned] = useState<number>();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const [incomeTabPressed, SetIncomeTabPressed] = useState(false);
  const [expenseTabPressed, setExpenseTabPressed] = useState(true);

  const fetchData = async () => {
    console.log("Nothing initialized");
    await initDatabase();
    console.log("Database Initialized");

    const data = await getAllAccounts();
    console.log("Fetched Data");

    const categories = await getAllCategories();
    console.log("Accounts Fetched");

    setAccounts(data as Account[]);
    setCategories(categories);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleRecurringTransactions(accounts);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    handleRecurringTransactions(accounts);
  }, []);

  if (isLoading) {
    return <ActivityIndicator></ActivityIndicator>;
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
        />
        <AddCategoryModal
          visible={addCategoryModalVisible}
          onClose={() => {
            setAddCategoryModalVisible(false);
          }}
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
          onDelete={() =>
            handleDelete(selectedAccount, setAccounts, setOptionsVisible)
          }
        />
        {/* Profile Image and Greeting */}
        <View className="bg-primary rounded-2xl flex-row items-center justify-between px-4 py-2">
          <Text className="text-light-100 text-2xl font-bold mt-4 mb-2">
            Hi, {user?.displayName || "there"}
          </Text>
          <Pressable onPress={() => router.push("/profile")}>
            <Image
              source={icons.person}
              className="w-12 h-12"
              style={{ tintColor: "#03A6A1" }} // subtle muted gray for inactive
            />
          </Pressable>
        </View>
        <TotalBalanceCard totalBalance={totalBalance} />
        {/* Header */}
        <Text className="text-light-100 text-2xl font-bold  mb-2 mt-4">
          Your Balance
        </Text>
        <Text className="text-light-300 mb-6">
          Track and manage all your accounts in one place.
        </Text>
        {/* Storage Cards */}
        <View>
          <Text className="text-light-200 text-lg font-semibold mb-3">
            Storage Accounts
          </Text>
          <View className="flex-row justify-center gap-4 items-center flex-wrap">
            {accounts.map((account) => (
              <StorageCard
                key={account.id}
                account={account}
                onLongPress={() =>
                  handleLongPress(
                    account,
                    setSelectedAccount,
                    setOptionsVisible
                  )
                }
              />
            ))}
            <AddCard onPress={() => setModalVisible(true)} />
          </View>
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
                <Text className="text-lg font-semibold text-light-100">
                  Add Category
                </Text>
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
                <Text className="text-lg font-semibold text-light-100">
                  Add Transaction
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
