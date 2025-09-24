import React, { useState, useEffect, useMemo } from "react";
import { Text, View, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { useIsFocused } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { Warn } from "@/components/Modal/Device_warn";
import { BleManager, Device } from 'react-native-ble-plx';
import { useUser } from "@clerk/clerk-expo";
import { getData, getUser } from "@/Database/supabaseData";
import { supabase } from "@/lib/supabase";
import observer from "@/Utils/Observer";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import DataCard from "@/components/DataCard";
import DataUpdate from "@/alerts/MeasurementOk";
import SensorProbeError from "@/alerts/SensorProbeError";
import Measurement3Error from "@/alerts/Measurement3Error";
import Measurement2Error from "@/alerts/Measurement2Error";
import Measurement1Error from "@/alerts/Measurement1Error";
import SenOk from "@/alerts/SenOk";
import NotificationsModal from "@/components/Modal/NotificationModal";
import { LineChart } from "react-native-gifted-charts";

export default function Insight() {
  // State to store pH measurement data list
  const [list, setList] = useState<any[]>([]);
  
  // State to track which bar is selected in the chart (for showing details)
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  
  // Hook to detect when the screen is focused/active
  const isFocused = useIsFocused();
  
  // State to track if Bluetooth device is connected
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  
  // State to track real-time database connection status
  const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
  
  // State for storing error/alert codes from device
  const [alert, setAlert] = useState()
  
  // State to control visibility of alert messages
  const [showAlert, setShowAlert] = useState(false)
  
  // State to control notifications modal visibility
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // State to store notification list
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // State to track unread notification count
  const [unreadCount, setUnreadCount] = useState(0);
  
  // State to store user's target pH value
  const [target, setTarget] = useState<any>();

  // Initialize Bluetooth Low Energy manager
  const manager = new BleManager();
  
  // Get current authenticated user from Clerk
  const { user } = useUser();
  
  // Navigation hook for screen transitions
  const navigation = useNavigation<NavigationProp<any>>();

  // Function to handle notifications modal opening
  const handleNotificationsPress = () => {
    setShowNotificationsModal(true);
    setUnreadCount(0); // Reset unread count when user opens notifications
  };

  // Function to handle notifications modal closing
  const handleNotificationsClose = () => {
    setShowNotificationsModal(false);
  };

  // Effect to set up real-time subscription for target pH changes
  useEffect(() => {
    if (!user) return;
    let subscription: any;

    const setupTargetRealtime = async () => {
      try {
        // Get user email and fetch user data
        const email = user?.emailAddresses[0]?.emailAddress;
        const userData = await getUser(email);
        if (!userData || userData.length === 0) return;

        const userId = userData[0].id;
        // Set initial target pH value
        setTarget(userData[0].target_pH);

        // Subscribe to real-time updates for target pH changes
        subscription = supabase
          .channel(`user-target-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE', // Listen for UPDATE events
              schema: 'public',
              table: 'users',
              filter: `id=eq.${userId}`, // Only listen to changes for this user
            },
            (payload: any) => {
              console.log("🔄 Target updated:", payload.new.target_pH);
              // Update target pH when it changes in the database
              setTarget(payload.new.target_pH);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("❌ Error subscribing to target:", err);
      }
    };

    setupTargetRealtime();

    // Cleanup function to remove subscription
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user]);

  // Main effect to set up real-time data subscription for pH measurements
  useEffect(() => {
    if (!user) return;

    let subscription: any;
    let userId: string;

    const setupRealtime = async () => {
      try {
        // Get user email and fetch user data
        const email = user?.emailAddresses[0]?.emailAddress;
        console.log("🔧 Setting up realtime for email:", email);

        const userData = await getUser(email);
        console.log("👤 User data:", userData);

        if (!userData || userData.length === 0) {
          console.log("❌ No user data found");
          return;
        }

        userId = userData[0].id;
        console.log("🆔 Setting up realtime for userId:", userId);

        // Initial data fetch to populate the list
        const records = await getData(userId);
        console.log("📊 Initial records count:", records.length);
        setList(records);

        // Create unique channel name for this user's data updates
        const channelName = `data-realtime-updates-${userId}`;
        console.log("📡 Creating channel:", channelName);

        // Set up real-time listener for new data insertions
        subscription = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT", // Listen for new records
              schema: "public",
              table: "Data", // Table name
              filter: `user_id=eq.${userId}` // Filter for this user's data only
            },
            (payload: any) => {
              console.log("📦 Realtime payload received:", payload);
              console.log("📦 New data inserted:", payload.new);
              console.log("this is new", payload.new.err_code)

              // Update local state with new data immediately
              setList(prevList => {
                console.log("📈 Updating list, previous length:", prevList.length);
                const newList = [...prevList, payload.new];
                console.log("📈 New list length:", newList.length);
                return newList;
              });

              // Add new data to notifications list
              setNotifications(prevNotifications => {
                const updatedNotifications = [payload.new, ...prevNotifications];
                // Limit to last 50 notifications to prevent memory issues
                return updatedNotifications.slice(0, 50);
              });

              // Increment unread notification counter
              setUnreadCount(prev => prev + 1);

              // Show alert based on error code from device
              setShowAlert(true);
              setAlert(payload.new.err_code)

              // Auto-hide alert after 3 seconds
              setTimeout(() => setShowAlert(false), 3000);

              // Emit event for other components that might need to know about new data
              observer.emit("dataInserted", payload.new);
            }
          )
          .on("system", {}, (payload) => {
            console.log("🔄 System event:", payload);
          })
          .subscribe((status, err) => {
            console.log("📡 Realtime subscription status:", status);
            setRealtimeStatus(status);

            if (err) {
              console.error("❌ Realtime subscription error:", err);
            }

            // Handle different subscription states
            if (status === 'SUBSCRIBED') {
              console.log("✅ Successfully subscribed to realtime updates");
            } else if (status === 'CHANNEL_ERROR') {
              console.error("❌ Channel error occurred");
            } else if (status === 'TIMED_OUT') {
              console.error("⏰ Subscription timed out");
            } else if (status === 'CLOSED') {
              console.log("🔒 Channel closed");
            }
          });

        console.log("🧪 Testing realtime connection...");

      } catch (error) {
        console.error("❌ Error setting up realtime:", error);
      }
    };

    setupRealtime();

    // Cleanup function to remove subscription when component unmounts
    return () => {
      if (subscription) {
        console.log("🧹 Cleaning up subscription");
        supabase.removeChannel(subscription);
        setRealtimeStatus('disconnected');
      }
    };
  }, [user]);

  // Effect to refresh data when screen comes into focus
  useEffect(() => {
    if (isFocused && user) {
      console.log("🔄 Screen focused, checking for updates...");
      // Refresh data when user returns to this screen
      refreshData();
    }
  }, [isFocused, user]);

  // Function to manually refresh data from database
  const refreshData = async () => {
    if (!user) return;

    try {
      const email = user?.emailAddresses[0]?.emailAddress;
      const userData = await getUser(email);

      if (!userData || userData.length === 0) return;

      const userId = userData[0].id;
      const records = await getData(userId);
      setList(records);
      console.log("🔄 Data refreshed, count:", records.length);
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    }
  };

  // Memoized sorted list - sorts by ID in descending order (newest first)
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => b.id - a.id);
  }, [list]);

  // Memoized bar chart data - transforms pH data for chart visualization
  const barData = useMemo(() => {
    return sortedList.map((item, index) => ({
      value: item.ph, // pH value for bar height
      label: new Date(item.created_at).getDate().toString(), // Date as label
      // Color coding based on pH levels
      frontColor:
        item.ph <= 4.5 ? "#FF9359" : item.ph > 4.5 && item.ph < 7.5 ? "#B1C644" : "#007FAA",
      onPress: () => setSelectedBar(index), // Handle bar selection
      // Show time tooltip when bar is selected
      topLabelComponent: selectedBar === index ? () => (
        <View style={{
          position: "absolute", backgroundColor: "white", borderRadius: 5, padding: 2,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
          shadowRadius: 3.84, elevation: 5, width: 50, alignItems: "center"
        }}>
          <Text style={{ color: "#344BFD", fontSize: 8, fontWeight: "400", }}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      ) : undefined,
    }));
  }, [sortedList, selectedBar]);

  // Function to check if any Bluetooth devices are connected
  const checkConnectedDevices = async () => {
    try {
      const connectedDevices: Device[] = await manager.connectedDevices([]);
      if (connectedDevices.length === 0) {
        setIsDeviceConnected(true); // No devices connected
      } else {
        setIsDeviceConnected(false); // Device is connected
      }

    } catch (error) {
      console.log("❌ Error checking connected devices: ", error);
    }
  };

  // Check device connection status on component mount
  useEffect(() => {
    checkConnectedDevices();
  }, []);

  return (
    <SafeAreaView className="h-full w-full gap-8 bg-white">

      {/* Alert overlay - shows different alerts based on error codes from device */}
      {showAlert && <View className="absolute flex justify-center items-center w-full top-5 ">
        {alert === 21 && <SenOk />} {/* Sensor OK */}
        {alert === 22 && <SensorProbeError />} {/* Sensor probe error */}
        {alert === 23 && <Measurement1Error />} {/* Measurement error 1 */}
        {alert === 24 && <Measurement2Error />} {/* Measurement error 2 */}
        {alert === 25 && <Measurement3Error />} {/* Measurement error 3 */}
        {alert === 26 && <DataUpdate />} {/* Data update OK */}
      </View>
      }

      {/* Header with refresh and notifications buttons */}
      <View style={{ justifyContent: "flex-end", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
        {/* Refresh button */}
        <TouchableOpacity onPress={refreshData}>
          <Icon name="refresh" size={30} color="#A1A1A1" style={{ marginRight: 10 }} />
        </TouchableOpacity>
        
        {/* Notifications button with unread count badge */}
        <TouchableOpacity onPress={handleNotificationsPress} style={{ position: 'relative' }}>
          <Icon name="notifications" size={30} color="#A1A1A1" />
          {/* Red badge showing unread count */}
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -2,
              right: -2,
              backgroundColor: '#FF5722',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications modal */}
        <NotificationsModal
          isVisible={showNotificationsModal}
          onClose={handleNotificationsClose}
          notifications={notifications}
        />
      </View>

      {/* Debug info section - commented out for production */}
      {/* Debug info - remove in production
      {__DEV__ && (
        <View style={{ paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Realtime Status: {realtimeStatus} | Data Count: {list.length}
          </Text>
        </View>
      )} */}

      {/* Legend for pH level color coding */}
      <View className="flex-row gap-4 items-center px-4">
        <View className="flex-row gap-2 items-center">
          <View className="bg-[#FF9359] w-4 h-4 rounded-full"></View>
          <Text>Acidic</Text>
        </View>
        <View className="flex-row gap-2 items-center">
          <View className="bg-[#B1C644] w-4 h-4 rounded-full"></View>
          <Text>Normal</Text>
        </View>
        <View className="flex-row gap-2 items-center">
          <View className="bg-[#007FAA] w-4 h-4 rounded-full"></View>
          <Text>Alkaline</Text>
        </View>
      </View>

      {/* Bar Chart Section with Axis Labels */}
      <View style={{ alignItems: "center", marginTop: 20, }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Y-Axis Title (rotated 90 degrees) */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "black",
              transform: [
                { rotate: "-90deg" },
                { translateY: 20 },
              ],
            }}
          >
            pH value
          </Text>

          {/* Bar Chart Component */}
          <BarChart
            data={barData} // Chart data
            barWidth={10} // Width of each bar
            spacing={25} // Space between bars
            width={Dimensions.get("window").width - 40} // Chart width
            barBorderRadius={10} // Rounded bar corners
            xAxisLabelsVerticalShift={15} // Shift x-axis labels
            yAxisThickness={0} // Hide y-axis line
            xAxisLabelsHeight={30} // Height for x-axis labels
            noOfSections={4} // Number of horizontal grid lines
            xAxisColor={"#B1B1B1"} // X-axis color

            // Target pH reference line
            showReferenceLine1={true} // Show reference line
            lineBehindBars={true} // Draw line behind bars
            referenceLine1Position={target} // Position at target pH value
            referenceLine1Config={{
              color: "#FFD700", // Gold color for target line
              thickness: 4, // Line thickness
            }}
          />
        </View>

        {/* X-Axis Title */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: "black", marginTop: 8 }}>
          Date
        </Text>
      </View>

      {/* Data List Section */}
      {sortedList.length === 0 ? (
        // Empty state when no data is available
        <View style={{ padding: 20, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#F9FAFB", alignItems: "center" }}>
          {/* Warning icon */}
          <Ionicons name="alert-circle-outline" size={50} color="#FF6B6B" style={{ marginBottom: 15 }} />

          <Text style={{ fontSize: 16, fontWeight: "600", color: "#555", textAlign: "center", marginBottom: 10 }}>
            No data available
          </Text>

          <Text style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
            Please connect your device to see live data. Once connected, new readings will appear here automatically.
          </Text>

          {/* Connect Device button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Connection")}
            style={{
              marginTop: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: "#007FAA",
              borderRadius: 25,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Connect Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Data list when data is available
        <FlatList
          data={sortedList}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <DataCard item={item} />}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          initialNumToRender={10} // Render first 10 items
          maxToRenderPerBatch={10} // Render 10 items per batch
          windowSize={5} // Keep 5 screens worth of items in memory
          removeClippedSubviews={true} // Remove off-screen items from memory
        />
      )}
      
      {/* Device warning modal - currently commented out */}
      {/* {isDeviceConnected && <Warn />} */}
    </SafeAreaView>
  );
}