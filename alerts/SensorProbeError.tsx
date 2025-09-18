// screens/errors/SensorProbeError.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SensorProbeError() {
  return (
    <View className=" items-center justify-center p-4 w-full">
         {/* Notification Card */}
         <View style={{flexDirection:"row",backgroundColor:"#ffffcc",borderRadius:100,alignItems:"center",justifyContent:"center",padding:12,gap:10}}>
           {/* Icon */}
           <View className=" rounded-full">
             <Ionicons name="bug-outline" size={32} color="#e6e600" />
           </View>
   
           {/* Text */}
           <View className="">
             <Text className="text-xl font-semibold text-gray-900">Sensor error</Text>
           </View>
         </View>
       </View>
  );
}
