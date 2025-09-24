import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import About from "@/components/About";
import Other_setting from '@/components/Modal/Other_setting';
import React, { useState } from 'react';

export default function AccountSettings() {
  // Hook to access Clerk authentication functions (signOut, user info, etc.)
  const { signOut } = useAuth();
  
  // Navigation hook to programmatically navigate between screens
  const navigation = useNavigation<NavigationProp<any>>();
  
  // State to control the visibility of the "Other Setting" modal
  const [modalVisible, setModalVisible] = useState(false);

  // Function to handle user logout
  const singoutHandle = async () => {
    // Sign out the user using Clerk authentication
    await signOut();
    
    // Reset the navigation stack and redirect to Login screen
    // This prevents users from navigating back to authenticated screens
    navigation.dispatch(
      CommonActions.reset({
        index: 0, // Set the active route index to 0 (first route)
        routes: [{ name: 'Login' }], // Replace entire stack with just Login screen
      })
    );
  };

  return (
    <SafeAreaView>
      <View className="h-full gap-8 mt-8">
        {/* About component - likely displays user profile information */}
        <About />
        
        {/* Settings options container */}
        <View className="gap-4">
          
          {/* Logout Button */}
          <TouchableOpacity onPress={() => singoutHandle()}>
            <View className="flex flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "#F3F3F3", marginHorizontal: 20 }}>
              {/* Left side: Icon and text */}
              <View className="flex-row gap-2 items-center">
                <MaterialIcons name="exit-to-app" size={24} color="black" />
                <Text>Logout</Text>
              </View>
              {/* Right side: Forward chevron arrow */}
              <Ionicons name="chevron-forward-outline" color={"#A4A4A4"} size={25} />
            </View>
          </TouchableOpacity>

          {/* Other Settings Button */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View className="flex flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "#F3F3F3", marginHorizontal: 20 }}>
              {/* Left side: Icon and text */}
              <View className="flex-row gap-2 items-center">
                <MaterialIcons name="settings" size={24} color="black" />
                <Text>Other Setting</Text>
              </View>
              {/* Right side: Forward chevron arrow */}
              <Ionicons name="chevron-forward-outline" color={"#A4A4A4"} size={25} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Other Settings Modal */}
      {/* This modal is rendered but only visible when modalVisible is true */}
      <Other_setting 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} // Close modal handler
      />
    </SafeAreaView>
  );
}