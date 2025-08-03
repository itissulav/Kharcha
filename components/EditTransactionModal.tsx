import { updateAccountBalance } from "@/db/accounts";
import { updateTransaction } from "@/db/transactions";
import { Account, Category, TransactionWithCategory } from "@/db/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[]; // category has at least id, name, icon
  transaction: TransactionWithCategory | null;
};

export default function EditTransactionModal({
  visible,
  onClose,
  onSuccess,
  accounts,
  categories,
  transaction
}: Props) {
    if (!transaction){
      return null;
    }
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    accounts[0]?.id ?? null
  );
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories[0] ?? null
  );
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  useEffect(() => {
    if (transaction) {
      setSelectedAccountId(transaction.account_id ?? accounts[0]?.id ?? null);
      setAmount(transaction.amount.toString());
      setDate(new Date(transaction.created_at));
      setType(transaction.type);
      const matchedCategory = categories.find(c => c.id === transaction.category_id);
      setSelectedCategory(matchedCategory ?? categories[0] ?? null);
    }
  }, [transaction, accounts, categories]);

  const handleAdd = async () => {
    if (!selectedAccountId || !amount || !selectedCategory) return;

    const amountValue = parseFloat(amount);
    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
    if (!selectedAccount) return;

    await updateTransaction({
      account_id: selectedAccountId,
      type,
      category_id: selectedCategory.id,
      note: "Manual Entry",
      amount: amountValue,
      created_at: date.toISOString(),
      transaction_id: transaction.id
    });

    const updatedBalance =
      type === "credit"
        ? selectedAccount.balance + amountValue
        : selectedAccount.balance - amountValue;

    await updateAccountBalance(selectedAccountId, updatedBalance);

    setAmount("");
    setSelectedCategory(categories[0] ?? null);
    setType("debit");
    onSuccess();
    onClose();
  };

  return (

    <Modal visible = {visible} animationType="slide" transparent = {true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="bg-secondary rounded-xl w-full max-w-md shadow-lg p-4 max-h-[90%]">
          <ScrollView className="gap-4">
                      <Text className="text-light-100 text-xl font-bold mb-6">
                Add Transaction
              </Text>

              {/* Storage Picker with native iOS wheel style */}
              <View className="mb-4">
                <Text className="text-light-300 text-sm mb-1">Storage</Text>
                <View
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Picker
                    selectedValue={selectedAccountId}
                    onValueChange={(value) => setSelectedAccountId(value)}
                    style={{ color: "white", height: 150 }} // tall enough for wheel
                    itemStyle={{ color: "white", fontSize: 20 }} // iOS wheel text style
                  >
                    {accounts.map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={account.name}
                        value={account.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Type Toggle */}
              <View className="mb-4 flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setType("debit")}
                  className={`flex-1 p-3 rounded-l-lg items-center ${
                    type === "debit" ? "bg-red-500" : "bg-dark-100"
                  }`}
                >
                  <Text className="text-white font-semibold">Debit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setType("credit")}
                  className={`flex-1 p-3 rounded-r-lg items-center ${
                    type === "credit" ? "bg-green-600" : "bg-dark-100"
                  }`}
                >
                  <Text className="text-white font-semibold">Credit</Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View className="mb-4">
                <Text className="text-light-300 text-sm mb-1">Amount</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder= {"Rs. "+ transaction.amount.toString()}
                  keyboardType="numeric"
                  className="bg-dark-100 text-white rounded-lg p-3 text-base"
                  placeholderTextColor="#FFFFFF"
                />
              </View>

              {/* Category Dropdown */}
              <View className="mb-4">
                <Text className="text-light-300 text-sm mb-1">Category</Text>
                <TouchableOpacity
                  onPress={() => setCategoryDropdownVisible(true)}
                  className="bg-dark-100 rounded-lg p-3 flex-row items-center justify-between"
                >
                  {selectedCategory ? (
                    <>
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name={transaction.category_icon || "pricetag-outline"}
                          size={24}
                          color="#38B2AC"
                        />
                        <Text className="text-white text-base">
                          {transaction.category_name}
                        </Text>
                      </View>
                      <Ionicons name="chevron-down-outline" size={20} color="white" />
                    </>
                  ) : (
                    <Text className="text-gray-400">Select category</Text>
                  )}
                </TouchableOpacity>

                {/* Category selection modal */}
                <Modal
                  visible={categoryDropdownVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setCategoryDropdownVisible(false)}
                >
                  <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    onPress={() => setCategoryDropdownVisible(false)}
                    activeOpacity={1}
                  >
                    <View className="bg-secondary rounded-lg p-4 w-80 max-h-96">
                      <ScrollView>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className="flex-row items-center p-3 rounded-md mb-1"
                            onPress={() => {
                              setSelectedCategory(cat);
                              setCategoryDropdownVisible(false);
                            }}
                          >
                            <Ionicons
                              name={cat.icon || "pricetag-outline"}
                              size={28}
                              color="#38B2AC"
                              className="mr-3"
                            />
                            <Text className="text-light-100 text-lg">{cat.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* Date and Time Picker */}
              <View className="mb-6">
                <Text className="text-light-300 text-sm mb-1">Date & Time</Text>
                <TouchableOpacity
                  className="bg-dark-100 rounded-lg p-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-white">
                    {date.toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(transaction.created_at)}
                    mode="datetime"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between gap-4">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-red-500 px-4 py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold text-base">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAdd}
                  className="flex-1 bg-teal-500 px-4 py-3 rounded-lg items-center"
                  disabled={!amount || !selectedCategory || !selectedAccountId}
                >
                  <Text className="text-white font-semibold text-base">Confirm</Text>
                </TouchableOpacity>
              </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

    </Modal>

  );
}
