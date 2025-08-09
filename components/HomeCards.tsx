import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import MonthlySpendingCard from "./MonthlyBudgetCards";
import TotalBalanceCard from "./TotalCard";


const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 32; // Full width minus padding (16px on each side)

type Props = {
    totalSpent: number;
    totalEarned: number;
    totalBalance: number;
}

const HomeCards = ({totalSpent, totalEarned, totalBalance}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);


  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View className="mt-4">
      {/* Horizontal ScrollView with Cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={cardWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces = {false}
      >
        {/* Card 1 - Total Balance */}
        <View style={{ width: cardWidth }} className="px-4">
          <TotalBalanceCard
            totalBalance = {totalBalance}
          />
        </View>

        {/* Card 2 - Monthly Spending */}
        <View style={{ width: cardWidth }} className="px-4">
          <MonthlySpendingCard
            totalEarned={totalEarned}
            totalSpent={totalSpent}
          />
        </View>
      </ScrollView>

      {/* Dot Indicator */}
      <View className="flex-row justify-center items-center gap-1.5">
        {[0, 1].map((index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full ${
              activeIndex === index ? "bg-accent" : "bg-white"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeCards;