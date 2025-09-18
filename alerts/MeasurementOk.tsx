import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DataUpdate = () => {
  return (
    <View className=" items-center justify-center p-4 w-full">
      {/* Notification Card */}
      <View style={{flexDirection:"row",backgroundColor:"#f2ffe6",borderRadius:100 ,alignItems:"center",justifyContent:"center",padding:10}}>
        {/* Icon */}
        <View className=" rounded-full">
          <Ionicons name="checkmark-done-circle-outline" size={32} color="#22c55e" />
        </View>

        {/* Text */}
        <View className="">
          <Text className="text-xl font-semibold text-gray-900">Data Updated</Text>
        </View>
      </View>
    </View>
  );
};

export default DataUpdate;
