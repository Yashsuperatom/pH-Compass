import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CustomModal from '../Modal2';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation,NavigationProp } from '@react-navigation/native';

export const Consent_modal = () => {
  const [openModal, setOpenModal] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const data = (
    <View style={{height:"50%",width:"75%",backgroundColor:"white",borderRadius:20,padding:20,justifyContent:'space-around'}}>
      <Text className="text-[20px] font-bold mb-4 w-full text-start ">Privacy & Data Protection</Text>
      <ScrollView showsVerticalScrollIndicator={false} >
      <Text className="text-[24px] text-[#546E7A] mb-6 ">
       We value your privacy and are committed to protecting your personal health information. By providing your details, you consent to their collection, storage, and use in accordance with applicable privacy laws and regulations. This information will be used solely for in-context analysis of the acid-base balance of your body for providing you and your authorized person with general health indication reports, and will not be shared without your explicit permission.
      </Text>
      </ScrollView>

      <View className="flex-row justify-between ">
       <LinearGradient
  colors={['#4c669f', '#3b5998', '#192f6a']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{borderRadius:10, height:50, justifyContent:'center', alignItems:'center', width: '43%'}}
>
  <TouchableOpacity
    onPress={() => {
      setOpenModal(false);
    }}
    className="px-6 w-full py-2 rounded-lg items-center justify-center flex"
    activeOpacity={0.8}
  >
    <Text className="text-white font-[600] text-[18px] flex justify-center text-center">Accept</Text>
  </TouchableOpacity>
</LinearGradient>

        <TouchableOpacity
          onPress={() => navigation.navigate('index')}
          style={{borderRadius:10,borderWidth:2,borderColor:"#0983C8",padding:2,justifyContent:'center' , width: '50%'}}
        >
          <Text className="text-[#0983C8] font-[600] text-[18px] text-center ">Close & Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <CustomModal
      onClose={() => setOpenModal(false)}
      content={data}
      isVisible={openModal}
    />
  );
};
