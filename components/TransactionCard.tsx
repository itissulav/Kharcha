// TransactionCard.tsx

import { CreditTransaction, TransactionWithCategory } from "@/db/types";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const ICON_SETS = {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
};

type Props = {
  recentTransaction: TransactionWithCategory | CreditTransaction;
  onLongPress?: () => void;
};

export default function TransactionCard({
  recentTransaction,
  onLongPress,
}: Props) {
  const {
    type,
    category_name,
    category_icon,
    category_iconSet,
    amount,
    created_at,
    spending_type,
  } = recentTransaction as TransactionWithCategory;

  const IconComponent = ICON_SETS[category_iconSet as keyof typeof ICON_SETS];
  const isCredit = type === "credit";

  // Colors for credit / debit
  const amountColor = isCredit ? "text-green-400" : "text-red-400";
  const borderColor =
    spending_type === "essential" ? "border-blue-800" : "border-pink-800";

  return (
    <Pressable onLongPress={onLongPress}>
      <View
        className={`flex-row items-center bg-secondary p-4 rounded-xl mb-3 shadow-sm border-l-4 ${borderColor}`}
      >
        {/* Icon */}
        <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center mr-3">
          {IconComponent ? (
            <IconComponent
              name={category_icon as any}
              size={24}
              color="white"
            />
          ) : (
            <Ionicons name="help-circle" size={24} color="white" />
          )}
        </View>

        {/* Middle section - name + date */}
        <View className="flex-1">
          <Text
            className="text-light-100 text-base font-semibold"
            numberOfLines={1}
          >
            {category_name}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">{created_at}</Text>
        </View>

        {/* Amount */}
        <Text className={`text-lg font-bold ${amountColor}`}>
          {isCredit ? "+" : "-"} Rs. {amount}
        </Text>
      </View>
    </Pressable>
  );
}
