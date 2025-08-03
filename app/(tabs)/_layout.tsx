import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";

type Props = {
  focused: boolean,
  icon: ImageSourcePropType
};

const TabBarIcon = ({ focused, icon }: Props) => (
  <View className="items-center justify-center align-middle relative">
    {focused ? (
      <View className="bg-[#03A6A1] w-12 h-12 rounded-full items-center justify-center align-middle shadow-md">
        <Image
          source={icon}
          className="w-6 h-6"
          style={{ tintColor: "#000000" }}
        />
      </View>
    ) : (
      <Image
        source={icon}
        className="w-6 h-6"
        style={{ tintColor: "#8A8A8E" }} // subtle muted gray for inactive
      />
    )}
  </View>
);

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: 63,
          paddingTop: 10,
          paddingBottom: 10,
          justifyContent: "center",
          marginHorizontal: 100,
          marginBottom: 34,
          borderRadius: 40,
          backgroundColor: "#030014", // pure black base
          position: "absolute",
          shadowColor: "#03A6A1", // golden glow for depth
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 20,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.transaction} />
          ),
        }}
      />
    </Tabs>
  );
}
