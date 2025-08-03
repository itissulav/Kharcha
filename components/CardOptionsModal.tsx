// components/CardOptionsModal.tsx
import { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

export default function CardOptionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
        onPress={onClose}
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
            <Text className="text-light-100 text-lg font-semibold mb-3">
              Options
            </Text>

            <TouchableOpacity
              onPress={onEdit}
              className="bg-blue-600 py-2 px-4 rounded-lg mb-2"
            >
              <Text className="text-white text-center">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDelete}
              className="bg-red-600 py-2 px-4 rounded-lg mb-2"
            >
              <Text className="text-white text-center">Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
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
