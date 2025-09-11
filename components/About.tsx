import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from '@clerk/clerk-expo'
import { LinearGradient } from "expo-linear-gradient";
import { getUser, updateUser } from "@/Database/supabaseData";


export default function About() {
  const { user } = useUser()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState({
    name: "",
    dob: "",
    contact: "",
    email: ""
  });
  
  const handleSave = async () => {
   const userEmail = user?.emailAddresses[0].emailAddress;
  if (!userEmail) {
    console.log("⚠️ User email missing");
    return;
  }

  await updateUser(userEmail, {
    name: data.name,
    dob: data.dob,
    contact: data.contact,
    email: data.email
  });
  setIsModalVisible(false)
};


useEffect(() => {
  const fetchUserDetails = async () => {
    if (user?.emailAddresses[0]?.emailAddress) {
      const result = await getUser(user.emailAddresses[0].emailAddress);
      console.log(result);
      if (result && result.length > 0) {
        setData(result[0]);
      } else {
        setData({
          name: "",
          dob: "",
          contact: "",
          email: ""
        });
      }

    }
  };

  fetchUserDetails();
}, [user]);




  return (
    <>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <View className='flex flex-row items-center justify-between border-y p-4 ' style={{ borderColor: "#E7E6E6" }} >
          <View className='flex flex-row items-center gap-4'>
            <Image style={{ width: 60, height: 60, borderRadius: 100 }} source={require("@/assets/images/icon.png")} />
            <View>
              <Text>
                {data.name}
              </Text>
              <Text>
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
          </View>
          <Ionicons name='chevron-forward-outline' color={"#A4A4A4"} size={25} />
        </View>
      </TouchableOpacity>
      <>

      </>
      {/* Modal */}
      <Modal
        animationType="slide"
        visible={isModalVisible}
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >

        <View style={{ backgroundColor: "#EBEBEB", flex: 1, borderRadius: 20, top: 10 }} >
          <View className='flex-row justify-between border-b p-4' style={{ borderColor: '#D7D7D7' }}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className='font-semibold text-[#304FFE]'>
                back
              </Text>
            </TouchableOpacity>
            <Text className='font-semibold '>
              About me
            </Text>
            <View className="px-4"></View>
          </View>


          <View className='p-4 gap-4'>
            <View className='mb-6 items-center relative'>
              <Image style={{ width: 100, height: 100, borderRadius: 100 }} source={require("@/assets/images/icon.png")} />
              <Ionicons style={{ backgroundColor: "black", borderRadius: 100, padding: 4, position: "absolute", bottom: 0, right: 130 }} name='camera' color={"white"} size={20} />
            </View>

            <View className='gap-2'>
              <Text>
                Name
              </Text>
            <TextInput value={data.name} onChangeText={(text) => setData(prev => ({ ...prev, name: text }))} style={{ backgroundColor: 'white', padding: 10, borderRadius: 5 }} placeholder="name" />
            </View>
            <View className='gap-2'>
              <Text>
                Date of Birth
              </Text>
              <TextInput value={data.dob} onChangeText={(text) => setData(prev => ({ ...prev, dob: text }))} style={{ backgroundColor: 'white', padding: 10, borderRadius: 5 }} placeholder='16/2/2009' />
            </View>
            <View className='gap-2'>
              <Text>
                Contact Number
              </Text>
              <TextInput value={data.contact} onChangeText={(text) => setData(prev => ({ ...prev, contact: text }))} inputMode="numeric" style={{ backgroundColor: 'white', padding: 10, borderRadius: 5 }} placeholder='9635466772' />
            </View>
            <View className='gap-2'>
              <Text>
                Email
              </Text>
              <TextInput
                value={user?.emailAddresses[0].emailAddress}
                editable={false}
                style={{ backgroundColor: 'lightgrey', padding: 10, borderRadius: 5 }}
              />

            </View>
          </View>
          <TouchableOpacity onPress={() => handleSave()} style={{ margin: 20, borderRadius: 10, overflow: 'hidden' }}>
            <LinearGradient
              colors={['#0983C8', '#023E77']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ padding: 15, alignItems: 'center', borderRadius: 10 }}
            >
              <Text className="text-white font-semibold text-xl">
                Save
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}