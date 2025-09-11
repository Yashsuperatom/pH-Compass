import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Reminder() {
  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5] justify-center items-center px-6">
      {/* Icon */}
      <Image
        source={require('@/assets/images/remainder.png')} // replace with your image path
        style={{ width: 100, height: 100, marginBottom: 30 }}
        resizeMode="contain"
      />

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">Add Reminder</Text>

      {/* Subtitle */}
      <Text className="text-base text-gray-600 text-center mb-8">
        Add a Reminder to help you stay on track
      </Text>

      {/* Add Reminder Button */}
      <TouchableOpacity style={{ width: '100%', borderRadius: 10, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#0983C8', '#023E77']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingVertical: 15, borderRadius: 10, alignItems: 'center' }}
        >
          <Text className="text-white text-lg font-medium">Add Reminder</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
