import { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmDeleteModal({
  visible,
  onCancel,
  onConfirm,
  messageHeading = "Confirm Deletion",
  messageBody = "Are you sure you want to delete this item?",
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  messageHeading?: string;
  messageBody?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent={true} visible={visible} animationType="none">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        className="flex-1 bg-black/30"
      >
        <View className="flex-1 justify-center items-center px-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
            className="bg-secondary p-4 rounded-2xl w-[70%] max-w-xs"
          >
            <Text className="text-light-100 text-lg font-semibold mb-3 text-center">
              {messageHeading}
            </Text>

            <Text className="text-light-300 mb-4 text-center">
              {messageBody}
            </Text>

            <TouchableOpacity
              onPress={onConfirm}
              className="bg-red-600 py-2 px-4 rounded-lg mb-2"
            >
              <Text className="text-white text-center">Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              className="py-2 px-4 rounded-lg"
            >
              <Text className="text-light-300 text-center">Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
