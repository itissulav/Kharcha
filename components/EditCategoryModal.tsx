import { updateCategory } from "@/db/transactions";
import { CategoryTransactionWithPercent } from "@/db/types";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} as const;

const COMBINED_ICONS = Object.entries(ICON_SETS).flatMap(
  ([setName, IconComponent]) =>
    Object.keys(IconComponent.glyphMap).map((iconName) => ({
      setName,
      iconName,
      IconComponent,
    }))
);

export default function EditCategoryModal({
  category,
  visible,
  onClose,
  onSave,
}: {
  category: CategoryTransactionWithPercent | null;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(category?.category_name);
  const [selectedIcon, setSelectedIcon] = useState<{
    iconName: string | undefined;
    setName: string | undefined;
  } | null>({
    iconName: category?.category_icon,
    setName: category?.category_iconSet,
  });
  const [transactionCategory, setTransactionCategory] = useState<
    "essential" | "lifestyle"
  >(category?.spending_type ?? "essential");
  const [monthlyLimit, setMonthlyLimit] = useState<string>(
    category?.category_limit !== undefined && category.category_limit !== null
      ? category.category_limit.toLocaleString()
      : ""
  );
  const [searchText, setSearchText] = useState(category?.category_icon);
  const [nameError, setNameError] = useState("");
  const [iconError, setIconError] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchText?.trim()) return COMBINED_ICONS;
    return COMBINED_ICONS.filter((icon) =>
      icon.iconName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handleSave = async () => {
    let hasError = false;

    if (!name?.trim()) {
      setNameError("Please enter a category name.");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!selectedIcon) {
      setIconError("Please select an icon.");
      hasError = true;
    } else {
      setIconError("");
    }

    if (hasError) return;

    if (!monthlyLimit) setMonthlyLimit("");

    let success = false;

    try {
      success = await updateCategory({
        id: category?.category_id!,
        name: name!.trim(),
        icon: selectedIcon!.iconName!,
        iconSet: selectedIcon!.setName!,
        categoryLimit: parseFloat(monthlyLimit!),
        spending_type: transactionCategory,
      });
    } catch (error) {
      console.log(error);
    }

    if (success) {
      setName("");
      setSelectedIcon(null);
      setSearchText("");
      setNameError("");
      setIconError("");
      onSave();
      onClose();
    } else {
      alert("Something went wrong while saving the category.");
    }
  };

  useEffect(() => {
    setName(category?.category_name ?? "");
    setSelectedIcon({
      iconName: category?.category_icon,
      setName: category?.category_iconSet,
    });
    setTransactionCategory(category?.spending_type ?? "essential");
    setMonthlyLimit(
      category?.category_limit !== undefined && category.category_limit !== null
        ? category.category_limit.toLocaleString()
        : ""
    );
    setSearchText(category?.category_icon ?? "");
    setNameError("");
    setIconError("");
  }, [category]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="bg-secondary p-6 rounded-xl w-full max-w-md shadow-lg">
          <Text className="text-light-100 text-xl font-bold mb-6">
            Edit Category
          </Text>

          {/* Type Toggle */}
          <View className="mb-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => setTransactionCategory("lifestyle")}
              className={`flex-1 p-3 rounded-l-lg items-center ${
                transactionCategory === "lifestyle"
                  ? "bg-red-500"
                  : "bg-dark-100"
              }`}
            >
              <Text className="text-white font-semibold">Lifestyle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTransactionCategory("essential")}
              className={`flex-1 p-3 rounded-r-lg items-center ${
                transactionCategory === "essential"
                  ? "bg-green-600"
                  : "bg-dark-100"
              }`}
            >
              <Text className="text-white font-semibold">Essential</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-light-300 text-sm mb-1">Category Name</Text>
            {nameError ? (
              <Text className="text-red-400 text-xs mb-1">{nameError}</Text>
            ) : null}
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) {
                  setNameError("");
                  setIconError("");
                }
              }}
              placeholder="e.g. Grocery"
              className={`bg-dark-100 text-white rounded-lg p-3 text-base ${
                nameError ? "border border-red-500" : ""
              }`}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Monthly Limit */}
          <View className="mb-4">
            <Text className="text-light-300 text-sm mb-1">
              Monthly Spending Limit (optional)
            </Text>
            <TextInput
              value={monthlyLimit}
              onChangeText={(text) => {
                setMonthlyLimit(text);
              }}
              placeholder="e.g. Rs 2000/month"
              className={`bg-dark-100 text-white rounded-lg p-3 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Icon Search + Grid */}
          <View className="mb-4">
            <Text className="text-light-300 text-sm mb-1">Select Icon</Text>
            {iconError ? (
              <Text className="text-red-400 text-xs mb-1">{iconError}</Text>
            ) : null}
            <TextInput
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (selectedIcon) {
                  setIconError("");
                  setNameError("");
                }
              }}
              placeholder="Search for an icon..."
              className={`bg-dark-100 text-white rounded-lg p-3 mb-2 ${
                iconError ? "border border-red-500" : ""
              }`}
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredIcons}
              keyExtractor={(item) => `${item.setName}_${item.iconName}`}
              numColumns={6}
              contentContainerStyle={{ paddingBottom: 8 }}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => {
                const isSelected =
                  selectedIcon?.iconName === item.iconName &&
                  selectedIcon?.setName === item.setName;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedIcon({
                        iconName: item.iconName,
                        setName: item.setName,
                      });
                      setIconError("");
                    }}
                    className={`p-2 m-1 rounded-full border items-center justify-center ${
                      isSelected
                        ? "border-teal-600 bg-teal-100"
                        : "border-gray-500"
                    }`}
                    style={{ flex: 1, maxWidth: "16.66%" }}
                  >
                    <item.IconComponent
                      name={item.iconName as any}
                      size={24}
                      color={isSelected ? "#0f766e" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Buttons */}
          <View className="flex-row justify-between gap-4 mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-red-500 px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className={`flex-1 ${
                name && selectedIcon ? "bg-teal-500" : "bg-dark-200"
              } px-4 py-3 rounded-lg items-center`}
            >
              <Text className="text-white font-semibold text-base">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
