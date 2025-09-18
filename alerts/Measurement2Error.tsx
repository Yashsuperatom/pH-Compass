import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Measurement2Error({ navigation }: any) {
  return (
  <View className=" items-center justify-center p-4 w-full">
             {/* Notification Card */}
             <View style={{flexDirection:"row",backgroundColor:"#ffebe6",borderRadius:100 ,alignItems:"center",justifyContent:"center",padding:12,gap:10}}>
               {/* Icon */}
               <View className=" rounded-full">
                 <Ionicons name="alert-circle-outline" size={32} color="red" />
               </View>
       
               {/* Text */}
               <View className="">
                 <Text className="text-xl font-semibold text-gray-900">Measurement Error</Text>
               </View>
             </View>
           </View>
  );
}
