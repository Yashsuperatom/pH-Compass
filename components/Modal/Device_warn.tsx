import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomModal from '../Modal2';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation,NavigationProp } from '@react-navigation/native';

export const Warn = () => {
  // State to control modal visibility - initialized to true so warning shows immediately
  const [openModal, setOpenModal] = useState(true);
  
  // Navigation hook for potential screen transitions (not currently used)
  const navigation = useNavigation<NavigationProp<any>>();

  // Modal content JSX - contains the warning message and close button
  const data = (
    <View style={{ 
      height: 'auto', 
      width: '80%', 
      backgroundColor: '#FFF3E6', // Light orange background for warning theme
      borderRadius: 20, 
      padding: 20,
      borderColor:"#FF9800", // Orange border to emphasize warning
      borderWidth:1
    }}>
      
      {/* Header section with warning icon, title, and close button */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12, 
        justifyContent:"space-between" 
      }}>
        {/* Left side: Warning icon and title */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {/* Warning emoji icon */}
          <Text style={{ fontSize: 22, color: '#FF9800', marginRight: 8 }}>⚠️</Text>
          {/* Warning title */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Warning Message</Text>
        </View>
        
        {/* Right side: Close button */}
        <TouchableOpacity
          onPress={() => setOpenModal(false)} // Close modal when X is pressed
          className='text-center'
        >
          {/* X symbol for closing */}
          <Text style={{ fontSize: 20, color: '#444' }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Warning message content */}
      <Text style={{ 
        fontSize: 14, 
        color: '#444', 
        lineHeight: 20, 
        marginBottom: 20 
      }}>
        {/* Message explaining the device connection issue and its consequences:
            - Device was disconnected during measurements
            - Data loss occurred due to storage limits
            - Instructions to prevent future data loss */}
        Your Smart pH device was not connected during recent measurements. As a result, data beyond
        the storage limit has been deleted. Please ensure Bluetooth is connected during use to prevent
        data loss.
      </Text>
    </View>
  );

  return (
    // Render the warning modal using CustomModal component
    <CustomModal
      onClose={() => setOpenModal(false)} // Function to close modal
      content={data} // Warning content defined above
      isVisible={openModal} // Controls modal visibility
    />
  );
};