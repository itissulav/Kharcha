import { Feather, Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PreferencesPage() {
  const [monthlyLimit, setMonthlyLimit] = useState("50000");
  const [lifestyleRatio, setLifestyleRatio] = useState(60); // %
  const [darkMode, setDarkMode] = useState(false);

  return (
        <SafeAreaView className="flex-1 bg-primary p-5">
        {/* Title */}
        <Text className="text-3xl font-bold text-light-100 mb-6">Preferences</Text>

        {/* Monthly Limit */}
        <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50">
            <View className="flex-row items-center mb-3">
            <Feather name="target" size={22} color="#AB8BFF" />
            <Text className="ml-3 text-xl font-semibold text-light-100">
                Monthly Spending Limit
            </Text>
            </View>
            <TextInput
            value={monthlyLimit}
            onChangeText={setMonthlyLimit}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor="#D1D1D1"
            className="bg-dark-200 rounded-xl p-4 text-light-100 text-lg font-medium"
            />
        </View>

        {/* Lifestyle vs Essential Ratio */}
        <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50">
            <View className="flex-row items-center mb-3">
            <Ionicons name="pie-chart" size={22} color="#f5a623" />
            <Text className="ml-3 text-xl font-semibold text-light-100">
                Lifestyle vs Essential Ratio
            </Text>
            </View>
            <Text className="text-light-300 mb-4 text-base font-medium">
            Lifestyle: {lifestyleRatio}% | Essential: {100 - lifestyleRatio}%
            </Text>
            <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            value={lifestyleRatio}
            step={10}                // changed from 1 to 10
            minimumTrackTintColor="#f5a623"
            maximumTrackTintColor="#221f3d"
            thumbTintColor="#AB8BFF"
            onValueChange={setLifestyleRatio}
            />
        </View>

        {/* Manage Categories */}
        <TouchableOpacity className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50 flex-row justify-between items-center"
            onPress={() => {router.push('/category')}}
        >
            <View className="flex-row items-center">
            <Feather name="list" size={22} color="#00bfa5" />
            <Text className="ml-3 text-xl font-semibold text-light-100">Manage Categories</Text>
            </View>
            <Feather name="chevron-right" size={22} color="#D1D1D1" />
        </TouchableOpacity>

        {/* Dark Mode */}
        <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50 flex-row justify-between items-center">
            <View className="flex-row items-center">
            <Ionicons name="moon" size={22} color="#3b82f6" />
            <Text className="ml-3 text-xl font-semibold text-light-100">Dark Mode</Text>
            </View>
            <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#3a3a3a", true: "#AB8BFF" }}
            thumbColor={darkMode ? "#f5a623" : "#d1d5db"}
            />
        </View>

        {/* Reset All Data */}
        <TouchableOpacity className="bg-error rounded-2xl p-5 mb-12 shadow-lg shadow-black/50">
            <Text className="text-light-100 font-bold text-center text-lg">Reset All Data</Text>
        </TouchableOpacity>
        </SafeAreaView>
  );
}
