import ConfirmLogoutModal from '@/components/ConfirmLogoutModal';
import { logOut } from '@/utilities/firebase/logOutUser';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from './LoadingScreen';


export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState([
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'NPR - Nepalese Rupee', value: 'NPR' },
    { label: 'INR - Indian Rupee', value: 'INR' },
  ]);

  // Avoid re-creating callbacks on every render (optional)
  const onDarkModeToggle = useCallback(() => setIsDarkMode((v) => !v), []);
  const onNotificationsToggle = useCallback(() => setNotificationsEnabled((v) => !v), []);

  const handleLogOut = async() => {
    setConfirmModalVisible(false);
    setIsLoading(true);

    try {
      logOut();
      router.replace("/login")
    } catch (error) {
      
    }
  }

  if (isLoading) return (<LoadingScreen message='Logging Out...'></LoadingScreen>)

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView className='bg-[#030014] flex-1'>
          <ScrollView
            contentContainerStyle={{
              padding: 24,
              backgroundColor: '#030014', // primary
              flexGrow: 1,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            <ConfirmLogoutModal
              visible = {confirmModalVisible}
              onCancel={() => {setConfirmModalVisible(false)}}
              onConfirm={() => {handleLogOut();}}
              message='Are you sure you want to Log Out?'
            />
            <Text className="text-light-100 text-3xl font-semibold mb-8" style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '600' }}>
              Settings
            </Text>

            {/* Dark Mode Toggle */}
            <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text className="text-light-200 text-lg font-medium" style={{ color: '#F3F3F3', fontSize: 18, fontWeight: '500' }}>
                Dark Mode
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#AB8BFF' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onDarkModeToggle}
                value={isDarkMode}
              />
            </View>

            {/* Notifications Toggle */}
            <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text className="text-light-200 text-lg font-medium" style={{ color: '#F3F3F3', fontSize: 18, fontWeight: '500' }}>
                Notifications
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#AB8BFF' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onNotificationsToggle}
                value={notificationsEnabled}
              />
            </View>

            {/* Currency Dropdown */}
            <View style={{ marginBottom: 48 }}>
              <Text
                className="text-light-200 text-lg font-medium mb-2"
                style={{ color: '#F3F3F3', fontSize: 18, fontWeight: '500', marginBottom: 8 }}
              >
                Currency
              </Text>
              <DropDownPicker
                open={open}
                value={currency}
                items={items}
                setOpen={setOpen}
                setValue={setCurrency}
                setItems={setItems}
                style={{
                  backgroundColor: '#151312', // secondary
                  borderColor: '#3a3a3a', // muted-100
                }}
                textStyle={{ color: '#D1D1D1' }} // muted light text
                dropDownContainerStyle={{
                  backgroundColor: '#151312',
                  borderColor: '#3a3a3a',
                  zIndex: 1000, // ensure dropdown is on top
                }}
                listMode="SCROLLVIEW"
                dropDownDirection="BOTTOM"
              />
            </View>

            {/* Clear Data Button */}
            <Pressable
              style={{
                backgroundColor: '#ca3232', // error
                borderRadius: 8,
                paddingVertical: 14,
                marginBottom: 24,
              }}
              onPress={() => alert('Clear all data action')}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Clear All Data
              </Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable
              style={{
                backgroundColor: '#3a3a3a', // muted-100
                borderRadius: 8,
                paddingVertical: 14,
                marginBottom: 24,
              }}
              onPress={() => {setConfirmModalVisible(true)}}
            >
              <Text
                style={{
                  color: '#F3F3F3',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Logout
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {router.back()}}
            >
              <View className='bg-accent px-4 py-4 rounded-lg w-[25%] flex-row justify-around items-center'>
                <Ionicons name='arrow-back-sharp' size={18} color="#000000"/>
              </View>
            </Pressable>

            {/* Version Info */}
            <View style={{ alignItems: 'center', marginTop: 'auto' }}>
              <Text style={{ color: '#3a3a3a', fontSize: 14 }}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </SafeAreaView>

      </GestureHandlerRootView>
  );
}

export const options = {
  headerShown: false,
};