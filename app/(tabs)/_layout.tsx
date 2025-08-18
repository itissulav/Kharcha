import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Tabs } from "expo-router";
import React, { useRef } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

import * as Haptics from "expo-haptics";
import { useEffect } from "react";

type Props = {
  focused: boolean;
  icon: ImageSourcePropType;
};

const TabBarIcon = ({ focused, icon }: Props) => {
  const prevFocused = useRef(focused);

  useEffect(() => {
    // Only trigger haptics when tab becomes focused
    if (focused && !prevFocused.current) {
      Haptics.selectionAsync(); // subtle "selection" feedback
    }
    prevFocused.current = focused;
  }, [focused]);

  return (
    <View className="items-center justify-center relative">
      {focused ? (
        <View className="bg-[#03A6A1] w-12 h-12 rounded-full items-center justify-center shadow-md">
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
          style={{ tintColor: "#8A8A8E" }}
        />
      )}
    </View>
  );
};

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href={"/login"} />;

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
          marginHorizontal: 30,
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
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.categories} />
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
      <Tabs.Screen
        name="statistics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.statistics} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={icons.budget} />
          ),
        }}
      />
    </Tabs>
  );
}
