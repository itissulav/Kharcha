import { registerUser } from "@/utilities/firebase/registerUsers";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import LoadingScreen from "./LoadingScreen";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSignup = async () => {

    const newErrors: any = {};
    if (!name) newErrors.name = true;
    if (!phone) newErrors.phone = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);


    try {
      await registerUser({ name, email, password, phone });
      alert("Account created! Please verify your email before logging in.");
      router.replace("/login");
    } catch (err: any) {
      alert(err.message || "Signup failed");
      console.error(err);
    }
  };

  const inputClass = (key: string) =>
    `bg-secondary text-light-100 border rounded-xl px-4 py-3 mb-4 ${
      errors[key] ? "border-red-500" : "border-muted-200"
    }`;

    if (isLoading) return <LoadingScreen message="Signing in..."></LoadingScreen>
  return (
    <View className="flex-1 bg-primary justify-center px-6">
      <StatusBar style="light" />
      <Text className="text-3xl font-bold text-center text-light-100 mb-10">
        Create Account 📝
      </Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#D1D1D1"
        className={inputClass("name")}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: false }));
        }}
      />

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="#D1D1D1"
        className={inputClass("phone")}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setErrors((prev) => ({ ...prev, phone: false }));
        }}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#D1D1D1"
        className={inputClass("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: false }));
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#D1D1D1"
        className={inputClass("password")}
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: false }));
        }}
      />

      <TouchableOpacity
        onPress={handleSignup}
        className="bg-accent py-3 rounded-xl mb-4"
      >
        <Text className="text-center text-primary text-base font-semibold">
          Sign Up
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-light-300 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-semibold">
          Log in
        </Link>
      </Text>
    </View>
  );
}
