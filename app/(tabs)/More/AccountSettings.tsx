import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import About from "@/components/About";
import Other_setting from '@/components/Modal/Other_setting';
import React, { useState } from 'react';

export default function AccountSettings() {
  const { signOut } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);

  const singoutHandle = async () => {
    await signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <SafeAreaView>
      <View className="h-full gap-8 mt-8">
        <About />
        <View className="gap-4">
          <TouchableOpacity onPress={() => singoutHandle()}>
            <View className="flex flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "#F3F3F3", marginHorizontal: 20 }}>
              <View className="flex-row gap-2 items-center">
                <MaterialIcons name="exit-to-app" size={24} color="black" />
                <Text>Logout</Text>
              </View>
              <Ionicons name="chevron-forward-outline" color={"#A4A4A4"} size={25} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View className="flex flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "#F3F3F3", marginHorizontal: 20 }}>
              <View className="flex-row gap-2 items-center">
                <MaterialIcons name="settings" size={24} color="black" />
                <Text>Other Setting</Text>
              </View>
              <Ionicons name="chevron-forward-outline" color={"#A4A4A4"} size={25} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
       <Other_setting visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}
