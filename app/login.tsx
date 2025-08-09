import { loginUsers } from "@/utilities/firebase/loginUsers";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import LoadingScreen from "./LoadingScreen";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async () => {
    if (!email){
      setEmailError(true);
    }

    if (!password){
      setPasswordError(true);
    }

    if(emailError || passwordError){
      return;
    }
    setIsLoading(true);
    try {
      const user = await loginUsers(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }

  };

  if (isLoading) return <LoadingScreen message="Loggin in..."></LoadingScreen>

  return (
    <View className="flex-1 bg-primary justify-center px-6">
      <StatusBar style="light" />
      <Text className="text-3xl font-bold text-center text-light-100 mb-10">
        Welcome Back 👋
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#D1D1D1"
        className={`bg-secondary text-light-100 border rounded-xl px-4 py-3 mb-4 ${emailError? `border-red-500` : `border-muted-200`}`}
        value={email}
        onChangeText={(email) => {
          setEmail(email);
          setEmailError(false);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#D1D1D1"
        className={`bg-secondary text-light-100 border rounded-xl px-4 py-3 mb-6 ${passwordError? `border-red-500` : `border-muted-200`}`}
        value={password}
        onChangeText={(password) => {
          setPassword(password);
          setEmailError(false);
        }}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-accent py-3 rounded-xl mb-4"
      >
        <Text className="text-center text-primary text-base font-semibold">
          Log In
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-light-300 text-sm">
        Don't have an account?{" "}
        <Link href="/signup" className="text-accent font-semibold">
          Sign Up
        </Link>
      </Text>
    </View>
  );
}
