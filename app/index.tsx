
import { StyleSheet, Text, View , Image ,TouchableOpacity} from 'react-native'
import React, { useEffect,useState} from 'react';
import "@/global.css";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@clerk/clerk-expo';

export default function index () {
  const {isSignedIn,isLoaded} = useAuth();
    const navigation = useNavigation<NavigationProp<any>>();
  return (
    <SafeAreaView className='bg-white h-full justify-center items-center gap-[5%] '>
        <View className='justify-center items-center gap-[2vh] w-full'>
            <Image style={{height:"50%", width:"80%"}} source={require("@/assets/images/splash-icon.png")} />
            <Text className=' text-center font-semibold text-4xl  '>Track Your Body’s pH Balance Effortlessly</Text>
        </View>
       { !isSignedIn && isLoaded && <View className='w-full gap-5 p-12'>
              <TouchableOpacity onPress={()=> navigation.navigate("GetStarted")}>
                            <LinearGradient
                              style={{
                                alignContent: "center",
                                borderRadius: 10,
                                padding: 15,
                              }}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              colors={["#0983C8", "#023E77","#023E77"]}
                            >
                              <Text className="text-center text-white">New User</Text>
                            </LinearGradient>
                          </TouchableOpacity>
              <TouchableOpacity style={{borderColor:"#0983C8",borderWidth:2,padding:12,borderRadius:10}} onPress={()=> navigation.navigate("GetStarted")}>
                              <Text className="text-center text-[#0983C8]">Existing User</Text>
                          </TouchableOpacity>
           
        </View>}
        {/* <Redirect href={"/GetStarted"}/> */}
    </SafeAreaView> 
)
}; 
