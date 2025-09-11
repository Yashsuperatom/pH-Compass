import React from 'react';
import { Modal, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSave?: () => void;
  children: React.ReactNode;
  showSaveButton?: boolean;
  saveButtonText?: string;
};

export default function CustomModal({
  visible,
  onClose,
  title,
  onSave,
  children,
  showSaveButton = true,
  saveButtonText = 'Save'
}: CustomModalProps) {
  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <View style={{ backgroundColor: '#EBEBEB', flex: 1, borderRadius: 20, top: 10 }}>
        <View className="flex-row justify-between border-b p-4" style={{ borderColor: '#D7D7D7' }}>
          <TouchableOpacity onPress={onClose}>
            <Text className="font-semibold text-[#304FFE]">Back</Text>
          </TouchableOpacity>
          <Text className="font-semibold">{title}</Text>
          <View className="px-4" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}
