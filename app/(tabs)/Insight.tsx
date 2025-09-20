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
  const [list, setList] = useState<any[]>([]);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const isFocused = useIsFocused();
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
  const [alert, setAlert] = useState()
  const [showAlert, setShowAlert] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [target, setTarget] = useState<any>();


  const manager = new BleManager();
  const { user } = useUser();
  const navigation = useNavigation<NavigationProp<any>>();



  // Handle notifications modal open
  const handleNotificationsPress = () => {
    setShowNotificationsModal(true);
    setUnreadCount(0); // Clear unread count when opening notifications
  };

  // Handle notifications modal close
  const handleNotificationsClose = () => {
    setShowNotificationsModal(false);
  };



  useEffect(() => {
    if (!user) return;
    let subscription: any;

    const setupTargetRealtime = async () => {
      try {
        const email = user?.emailAddresses[0]?.emailAddress;
        const userData = await getUser(email);
        if (!userData || userData.length === 0) return;

        const userId = userData[0].id;
        setTarget(userData[0].target_pH);

        // Subscribe to target changes for this user
        subscription = supabase
          .channel(`user-target-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${userId}`,
            },
            (payload: any) => {
              console.log("🔄 Target updated:", payload.new.target_pH);
              setTarget(payload.new.target_pH);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("❌ Error subscribing to target:", err);
      }
    };

    setupTargetRealtime();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user]);


  useEffect(() => {
    if (!user) return;

    let subscription: any;
    let userId: string;

    const setupRealtime = async () => {
      try {
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

        // Initial fetch
        const records = await getData(userId);

        console.log("📊 Initial records count:", records.length);
        setList(records);

        // Create unique channel name for this user
        const channelName = `data-realtime-updates-${userId}`;
        console.log("📡 Creating channel:", channelName);


        // Realtime listener
        subscription = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "Data",
              filter: `user_id=eq.${userId}`
            },
            (payload: any) => {
              console.log("📦 Realtime payload received:", payload);
              console.log("📦 New data inserted:", payload.new);
              console.log("this is new", payload.new.err_code)

              // Update local state immediately
              setList(prevList => {
                console.log("📈 Updating list, previous length:", prevList.length);
                const newList = [...prevList, payload.new];
                console.log("📈 New list length:", newList.length);
                return newList;
              });

              // Add to notifications
              setNotifications(prevNotifications => {
                const updatedNotifications = [payload.new, ...prevNotifications];
                // Keep only last 50 notifications
                return updatedNotifications.slice(0, 50);
              });

              // Increment unread count
              setUnreadCount(prev => prev + 1);


              setShowAlert(true);
              setAlert(payload.new.err_code)


              // Auto-hide after 3 sec
              setTimeout(() => setShowAlert(false), 3000);


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

        // Optional: Test the realtime connection
        console.log("🧪 Testing realtime connection...");

      } catch (error) {
        console.error("❌ Error setting up realtime:", error);
      }
    };

    setupRealtime();

    // Cleanup function
    return () => {
      if (subscription) {
        console.log("🧹 Cleaning up subscription");
        supabase.removeChannel(subscription);
        setRealtimeStatus('disconnected');
      }
    };
  }, [user]);

  // Optional: Listen for focus changes to refresh data
  useEffect(() => {
    if (isFocused && user) {
      console.log("🔄 Screen focused, checking for updates...");
      // Optionally refresh data when screen comes into focus
      refreshData();
    }
  }, [isFocused, user]);

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

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => b.id - a.id);
  }, [list]);

  const barData = useMemo(() => {
    return sortedList.map((item, index) => ({
      value: item.ph,
      label: new Date(item.created_at).getDate().toString(),
      frontColor:
        item.ph <= 4.5 ? "#FF9359" : item.ph > 4.5 && item.ph < 7.5 ? "#B1C644" : "#007FAA",
      onPress: () => setSelectedBar(index),
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

  // Check the device state 
  const checkConnectedDevices = async () => {
    try {
      const connectedDevices: Device[] = await manager.connectedDevices([]);
      if (connectedDevices.length === 0) {
        setIsDeviceConnected(true);
      } else {
        setIsDeviceConnected(false);
      }

    } catch (error) {
      console.log("❌ Error checking connected devices: ", error);
    }
  };

  useEffect(() => {
    checkConnectedDevices();
  }, []);

  return (
    <SafeAreaView className="h-full w-full gap-8 bg-white">

      {/* This is for alert of the device */}
      {showAlert && <View className="absolute flex justify-center items-center w-full top-5 ">
        {alert === 21 && <SenOk />}
        {alert === 22 && <SensorProbeError />}
        {alert === 23 && <Measurement1Error />}
        {alert === 24 && <Measurement2Error />}
        {alert === 25 && <Measurement3Error />}
        {alert === 26 && <DataUpdate />}
      </View>
      }
      {/* Header with notifications */}
      <View style={{ justifyContent: "flex-end", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
        <TouchableOpacity onPress={refreshData}>
          <Icon name="refresh" size={30} color="#A1A1A1" style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNotificationsPress} style={{ position: 'relative' }}>
          <Icon name="notifications" size={30} color="#A1A1A1" />
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

        <NotificationsModal
          isVisible={showNotificationsModal}
          onClose={handleNotificationsClose}
          notifications={notifications}
        />
      </View>




      {/* Debug info - remove in production
      {__DEV__ && (
        <View style={{ paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Realtime Status: {realtimeStatus} | Data Count: {list.length}
          </Text>
        </View>
      )} */}

      {/* Legend */}
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

      {/* Bar Chart */}
      {/* Bar Chart with Axis Titles */}
      <View style={{ alignItems: "center", marginTop: 20, }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Y-Axis Title (rotated) */}
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

          {/* Bar Chart */}
          <BarChart
  data={barData}
  barWidth={10}
  spacing={25}
  width={Dimensions.get("window").width - 40}
  barBorderRadius={10}
  xAxisLabelsVerticalShift={15}
  yAxisThickness={0}
  xAxisLabelsHeight={30}
  noOfSections={4}
  xAxisColor={"#B1B1B1"}

  // Add target pH
  showReferenceLine1={true}
  lineBehindBars={true}
  referenceLine1Position={target} // This is your target pH value
  referenceLine1Config={{
    color: "#FFD700", // gold color
    thickness: 4,
  }}
/>


        </View>



        {/* X-Axis Title */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: "black", marginTop: 8 }}>
          Date
        </Text>
      </View>


      {/* Data List */}
      {sortedList.length === 0 ? (
        <View style={{ padding: 20, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#F9FAFB", alignItems: "center" }}>

          {/* Optional icon */}
          <Ionicons name="alert-circle-outline" size={50} color="#FF6B6B" style={{ marginBottom: 15 }} />

          <Text style={{ fontSize: 16, fontWeight: "600", color: "#555", textAlign: "center", marginBottom: 10 }}>
            No data available
          </Text>

          <Text style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
            Please connect your device to see live data. Once connected, new readings will appear here automatically.
          </Text>

          {/* Optional “Connect Device” button */}
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
      ) : (<FlatList
        data={sortedList}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <DataCard item={item} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      )}
      {/* Device warning modal */}
      {/* {isDeviceConnected && <Warn />} */}
    </SafeAreaView>
  );
}