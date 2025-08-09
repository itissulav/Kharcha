import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';


type Props = {
    infoVisible: boolean;
    onClose: () => void;
}

const InfoModal = ({infoVisible, onClose}: Props) => {
  return (

          <Modal
            visible={infoVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-70 px-6">
              <View className="bg-primary rounded-2xl p-6 max-w-md w-full">
                <Text className="text-white text-xl font-bold mb-4">Color Legend</Text>

                {/* Spending Type */}
                <Text className="text-white font-semibold mb-2">Spending Type (Text Colors)</Text>
                <View className="mb-6">
                  <View className="flex-row items-center mb-1">
                    <View className="w-5 h-5 bg-blue-500 rounded-sm mr-3" />
                    <Text className="text-white">Essential: Necessary expenses (groceries, rent, utilities)</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <View className="w-5 h-5 bg-purple-500 rounded-sm mr-3" />
                    <Text className="text-white">Lifestyle: Discretionary spending (luxury, wants)</Text>
                  </View>
                </View>

                {/* Transaction Type */}
                <Text className="text-white font-semibold mb-2">Transaction Type (Amount Colors)</Text>
                <View className="mb-6">
                  <View className="flex-row items-center mb-1">
                    <View className="w-5 h-5 bg-green-500 rounded-sm mr-3" />
                    <Text className="text-white">Credit: Money coming in</Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <View className="w-5 h-5 bg-red-500 rounded-sm mr-3" />
                    <Text className="text-white">Debit: Money going out</Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={onClose}
                  className="self-end bg-accent rounded-2xl px-4 py-2 shadow-md"
                >
                  <Text className="text-black font-semibold text-base">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
  )
}

export default InfoModal