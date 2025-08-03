// components/AddAccountModal.tsx
import { insertAccount } from "@/db/accounts";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddAccountModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const handleAdd = async () => {
    if (!name || !balance) alert("Enter a valid name and ammount!");
    await insertAccount(name, parseFloat(balance));
    setName("");
    setBalance("");
    onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="bg-secondary p-6 rounded-xl w-full max-w-md shadow-lg">
          <Text className="text-light-100 text-xl font-bold mb-6">
            Add New Account
          </Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-light-300 text-sm mb-1">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. eSewa"
              className="bg-dark-100 text-white rounded-lg p-3 text-base"
              placeholderTextColor="#9CA4AB"
            />
          </View>

          {/* Balance */}
          <View className="mb-6">
            <Text className="text-light-300 text-sm mb-1">Balance</Text>
            <TextInput
              value={balance}
              onChangeText={setBalance}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              className="bg-dark-100 text-white rounded-lg p-3 text-base"
              placeholderTextColor="#9CA4AB"
            />
          </View>

          {/* Buttons */}
          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-red-500 px-4 py-3 rounded-lg items-center"
            > 
              <Text className="text-white font-semibold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              className="flex-1 bg-teal-500 px-4 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
