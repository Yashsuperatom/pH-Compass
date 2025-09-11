import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoreLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        
        screenOptions={{
          headerTintColor: "black",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "white",
          },
         contentStyle: {
  backgroundColor: "white",
  
}
        }}
      >
        <Stack.Screen name="index" options={{ title: "More" }} />
        <Stack.Screen name="AccountSettings" options={{ title: "My Profile" }} />
        <Stack.Screen name="ManualEntry" options={{ title: "Manual Entry" }} />
        <Stack.Screen name="Reminder" options={{ title: "Reminder" }} />
        <Stack.Screen name="ComingSoon" options={{ title: "Coming Soon" }} />
      </Stack>
    </SafeAreaView>
  );
}
