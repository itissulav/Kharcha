import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import SaveButton from "@/components/SaveButton";
import { initDatabase, resetDatabase } from "@/db";
import { UserData } from "@/db/types";
import { getUserPreference, saveUserData } from "@/db/user";
import { Feather, Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PreferencesPage() {
  const [spendRatio, setSpendRatio] = useState(70);
  const [lifestyleRatio, setLifestyleRatio] = useState(70);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSpendAlert, setShowSpendAlert] = useState(1);
  const [showLifestyleAlert, setShowLifestyleAlert] = useState(1);

  // Fetch user data and initialize DB
  const fetchUserData = async () => {
    try {
      await initDatabase();
      const userPreference: UserData | undefined = await getUserPreference();
      console.log("Fetched preference from DB:", userPreference);

      setSpendRatio(userPreference?.spending_percentage ?? 70);
      console.log("set the spending ratio to: ", spendRatio);
      setLifestyleRatio(userPreference?.lifeStyleLimit ?? 70);
      console.log("Set the Lifestyle ratio to: ", lifestyleRatio);
      setShowSpendAlert(userPreference?.showMonthlyLimitAlert ?? 1);
      console.log("Set the showSpendAlert to:  ", showSpendAlert);
      setShowLifestyleAlert(userPreference?.showCategoryLimitAlert ?? 1);
      console.log("Set the showLifestyleAlert to: ", showLifestyleAlert);
      setSaveDisabled(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Refresh handler (called on pull-to-refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Delete DB data
  const handleDelete = async () => {
    try {
      await initDatabase();
      await resetDatabase();
      // Optionally reset local state to defaults here too
      setSpendRatio(70);
      setLifestyleRatio(70);
      setShowSpendAlert(1);
      setShowLifestyleAlert(1);
      setSaveDisabled(true);
    } catch (error) {
      alert("There was an error deleting the data");
      console.error(error);
    }
  };

  // Save user preferences
  const handleSave = async () => {
    try {
      const success = await saveUserData(
        spendRatio,
        lifestyleRatio,
        showSpendAlert
      );

      if (!success) {
        alert("There was an error during the save!");
      } else {
        alert("Success!");
        setSaveDisabled(true);
      }
    } catch (error) {
      alert("There was an error during the save!");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary p-5 gap-4">
      <ScrollView
        className="gap-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#AB8BFF"]}
            tintColor="#AB8BFF"
          />
        }
      >
        <ConfirmDeleteModal
          visible={confirmDeleteModalVisible}
          onCancel={() => {
            setConfirmDeleteModalVisible(false);
          }}
          onConfirm={() => {
            handleDelete();
            setConfirmDeleteModalVisible(false);
          }}
          messageBody="Are you sure you want to Delete your data?"
        />

        {/* Title */}
        <Text className="text-3xl font-bold text-light-100 mb-6">
          Preferences
        </Text>

        {/* Save vs Spend Ratio */}
        <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50">
          <View className="flex-row items-center mb-3">
            <Ionicons name="pie-chart" size={22} color="#f5a623" />
            <Text className="ml-3 text-xl font-semibold text-light-100">
              Save vs Spend Ratio
            </Text>
          </View>
          <Text className="text-light-300 mb-4 text-base font-medium">
            Spend: {spendRatio}% | Save: {100 - spendRatio}%
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            value={spendRatio}
            step={5}
            maximumTrackTintColor="#00bfa5"
            minimumTrackTintColor="#ca3232"
            thumbTintColor="#AB8BFF"
            onValueChange={(per) => {
              setSpendRatio(per);
              setSaveDisabled(false);
            }}
          />

          {/* Switch for Spend Alerts */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-light-300 text-base font-medium">
              Show Spend Alert
            </Text>
            <Switch
              value={showSpendAlert == 1 ? true : false}
              onValueChange={(val) => {
                setShowSpendAlert(val ? 1 : 0);
                setSaveDisabled(false);
              }}
              trackColor={{ false: "#767577", true: "#AB8BFF" }}
              thumbColor={showSpendAlert ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
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
            step={5}
            minimumTrackTintColor="#f5a623"
            maximumTrackTintColor="#221f3d"
            thumbTintColor="#AB8BFF"
            onValueChange={(per) => {
              setLifestyleRatio(per);
              setSaveDisabled(false);
            }}
          />

          {/* Switch for Lifestyle Alerts */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-light-300 text-base font-medium">
              Show Lifestyle Alerts
            </Text>
            <Switch
              value={showLifestyleAlert == 1 ? true : false}
              onValueChange={(val) => {
                setShowLifestyleAlert(val ? 1 : 0);
                setSaveDisabled(false);
              }}
              trackColor={{ false: "#767577", true: "#AB8BFF" }}
              thumbColor={showLifestyleAlert ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Manage Categories */}
        <TouchableOpacity
          className="bg-secondary rounded-2xl p-5 mb-6 shadow-lg shadow-black/50 flex-row justify-between items-center"
          onPress={() => {
            router.push("/category");
          }}
        >
          <View className="flex-row items-center">
            <Feather name="list" size={22} color="#00bfa5" />
            <Text className="ml-3 text-xl font-semibold text-light-100">
              Manage Categories
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color="#D1D1D1" />
        </TouchableOpacity>

        {/* Reset All Data */}
        <TouchableOpacity
          className="bg-error rounded-2xl p-5 shadow-lg shadow-black/50 mb-4"
          onPress={() => {
            setConfirmDeleteModalVisible(true);
            console.log("Delete button pressed");
          }}
        >
          <Text className="text-light-100 font-bold text-center text-lg">
            Reset All Data
          </Text>
        </TouchableOpacity>

        <SaveButton
          disabled={saveDisabled}
          onSave={() => {
            handleSave();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
