import { Stack, useRouter } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";
import constants from "expo-constants";
import { Text } from "react-native";

// Prevent splash from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

// Disable font scaling globally (type-safe)
(Text as any).defaultProps = {
  ...(Text as any).defaultProps,
  allowFontScaling: false,
};


function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)/Insight");
    }
  }, [isLoaded, isSignedIn]);

  // Prevent UI from rendering until auth state is ready
  if (!isLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: "slide_from_right" }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="GetStarted" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
      </Stack>
      {/* Make status bar theme-aware */}
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

const clerkKey = constants.expoConfig?.extra?.clerkPublishableKey;

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkKey}>
      <AuthenticatedLayout />
    </ClerkProvider>
  );
}
