import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <ActivityIndicator size="large" color="#fff" />
      <Text className="text-light-200 text-lg mt-4">{message}</Text>
    </View>
  );
};

export default LoadingScreen;
