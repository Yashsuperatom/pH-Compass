import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import EntryModal from '@/components/Modal/Manual_entry';
import NewMedicineModal from '@/components/Modal/NewMedicineModal';

export default function MoreHome() {
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [entryVisible, setEntryVisible] = useState(false);
  const [medicineVisible, setMedicineVisible] = useState(false);

  const data: {
    name: string;
    url?: any;
    icon: any;
    action?: () => void;
  }[] = [
      { name: 'My Profile', url: '/More/AccountSettings', icon: 'person-circle-outline' },
      { name: 'Device Settings', url: '/More/Fota', icon: 'settings-outline' },
      { name: 'Reminder', url: '/More/Reminder', icon: 'calendar-outline' },
      { name: 'Manual Entry', icon: 'create-outline', action: () => setEntryVisible(true) },
      { name: 'Medical Data', url: '/More/ComingSoon', icon: 'reader-outline' },
      { name: 'Connect your Smart pH', url: '/Connection', icon: 'bar-chart-outline' },
      { name: 'Support & Feedback', url: '/More/Support', icon: 'people-circle-outline' },
      // { name: 'Notifications', url: '/More/ComingSoon', icon: 'notifications-circle-outline' },
      { name: 'User Manual', url: '/More/ComingSoon', icon: 'journal-outline' },
    ];

  const renderItem = ({ item }: { item: typeof data[0] }) => {
    const content = (
      <TouchableOpacity className="p-4 bg-gray-200 rounded-lg mb-4 flex-row justify-between items-center" onPress={item.action}>
        <View className="flex-row items-center gap-2">
          <Ionicons name={item.icon} size={20} color="black" />
          <Text className="text-lg">{item.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="gray" />
      </TouchableOpacity>
    );

    

    return item.action ? content : (
      <Link href={item.url!} asChild>
        {content}
      </Link>
    );
  };

  return (
    <SafeAreaView className="h-full border-t">
      <View className="flex-1 p-4">
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View className="mt-auto mb-4">
        <Text className="text-center text-gray-500">
          Last sync: {new Date(dateTime).toLocaleString()} {'\n'}
          0 unsynced entries
        </Text>
      </View>

      {/* Manual Entry Modal */}
      <EntryModal
        visible={entryVisible}
        onClose={() => setEntryVisible(false)}
        onAddMedicine={() => {
          setEntryVisible(false);
          setTimeout(() => setMedicineVisible(true), 300);
        }}
      />

      {/* New Medicine Modal */}
      <NewMedicineModal
        visible={medicineVisible}
        onClose={() => setMedicineVisible(false)}
        onOpenEntryModal={() => setEntryVisible(true)}
      />
    </SafeAreaView>
  );
}
