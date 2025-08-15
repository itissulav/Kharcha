// TransactionView.tsx

import CardOptionsModal from "@/components/CardOptionsModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditTransactionModal from "@/components/EditTransactionModal";
import InfoModal from "@/components/InfoModal";
import TransactionCard from "@/components/TransactionCard"; // <-- Using the new card
import TransactionFilter from "@/components/TransactionFilter";
import { initDatabase } from "@/db";
import { getAllAccounts } from "@/db/accounts";
import {
  deleteTransaction,
  getAllCategories,
  getTransactionsByAccount,
} from "@/db/transactions";
import { Account, Category, TransactionWithCategory } from "@/db/types";
import { handleLongPressTransaction } from "@/utilities/accountActions";
import { filterTransactions } from "@/utilities/filterTransactions";
import { groupTransactionsByDate } from "@/utilities/groupTransactionByDate";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionView() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [transactionByFilter, setTransactionByFilter] = useState<{
    [key: string]: TransactionWithCategory[];
  }>({});
  const [originalTransactionData, setOriginalTransactionData] = useState<{
    [key: string]: TransactionWithCategory[];
  }>({});

  const [transactionFilterVisible, setTransactionFilterVisible] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithCategory | null>(null);
  const [editTransactionVisible, setEditTransactionVisible] = useState(false);
  const [cardOptionsModalVisible, setCardOptionsModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      await initDatabase();
      const fetchedAccounts = (await getAllAccounts()) as Account[];
      const fetchedCategories = await getAllCategories();
      setAccounts(fetchedAccounts);
      setCategories(fetchedCategories);

      const transactionsMap: { [key: string]: TransactionWithCategory[] } = {};
      for (const account of fetchedAccounts) {
        const txns = (await getTransactionsByAccount(
          account.id
        )) as TransactionWithCategory[];
        transactionsMap[account.id] = txns;
      }

      setOriginalTransactionData(transactionsMap);
      setTransactionByFilter(transactionsMap);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handleFilters = (filters: {
    category: string | null;
    type: "debit" | "credit" | null;
    dateRange: "week" | "month" | "6months" | null;
  }) => {
    setTransactionFilterVisible(false);
    const filteredMap: { [key: string]: TransactionWithCategory[] } = {};
    for (const accountId in originalTransactionData) {
      const originalTxns = originalTransactionData[accountId];
      filteredMap[accountId] = filterTransactions(originalTxns, filters);
    }
    setTransactionByFilter(filteredMap);
  };

  const handleResetFilters = () => {
    setTransactionByFilter(originalTransactionData);
    setTransactionFilterVisible(false);
  };

  const handleTransactionDelete = async () => {
    if (!selectedTransaction) return;
    await deleteTransaction(selectedTransaction.id);
    setConfirmDeleteModalVisible(false);
    handleRefresh(); // Refresh data after delete
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const renderScene = () => {
    if (loading || accounts.length === 0) {
      return null;
    }
    const activeAccountId = accounts[activeIndex]?.id;
    const transactions = transactionByFilter[activeAccountId] || [];
    const grouped = groupTransactionsByDate(transactions);

    if (transactions.length === 0) {
      return (
        <View className="items-center justify-center h-64 bg-secondary rounded-2xl mt-4">
          <Ionicons name="archive-outline" size={48} color="#64748b" />
          <Text className="text-slate-400 text-lg font-semibold mt-4">
            No Transactions Found
          </Text>
          <Text className="text-slate-500 mt-1">This account is empty.</Text>
        </View>
      );
    }

    return (
      <View className="mt-4">
        {Object.entries(grouped).map(([label, txns]) => (
          <View key={label} className="mb-6">
            <Text className="text-slate-300 font-semibold text-base mb-3 px-1">
              {label}
            </Text>
            <View className="gap-y-2">
              {txns.map((txn) => (
                <TransactionCard
                  key={txn.id}
                  recentTransaction={txn as TransactionWithCategory}
                  onLongPress={() =>
                    handleLongPressTransaction(
                      txn,
                      setSelectedTransaction,
                      setCardOptionsModalVisible
                    )
                  }
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* All Modals */}
      <CardOptionsModal
        visible={cardOptionsModalVisible}
        onClose={() => setCardOptionsModalVisible(false)}
        onEdit={() => {
          setEditTransactionVisible(true);
          setCardOptionsModalVisible(false);
        }}
        onDelete={() => {
          setCardOptionsModalVisible(false);
          setConfirmDeleteModalVisible(true);
        }}
      />
      <ConfirmDeleteModal
        visible={confirmDeleteModalVisible}
        onCancel={() => setConfirmDeleteModalVisible(false)}
        onConfirm={handleTransactionDelete}
      />
      <InfoModal
        infoVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
      />
      <EditTransactionModal
        visible={editTransactionVisible}
        onClose={() => setEditTransactionVisible(false)}
        onSuccess={handleRefresh}
        accounts={accounts}
        categories={categories}
        transaction={selectedTransaction}
      />
      <TransactionFilter
        categories={categories}
        visible={transactionFilterVisible}
        onApply={handleFilters}
        onReset={handleResetFilters}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#a78bfa"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-8 pb-20">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2 h-11">
            <View className="flex-row items-center justify-around h-11">
              <Text className="text-white text-3xl font-bold items-center h-11">
                Transactions
              </Text>
              <TouchableOpacity
                onPress={() => setInfoVisible(true)}
                className="w-11 h-11 bg-secondary items-center justify-center"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#a78bfa"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setTransactionFilterVisible(true)}
              className="w-11 h-11 bg-secondary items-center justify-center rounded-full"
            >
              <Ionicons name="filter" size={22} color="#a78bfa" />
            </TouchableOpacity>
          </View>
          <Text className="text-slate-400 mb-8">
            An overview of your spending and income.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#a78bfa" className="mt-16" />
          ) : (
            <>
              {/* Custom Tab Bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
              >
                {accounts.map((route, i) => (
                  <TouchableOpacity
                    key={route.id}
                    onPress={() => setActiveIndex(i)}
                    className={`px-5 py-2.5 rounded-full ${
                      activeIndex === i ? "bg-accent" : "bg-secondary"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        activeIndex === i ? "text-primary" : "text-white"
                      }`}
                    >
                      {route.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Content */}
              {renderScene()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
