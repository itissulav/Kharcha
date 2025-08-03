import { updateAccount } from "@/db/accounts";
import { Account } from "@/db/types";
import { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditAccountModal({
  visible,
  onClose,
  onSuccess,
  account,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: Account | null;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(account.balance.toString());
    }
  }, [account]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert("Please enter a valid Name!");
      return;
    }

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      alert("Please enter a valid numeric Balance!");
      return;
    }

    await updateAccount(account!.id, name.trim(), parsedBalance);
    onSuccess(); // refresh data
    onClose();   // close modal
  };


  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-secondary p-6 rounded-xl w-full max-w-md">
          <Text className="text-light-100 text-lg font-bold mb-4">Edit Account</Text>

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            className="bg-white rounded-md p-3 mb-2"
          />
          <TextInput
            placeholder="Balance"
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
            className="bg-white rounded-md p-3 mb-4"
          />

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdate}
              className="bg-teal-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
