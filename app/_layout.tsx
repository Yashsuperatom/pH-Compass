// Root navigation layout using Expo Router with Clerk authentication
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
  // Read auth state (is the user signed in and is auth ready?)
  const { isSignedIn, isLoaded } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  // If user is signed in, send them straight to the tab stack
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)/Insight");
    }
  }, [isLoaded, isSignedIn]);

  // Prevent UI from rendering until auth state is ready
  if (!isLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Ensure the status bar matches the theme; currently using dark style */}
      <StatusBar style={colorScheme === "dark" ? "dark" : "dark"} />
      {/* Configure the main stack navigator and hide headers on top-level screens */}
      <Stack screenOptions={{ animation: "slide_from_right" }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="GetStarted" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
      </Stack>
      {/* Make status bar theme-aware */}
    </ThemeProvider>
  );
}

const clerkKey = constants.expoConfig?.extra?.clerkPublishableKey;

export default function RootLayout() {
  // Load custom fonts before showing the app
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide splash screen as soon as fonts are ready
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    // Provide Clerk auth to the app with secure token caching
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkKey}>
      <AuthenticatedLayout />
    </ClerkProvider>
  );
}
