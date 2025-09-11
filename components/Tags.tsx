import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Tags() {
  const data = [
    { name: 'bed-outline', text: 'Out of Bed' },
    { name: 'cafe-outline', text: 'Before Breakfast' },
    { name: 'fast-food-outline', text: 'After Breakfast' },
    { name: 'restaurant-outline', text: 'Before Lunch' },
    { name: 'nutrition-outline', text: 'After Lunch' },
    { name: 'wine-outline', text: 'Before Dinner' },
    { name: 'pizza-outline', text: 'After Dinner' },
    { name: 'moon-outline', text: 'Before Bed' },
    { name: 'ice-cream-outline', text: 'After Snack' },
    { name: 'ice-cream-outline', text: 'After Snack' },
    { name: 'barbell-outline', text: 'Before Activity' },
    { name: 'walk-outline', text: 'After Activity' },
    { name: 'apps-outline', text: 'Other' },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View className="items-center justify-start p-4 ">
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Text className="text-center text-[#304FFE] font-semibold p-3">Add Tags</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View style={{margin:28,justifyContent:"center",backgroundColor:"white" , borderRadius:10 }}>
          <View className="  justify-start p-4 gap-[10px] ">
            <View className='gap-[8px]' >
            <Text className="text-lg font-semibold ">Add Tags</Text>
            <Text>Add tags to your measurements</Text>
            </View>
            <View>
            <FlatList
           
           numColumns={3}
           data={data}
           style={{borderWidth:1 , borderColor:"#ccc"}}
           keyExtractor={(item, index) => index.toString()}
           renderItem={({ item }) => (
             <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", padding: 10, width: 100 , borderColor:"#ccc",borderRightWidth:0.9 }}>
               <Ionicons 
                 style={{ height: 50, justifyContent: "center", textAlignVertical: "center" }} 
                 name={item.name as keyof typeof Ionicons.getRawGlyphMap} 
                 size={24} 
                 color="black" 
               />
               <Text style={{ alignContent: "center", height: 40, textAlign: "center" }}>
                 {item.text}
               </Text>
             </TouchableOpacity>
           )}
           ItemSeparatorComponent={() => (
             <View style={{  backgroundColor: "#ccc" , height:1 }} />
           )}
         />
            </View>
            
          </View >
        
          <TouchableOpacity onPress={() => setIsModalVisible(false)}style={{borderTopWidth:1 ,borderColor:"#ccc" , padding:20 , marginTop:40 }} >
                        <Text style={{textAlign:"right", fontWeight:600 ,fontSize:20 , color:"#304FFE"}}>Done</Text>
                      </TouchableOpacity>
                  </View>
                </Modal>
              </View>
  );
}
