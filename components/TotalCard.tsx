import React from 'react';
import { Text, View } from 'react-native';

interface Props{
    amount: string|number;
}

const TotalCard = ({amount}: Props) => {
  return (

    <View className='w-full bg-secondary rounded-2xl shadow-md p-4 items-center'>
      <Text className='text-light-300 text-base'>Total Amount</Text>
      <Text className='text-teal-500 text-3xl font-bold mt-1'>Rs. {amount}</Text>
    </View>
  )
}

export default TotalCard