import ConfirmLogoutModal from "@/components/ConfirmLogoutModal";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/utilities/firebase/logOutUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "./LoadingScreen";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { user, loading: isLoading } = useAuth();
  const [bio, setBio] = useState("Tech enthusiast. Builder. Cat person.");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleLogOut = async() => {
    setConfirmModalVisible(false);
    try {
      logOut();
      router.replace("/login")
    } catch (error) {
      
    }
  }

  if (isLoading) return (<LoadingScreen message='Logging Out...'></LoadingScreen>)

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>

        <ConfirmLogoutModal
          visible = {confirmModalVisible}
          onCancel={() => {setConfirmModalVisible(false)}}
          onConfirm={() => {handleLogOut();}}
          message='Are you sure you want to Log Out?'
        />
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl text-white font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => {router.push('/settings')}}
          >
            <Ionicons name="settings-outline" size={24} color="#AB8BFF" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="items-center mb-6">
          <Text className="text-white text-lg font-semibold mt-4">{user?.displayName || "User"}</Text>
          <Text className="text-light-300">{user?.email || "email@gmail.com"}</Text>
        </View>

        {/* Editable Info Section */}
        <View className="bg-secondary p-5 rounded-2xl shadow-md mb-6">
          <Text className="text-light-100 font-medium mb-2">Name</Text>
          <TextInput
            value={user?.displayName || "User"}
            onChangeText={setName}
            className="bg-dark-100 text-white rounded-lg p-3 mb-4"
            placeholderTextColor="#9CA4AB"
          />

          <Text className="text-light-100 font-medium mb-2">Email</Text>
          <TextInput
            value={user?.email || "email@gmail.com"}
            onChangeText={setEmail}
            keyboardType="email-address"
            className="bg-dark-100 text-white rounded-lg p-3 mb-4"
            placeholderTextColor="#9CA4AB"
          />

          <Text className="text-light-100 font-medium mb-2">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            className="bg-dark-100 text-white rounded-lg p-3 h-24"
            placeholderTextColor="#9CA4AB"
          />
        </View>

        {/* Actions */}
        <TouchableOpacity className="bg-red-500 p-4 rounded-xl items-center"
          onPress={() => {setConfirmModalVisible(true)}}
        >
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
        <Pressable
          onPress={() => {router.back()}}
        >
          <View className='bg-accent px-4 py-4 rounded-lg w-[25%] flex-row justify-around items-center'>
            <Ionicons name='arrow-back-sharp' size={18} color="#000000"/>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
