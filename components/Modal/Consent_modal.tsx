import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CustomModal from '../Modal2';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation,NavigationProp } from '@react-navigation/native';

export const Consent_modal = () => {
  // State to control modal visibility - initialized to true so modal shows immediately
  const [openModal, setOpenModal] = useState(true);
  
  // Navigation hook for screen transitions
  const navigation = useNavigation<NavigationProp<any>>();

  // Modal content JSX - contains the privacy consent form
  const data = (
    <View style={{height:"50%",width:"75%",backgroundColor:"white",borderRadius:20,padding:20,justifyContent:'space-around'}}>
      {/* Modal title */}
      <Text className="text-[20px] font-bold mb-4 w-full text-start ">Privacy & Data Protection</Text>
      
      {/* Scrollable content area for privacy policy text */}
      <ScrollView showsVerticalScrollIndicator={false} >
        <Text className="text-[24px] text-[#546E7A] mb-6 ">
          {/* Privacy policy and consent text explaining:
              - Data collection and storage practices
              - Purpose of data usage (health analysis)
              - User rights and protections
              - Legal compliance statement
              - Data sharing limitations */}
          We value your privacy and are committed to protecting your personal health information. By providing your details, you consent to their collection, storage, and use in accordance with applicable privacy laws and regulations. This information will be used solely for in-context analysis of the acid-base balance of your body for providing you and your authorized person with general health indication reports, and will not be shared without your explicit permission.
        </Text>
      </ScrollView>

      {/* Action buttons container */}
      <View className="flex-row justify-between ">
        {/* Accept button with gradient background */}
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']} // Blue gradient colors
          start={{ x: 0, y: 0 }} // Gradient start point (left)
          end={{ x: 1, y: 0 }}   // Gradient end point (right)
          style={{borderRadius:10, height:50, justifyContent:'center', alignItems:'center', width: '43%'}}
        >
          <TouchableOpacity
            onPress={() => {
              // Close the modal when user accepts the privacy policy
              setOpenModal(false);
            }}
            className="px-6 w-full py-2 rounded-lg items-center justify-center flex"
            activeOpacity={0.8} // Visual feedback on press
          >
            <Text className="text-white font-[600] text-[18px] flex justify-center text-center">Accept</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Deny button with border styling */}
        <TouchableOpacity
          onPress={() => navigation.navigate('index')} // Navigate back to index/home screen
          style={{borderRadius:10,borderWidth:2,borderColor:"#0983C8",padding:2,justifyContent:'center' , width: '50%'}}
        >
          <Text className="text-[#0983C8] font-[600] text-[18px] text-center ">Close & Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    // Render the modal using CustomModal component
    <CustomModal
      onClose={() => setOpenModal(false)} // Function to close modal
      content={data} // Modal content defined above
      isVisible={openModal} // Controls modal visibility
    />
  );
};