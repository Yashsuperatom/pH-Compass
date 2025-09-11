import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomModal from '../Modal2';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation,NavigationProp } from '@react-navigation/native';

export const Warn = () => {
  const [openModal, setOpenModal] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const data = (
  <View style={{ height: 'auto', width: '80%', backgroundColor: '#FFF3E6', borderRadius: 20, padding: 20 ,borderColor:"#FF9800",borderWidth:1}}>
    {/* Close button */}

    {/* Warning Icon + Heading */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 , justifyContent:"space-between" }}>
     <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
     <Text style={{ fontSize: 22, color: '#FF9800', marginRight: 8 }}>⚠️</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Warning Message</Text>
     </View>
     <TouchableOpacity
      onPress={() => setOpenModal(false)}
      className='text-center'
    >
      <Text style={{ fontSize: 20, color: '#444' }}>✕</Text>
    </TouchableOpacity>
    </View>

    {/* Message Text */}
    <Text style={{ fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 20 }}>
      Your Smart pH device was not connected during recent measurements. As a result, data beyond
      the storage limit has been deleted. Please ensure Bluetooth is connected during use to prevent
      data loss.
    </Text>
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
