import React from "react";
import { Text, View } from "react-native";

type Prop = {
  totalBalance: number;
  title?: string;
};

const TotalBalanceCard = ({ totalBalance, title }: Prop) => {
  return (
    <View className="bg-secondary rounded-2xl shadow-md shadow-black/20 p-6 items-center w-full">
      <Text className="text-light-300 text-base mb-1">
        {title ? title : "Your total Balance"}
      </Text>
      <Text className="text-teal-500 text-3xl font-bold">
        Rs. {totalBalance}
      </Text>
    </View>
  );
};

export default TotalBalanceCard;
