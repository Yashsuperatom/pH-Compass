import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomModal from '../Modal3';

export default function Other_setting({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selectedOption, setSelectedOption] = useState('Content Management');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const options = ['Content Management', 'Privacy', 'Notifications'];

  return (
    <CustomModal visible={visible} title="Other Setting" onClose={onClose}>
      <View className="flex-1 bg-[#F5F5F5] p-4">
        <View className="flex-row items-center gap-3 mb-6">
          <MaterialIcons name="settings-applications" size={50} color={"#0983C8"} />
          <Text className="text-gray-700 text-md flex-1">
            No need to change these, but of course you can.
          </Text>
        </View>

        {/* Dropdown */}
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          className="bg-white p-4 rounded-lg flex-row items-center justify-between mb-6"
        >
          <Text className="text-base">{selectedOption}</Text>
          <Ionicons name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={20} />
        </TouchableOpacity>

        {dropdownVisible &&
          options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSelectedOption(option);
                setDropdownVisible(false);
              }}
              className="bg-white border-b border-gray-300 p-4"
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}

        <Text className="text-base font-semibold mb-2 text-gray-700">Account</Text>

        <TouchableOpacity
          onPress={() => alert('Account deletion triggered')}
          style={{ borderColor: "#D3412F", borderWidth: 2, padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: "#D3412F", fontWeight: "500" }}>Delete My Account</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
