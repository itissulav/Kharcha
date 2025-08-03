import CardOptionsModal from '@/components/CardOptionsModal';
import CategoryCard from '@/components/CategoryCard';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import EditTransactionModal from '@/components/EditTransactionModal';
import TransactionCard from '@/components/TransactionCard'; // <-- your card UI
import TransactionFilter from '@/components/TransactionFilter';
import { initDatabase } from '@/db';
import { getAllAccounts } from '@/db/accounts';
import { deleteTransaction, getAllCategories, getTopSpendingCategories, getTransactionsByAccount } from '@/db/transactions';
import { Account, Category, TopSpendingCategory, TransactionWithCategory } from '@/db/types';
import { handleLongPressTransaction } from "@/utilities/accountActions";
import { filterTransactions } from '@/utilities/filterTransactions';
import { groupTransactionsByDate } from "@/utilities/groupTransactionByDate";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';


import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';

const initialLayout = { width: Dimensions.get('window').width };
type Route = {
  key: string;
  title: string;
};


export default function TransactionView() {
  const [topCategories, setTopSpendingCategories] = useState<TopSpendingCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [addEntryModalVisible, setAddEntryModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<any[]>([]);
  const [transactionByFilter, settransactionByFilter] = useState<{ [key: string]: TransactionWithCategory[] }>({});
  const [transactionFilterVisible, setTransactionFilterVisible] = useState(false);
  const [originalTransactionData, setOriginalTransactionData] = useState<{ [key: string]: TransactionWithCategory[] }>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithCategory | null>(null);
  const [editTransactionVisible, setEditTransactionVisible] = useState(false);
  const [CardOptionsModalVisible, setCardOptionsModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);



  const fetchAccount  = async() => {
    const accounts: Account[] = await getAllAccounts() as Account[];
    setAccounts(accounts as Account[]);
  };

  const fetchTopCategories = async() => {
    const topCategories = await getTopSpendingCategories();
    setTopSpendingCategories(topCategories as TopSpendingCategory[]);
  };

  const fetchTransactionByAccount = async () => {
    const transactionsMap: { [key: string]: TransactionWithCategory[] } = {};
    const routesList: any[] = [];

    for (const account of accounts) {
      const txns = await getTransactionsByAccount(account.id) as TransactionWithCategory[];
      transactionsMap[account.id] = txns;
      routesList.push({ key: String(account.id), title: account.name });
    }

    setOriginalTransactionData(transactionsMap); // <-- unfiltered backup
    settransactionByFilter(transactionsMap);     // <-- visible filtered data
    setRoutes(routesList);
  };



  const fetchAllCategories = async() => {
    const categories = await getAllCategories();
    setCategories(categories);
  };


  const fetchData = async () => {
    try{
      await initDatabase();
      await fetchAccount();
      await fetchTopCategories();
      await fetchAllCategories();
      await fetchTransactionByAccount();
    }
    catch(err){
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };



  const renderScene = ({ route }: { route: { key: string; title: string } }) => {
    const transactions = transactionByFilter[route.key] || [];
    const grouped = groupTransactionsByDate(transactions);

    return (
      <ScrollView className="pt-4 gap-3">
        {Object.entries(grouped).map(([label, txns]) => (
          <View key={label}>
            <Text className="text-light-100 font-semibold text-lg mb-2 px-2">{label}</Text>
            {txns.map((txn) => (
              <TransactionCard
                key={txn.id}
                recentTransaction={txn}
                onLongPress={() =>
                  handleLongPressTransaction(txn, setSelectedTransaction, setCardOptionsModalVisible)
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };


  const handleFilters = async (filters: {
    category: string | null;
    type: "debit" | "credit" | null;
    dateRange: "week" | "month" | "6months" | null;
  }) => {
    setTransactionFilterVisible(false);

    const filteredMap: { [key: string]: TransactionWithCategory[] } = {};

    for (const accountId in originalTransactionData) {
      const originalTxns = originalTransactionData[accountId]; // <- always fresh
      filteredMap[accountId] = filterTransactions(originalTxns, filters);
    }

    settransactionByFilter(filteredMap);
  };

  const handleTransactionDelete = async() => {
    if (!selectedTransaction){
      return null;
    }
    await deleteTransaction(selectedTransaction?.id);
    setConfirmDeleteModalVisible(false);

    fetchTransactionByAccount();
  }

  useEffect(() => {
    fetchData();
    fetchTransactionByAccount();
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
        showsVerticalScrollIndicator = {false}
      >
        <View className='gap-4'>
          {/* Modal for Adding Entry */}

          <CardOptionsModal
            visible = {CardOptionsModalVisible}
            onClose={ () => {setCardOptionsModalVisible(false)}}
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
            visible= {confirmDeleteModalVisible}
            onCancel={() => {setConfirmDeleteModalVisible(false)}}
            onConfirm={() => {handleTransactionDelete()}}
          />

          <EditTransactionModal
            visible = {editTransactionVisible}
            onClose={ () => {setEditTransactionVisible(false)}}
            onSuccess={ () => {fetchTransactionByAccount()}}
            accounts={accounts}
            categories={categories}
            transaction={selectedTransaction}
          />

          {/* Header */}
          <Text className="text-light-100 text-2xl font-bold mb-2 mt-4">
            Transactions Overview
          </Text>
          <Text className="text-light-300 mb-6">
            Track where your money is going based on top spending categories.
          </Text>

          {/* Top Categories */}
          <View>
            <View className='flex-row justify-between items-center'>
              <Text className="text-light-200 text-lg font-semibold mb-3">Top Spending Categories</Text>
              <TouchableOpacity
                onPress={() => {router.push("/category")}}
              >
                <Text className='text-light-200 text-lg font-semibold mb-3 border-b border-white pb-0.20 items-center'>View all</Text>
              </TouchableOpacity>
            </View> 

            <View className="flex-row flex-wrap gap-4">
              {topCategories.length > 0 ? (
                (topCategories as TopSpendingCategory[]).map((cat) => (
                  <CategoryCard
                    key={cat.category_name}
                    category={cat}
                  />
                ))
              ) : (
                <Text className="text-muted-100 italic">No transactions yet.</Text>
              )}
            </View>
          </View>
          
          <TransactionFilter
            categories={categories}
            visible = {transactionFilterVisible}
            onApply ={(filters) => handleFilters(filters)}
            onReset={() => {
              fetchTransactionByAccount();
              setTransactionFilterVisible(false);
            }}
          />

          <View className='mb-6'> 
            <View className='flex-row justify-between items-center pr-2'>
              <Text className='text-light-200 text-lg font-semibold mb-3'>Transactions by Account</Text>

              <TouchableOpacity 
                onPress={() => {
                  setTransactionFilterVisible(true);                
                }}
                className='bg-accent px-6 py-2 rounded-2xl self-start shadow-md'
              >
                <Text className='text-white text-base font-semibold'>Filter</Text>
              </TouchableOpacity>

            </View>            
              <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                style = {{height : 400}}
                renderTabBar={({navigationState, jumpTo}) => (
                  <View className="flex-row gap-3 mb-3">
                    {navigationState.routes.map((route, i) => (
                      <TouchableOpacity
                        key={route.key}
                        onPress={() => jumpTo(route.key)}
                        className={`px-4 py-2 rounded-full ${
                          index === i ? 'bg-accent' : 'bg-muted-200'
                        }`}
                      >
                        <Text
                          className={`${
                            index === i ? 'text-white' : 'text-light-300'
                          } text-sm font-medium`}
                        >
                          {route.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
