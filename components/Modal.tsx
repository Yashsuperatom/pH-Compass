import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Tags from "./Tags";

// Define the type for a list item
export type ListItem = {
  dateTime: Date;
  ph: number;
};

// Define the props for AddModal
interface AddModalProps {
  list: ListItem[];
  setList: React.Dispatch<React.SetStateAction<ListItem[]>>;
  onAdd: (ph: number, dateTime: Date) => Promise<void>; 
}

export default function AddModal({ list, setList, onAdd }: AddModalProps) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [ph, setPh] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState('Screen1'); // Default screen

  //  data array for medicine units 
  const dataUnits=[
    "UNITS","MG","PILLS","PUFFS","SUPPOSITIRIES"
  ]

  const onChange = (event: any, selected?: Date) => {
    if (selected) {
      setDateTime(selected);
    }
    setShowDate(false);
    setShowTime(false);
  };

  const handleSave = async () => {
    if (ph !== null) {
      await onAdd(ph, dateTime);  
      setList((prevList) => [...prevList, { dateTime, ph }]);
      setPh(null);
      setIsModalVisible(false);
    } else {
      alert("Please enter a valid pH value!");
    }
  };

  return (
    <>
      {/* Button to open the modal */}
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={34} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        visible={isModalVisible}
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        {currentScreen === "Screen1" && (
          <View style={{backgroundColor:"#EBEBEB" , flex:1, borderRadius:20,top:10}}>
          <View style={{flexDirection: "row",padding: 16,justifyContent: "space-between",borderBottomWidth:1,borderColor: "#D7D7D7", borderStyle: "solid"}}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-[#304FFE]" >
                Cancel
              </Text>
            </TouchableOpacity>
             <Text className="font-bold">
              New Entry
             </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-[#304FFE]" >Save</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding:20 }}>
        
            <View className="gap-5">
              <View className="gap-2">
                <Text>Date & Time</Text>
                <View className="flex-row items-center bg-white justify-between p-4 rounded-lg">
                  <View className="flex flex-row gap-2">
                    <Ionicons name="calendar" size={20} />
                    <TouchableOpacity onPress={() => setShowDate(true)}>
                      <Text>{dateTime.toDateString()}</Text>
                    </TouchableOpacity>
                    <Text>
                      at
                    </Text>
                    <TouchableOpacity onPress={() => setShowTime(true)}>
                      <Text>{dateTime.toLocaleTimeString()}</Text>
                    </TouchableOpacity>
                    {showDate && (
                      <DateTimePicker value={dateTime} mode="date" onChange={onChange} />
                    )}
                    {showTime && (
                      <DateTimePicker value={dateTime} mode="time" onChange={onChange} />
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={24}/>
                </View>
              </View>

              <View className="gap-2">
                <Text>pH Value</Text>
                <View className="bg-white p-4 rounded-lg flex-row gap-4">
                  <View
                    style={{
                      backgroundColor: 
                        ph === null ? "#B1C644" : 
                        ph <= 4.5 
                        ? "#FF9359"
                        : ph > 4.5 && ph < 7.5
                        ? "#B1C644"
                        : "#007FAA",
                      width: 20,
                      borderRadius: 100,
                    }}
                  />

                  <TextInput
                  style={{width:'100%'}}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      const numericValue = parseFloat(text);
                      setPh(isNaN(numericValue) ? null : numericValue);
                    }} 
                    value={ph !== null ? ph.toString() : ""}
                    placeholder="5.5"
                  />
                </View>
              </View>

              <View className="gap-2 ">
                <Text>Pills</Text>
                <View className=" ">
                  <View style={{flexDirection:"row", alignContent:"center" , justifyContent:"space-between", padding:20 , backgroundColor:"white" ,marginVertical:1,borderTopLeftRadius:10,borderTopRightRadius:10}} >
                    <View className="flex flex-row gap-2 items-center ">
                      <FontAwesome5 name="capsules" size={24} color="black" />
                      <Text>{dateTime.toDateString()}</Text>
                      <Text>
                        at
                      </Text>
                      <Text>{dateTime.toLocaleTimeString()}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24}/>
                  </View>
                  <TouchableOpacity style={{borderBottomLeftRadius:10,backgroundColor:"white",borderBottomRightRadius:10}} onPress={()=> setCurrentScreen("Screen2")}>
                  <Text className="text-center text-[#304FFE] font-semibold p-3 ">
                    Add Pills
                  </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={{margin:30}}>
            <TouchableOpacity className="bg-[#304FFE] p-[10px] rounded-[10px] " onPress={handleSave}>
              <Text className=" text-white text-center text-[22px]" >Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
        {
          currentScreen === "Screen2" && (
            <View style={{backgroundColor:"#EBEBEB" , flex:1, borderRadius:20,top:10}}>
            <View style={{flexDirection: "row",padding: 16,justifyContent: "space-between",borderBottomWidth:1,borderColor: "#D7D7D7", borderStyle: "solid"}}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-[#304FFE]" >a
                  Cancel
                </Text>
              </TouchableOpacity>
               <Text className="font-bold">
                New Medicine
               </Text>
              <TouchableOpacity onPress={()=>setCurrentScreen("Screen1")}>
                <Text className="text-[#304FFE]" >Save</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4 gap-8">
              <View className="gap-2">
                <Text>
                Medicine Name
                </Text>
                <TextInput
                placeholder="New Medicine"
                style={{backgroundColor:"white",padding:10,height:40,borderRadius:5}}
                />
              </View>
              <View >
                <Text>
                Medicine Units
                </Text>
                <FlatList  horizontal
                className="py-4"
                data={dataUnits}
                keyExtractor={(item,index) => index.toString()}
                renderItem={({item})=> (
                 <TouchableOpacity>
                   <Text style={{marginHorizontal: 9,paddingHorizontal: 16,backgroundColor: "white",borderRadius: 9999,borderWidth: 1,borderColor: "black"}}>{item}</Text>
                 </TouchableOpacity>
                )}
                />
              </View>
              <View className="gap-2">
                <Text>Pills</Text>
                <View className="bg-white rounded-lg  ">
                  <View style={{flexDirection:"row", alignContent:"center" , justifyContent:"space-between",borderColor:"black" , borderBottomWidth:1, padding:20}} >
                    <View></View>
                    <Ionicons name="chevron-forward" size={24}/>
                  </View>
                  <TouchableOpacity onPress={()=> setCurrentScreen("Screen2")}>
                  <Tags/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
           </View>
          )
        }
      </Modal>
    </>
  );
}
