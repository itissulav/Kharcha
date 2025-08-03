// components/AddCard.tsx
import { Text, TouchableOpacity, View } from "react-native";

export default function AddCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="w-[48%]">
      <View className="w-full aspect-video rounded-2xl border-2 border-dashed border-light-300 justify-center items-center">
        <Text className="text-light-300 text-xl">＋</Text>
      </View>
    </TouchableOpacity>
  );
}
