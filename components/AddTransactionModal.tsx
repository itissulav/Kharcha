import { Account, Category, DailyCategoryDebit } from "@/db/types";
import { handleAddTransaction } from "@/utilities/handleAddTransaction";
import {
  validateAccount,
  validateAmount,
  validateCategory,
} from "@/utilities/validationUtil";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Switch } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
};

const recurrenceOptions = [
  { label: "Day(s)", value: "daily" },
  { label: "Week(s)", value: "weekly" },
  { label: "Month(s)", value: "monthly" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[] | DailyCategoryDebit[];
  initialCategory?: DailyCategoryDebit | null;
  initialType?: "credit" | "debit";
};

export default function AddTransactionModal({
  visible,
  onClose,
  onSuccess,
  accounts,
  categories,
  initialCategory = null,
  initialType = "debit",
}: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<
    DailyCategoryDebit | Category | null
  >(categories[0]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"credit" | "debit">(initialType);
  const [date, setDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [recurrenceDropdownVisible, setRecurrenceDropdownVisible] =
    useState(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");

  const [validationErrors, setValidationErrors] = useState({
    account: false,
    amount: false,
    category: false,
  });

  useEffect(() => {
    if (visible) {
      if (initialCategory) {
        setSelectedCategory({
          category_id: initialCategory.category_id,
          category_name: initialCategory.category_name,
          category_icon: initialCategory.category_icon,
          category_iconSet: initialCategory.category_iconSet,
          category_limit: initialCategory.category_limit,
          spending_type: initialCategory.spending_type,
        });
      } else {
        // Optional: reset category if no initialCategory when modal opens
        setSelectedCategory(null);
      }
      // Optional: reset selectedAccountId on modal open (could set to first account)
      setSelectedAccountId(accounts[0]?.id ?? null);
      setAmount("");
      setIsRecurring(false);
      setRecurrenceInterval("1");
      setValidationErrors({ account: false, amount: false, category: false });
    }
  }, [visible, initialCategory, accounts]);

  const handleAdd = async () => {
    const amountValidation = validateAmount(amount);
    const accountValidation = validateAccount(selectedAccountId);
    const categoryValidation = validateCategory(selectedCategory);

    const newValidationErrors = {
      amount: !amountValidation.valid,
      account: !accountValidation.valid,
      category: !categoryValidation.valid,
    };
    setValidationErrors(newValidationErrors);

    if (
      !amountValidation.valid ||
      !accountValidation.valid ||
      !categoryValidation.valid
    ) {
      // Show first error message only
      Alert.alert(
        "Validation Error",
        amountValidation.message ||
          accountValidation.message ||
          categoryValidation.message
      );
      return;
    }

    const parsedAmount = parseFloat(amount);

    const success = await handleAddTransaction({
      date,
      amount: parsedAmount,
      type,
      selectedAccountId,
      selectedCategoryId: selectedCategory!.category_id,
      accounts,
      isRecurring,
      recurrencePattern,
      recurrenceInterval,
    });

    if (!success) {
      Alert.alert("Error", "Failed to add transaction.");
      return;
    } else {
      Alert.alert("Success!", "Transaction Successfully Added!");
    }

    // Reset form on success
    setAmount("");
    setIsRecurring(false);
    setRecurrenceInterval("1");
    setSelectedCategory(categories[0] ?? null);
    setSelectedAccountId(accounts[0]?.id ?? null);
    setType("debit");
    setValidationErrors({ account: false, amount: false, category: false });

    onSuccess();
    onClose();
  };

  const isFormValid =
    validateAmount(amount).valid &&
    validateAccount(selectedAccountId).valid &&
    validateCategory(selectedCategory).valid;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="w-full max-w-md"
            >
              <SafeAreaView className="bg-secondary rounded-xl p-6">
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-light-100 text-xl font-bold mb-6">
                    Add Transaction
                  </Text>

                  {/* Account Picker */}
                  <View className="bg-dark-100 rounded-lg mb-4 h-24 justify-center overflow-hidden">
                    <Picker
                      selectedValue={selectedAccountId}
                      onValueChange={(val) => {
                        setSelectedAccountId(val);
                        setValidationErrors((prev) => ({
                          ...prev,
                          account: false,
                        }));
                      }}
                      style={{ color: "white" }}
                      dropdownIconColor="white"
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
                  {validationErrors.account && (
                    <Text className="text-red-400 text-xs mb-2">
                      Please select an account
                    </Text>
                  )}

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

                  {/* Amount Input */}
                  <View className="mb-4">
                    <Text className="text-light-300 text-sm mb-1">Amount</Text>
                    {validationErrors.amount && (
                      <Text className="text-red-400 text-xs mb-1">
                        Valid amount is required
                      </Text>
                    )}
                    <TextInput
                      value={amount}
                      onChangeText={(val) => {
                        setAmount(val);
                        setValidationErrors((prev) => ({
                          ...prev,
                          amount: false,
                        }));
                      }}
                      placeholder="e.g. 1000"
                      keyboardType="numeric"
                      className="bg-dark-100 text-white rounded-lg p-3 text-base"
                      placeholderTextColor="#9CA4AB"
                      style={{
                        borderColor: validationErrors.amount
                          ? "red"
                          : "transparent",
                        borderWidth: validationErrors.amount ? 1 : 0,
                      }}
                    />
                  </View>

                  {/* Category Selector */}
                  <View className="mb-4">
                    <Text className="text-light-300 text-sm mb-1">
                      Category
                    </Text>
                    {validationErrors.category && (
                      <Text className="text-red-400 text-xs mb-1">
                        Please select a category
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => setCategoryDropdownVisible(true)}
                      className="bg-dark-100 rounded-lg p-3 flex-row items-center justify-between"
                    >
                      {selectedCategory ? (
                        <>
                          <View className="flex-row items-center gap-2">
                            {(() => {
                              const IconComponent =
                                ICON_SETS[
                                  selectedCategory.category_iconSet as keyof typeof ICON_SETS
                                ];
                              return IconComponent ? (
                                <IconComponent
                                  name={selectedCategory.category_icon as any}
                                  size={24}
                                  color="#38B2AC"
                                />
                              ) : (
                                <Ionicons
                                  name="pricetag-outline"
                                  size={24}
                                  color="#38B2AC"
                                />
                              );
                            })()}
                            <Text className="text-white text-base">
                              {selectedCategory.category_name}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-down-outline"
                            size={20}
                            color="white"
                          />
                        </>
                      ) : (
                        <Text className="text-gray-400">Select category</Text>
                      )}
                    </TouchableOpacity>

                    {/* Category Dropdown Modal */}
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
                                key={cat.category_id}
                                className="flex-row items-center p-3 rounded-md mb-1"
                                onPress={() => {
                                  setSelectedCategory(cat);
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    category: false,
                                  }));
                                  setCategoryDropdownVisible(false);
                                }}
                              >
                                {(() => {
                                  const IconComponent =
                                    ICON_SETS[
                                      cat.category_iconSet as keyof typeof ICON_SETS
                                    ];
                                  return IconComponent ? (
                                    <IconComponent
                                      name={cat.category_icon as any}
                                      size={28}
                                      color="#38B2AC"
                                    />
                                  ) : (
                                    <Ionicons
                                      name="pricetag-outline"
                                      size={28}
                                      color="#38B2AC"
                                    />
                                  );
                                })()}
                                <Text className="text-light-100 text-lg ml-3">
                                  {cat.category_name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>

                  {/* Date Picker */}
                  <View className="mb-6">
                    <Text className="text-light-300 text-sm mb-1">
                      Date & Time
                    </Text>
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
                        value={date}
                        mode="datetime"
                        display="default"
                        onChange={(_, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) setDate(selectedDate);
                        }}
                      />
                    )}
                  </View>

                  {/* Recurring Switch */}
                  <View className="mb-6">
                    <Text className="text-light-300 text-sm mb-1">
                      Recurring Payment
                    </Text>
                    <Switch
                      value={isRecurring}
                      onValueChange={setIsRecurring}
                    />
                  </View>

                  {isRecurring && (
                    <View className="mb-6">
                      <Text className="text-light-300 text-sm mb-1">
                        Repeat Every
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <TextInput
                          value={recurrenceInterval}
                          onChangeText={setRecurrenceInterval}
                          keyboardType="numeric"
                          className="bg-dark-100 text-white rounded-lg p-3 w-16"
                        />
                        <TouchableOpacity
                          onPress={() => setRecurrenceDropdownVisible(true)}
                          className="bg-dark-100 rounded-lg p-3"
                        >
                          <Text className="text-white">
                            {recurrenceOptions.find(
                              (opt) => opt.value === recurrencePattern
                            )?.label || "Select frequency"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Modal
                        transparent
                        visible={recurrenceDropdownVisible}
                        animationType="fade"
                        onRequestClose={() =>
                          setRecurrenceDropdownVisible(false)
                        }
                      >
                        <TouchableOpacity
                          className="flex-1 justify-center items-center bg-black/50"
                          activeOpacity={1}
                          onPressOut={() => setRecurrenceDropdownVisible(false)}
                        >
                          <View className="bg-secondary w-72 rounded-xl p-4">
                            {recurrenceOptions.map((option) => (
                              <TouchableOpacity
                                key={option.value}
                                className="p-3 border-b border-muted-100"
                                onPress={() => {
                                  setRecurrencePattern(option.value as any);
                                  setRecurrenceDropdownVisible(false);
                                }}
                              >
                                <Text className="text-white text-base">
                                  {option.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </TouchableOpacity>
                      </Modal>
                    </View>
                  )}

                  {/* Buttons */}
                  <View className="flex-row justify-between gap-4 mt-4">
                    <TouchableOpacity
                      onPress={onClose}
                      className="flex-1 bg-red-500 px-4 py-3 rounded-lg items-center"
                    >
                      <Text className="text-white font-semibold text-base">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAdd}
                      className={`flex-1 ${
                        isFormValid ? "bg-teal-500" : "bg-dark-200"
                      } px-4 py-3 rounded-lg items-center`}
                    >
                      <Text className="text-white font-semibold text-base">
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
