// components/StorageCard.tsx
import { images } from "@/constants/images";
import { Account } from "@/db/types";
import { Image, Pressable, Text, View } from "react-native";

export default function StorageCard({
  account,
  onLongPress,
}: {
  account: Account,
  onLongPress?: () => void;
}) {

  const icon = images[account.name.toLowerCase() as keyof typeof images]
  const amount = account.balance
  const label = account.name

  return (
    <Pressable
      onLongPress={onLongPress}
      className="bg-secondary rounded-2xl shadow-md p-4 w-[48%] mb-4"
    >
      <Image source={icon} className="w-12 h-12 mb-2" resizeMode="contain" />

      <View>
        <Text className="text-light-300 text-sm">{label}</Text>
        <Text className="text-teal-500 text-xl font-bold mt-1">
          Rs. {amount}
        </Text>
      </View>
    </Pressable>
  );
}
