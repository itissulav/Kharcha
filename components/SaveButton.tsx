import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  disabled: boolean;
  onSave: () => void;
};

const SaveButton = ({ disabled, onSave }: Props) => {
  return (
    <View>
      <TouchableOpacity
        className="bg-accent rounded-2xl p-5 mb-12 shadow-lg shadow-black/50 disabled:bg-gray-400 disabled:opacity-50"
        disabled={disabled}
        onPress={onSave}
      >
        <Text className="text-light-100 font-bold text-center text-lg">
          Save
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SaveButton;
