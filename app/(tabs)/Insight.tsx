import React, { useState, useEffect, useMemo } from "react";
import { Text, View, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { useIsFocused } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Warn } from "@/components/Modal/Device_warn";
import { BleManager, Device } from 'react-native-ble-plx';
import { useUser } from "@clerk/clerk-expo";
import { getData, getUser } from "@/Database/supabaseData";
import { supabase } from "@/lib/supabase";
import observer from "@/Utils/Observer";
import UpdateAlert from "@/alerts/data_updated";

export default function Insight() {
  const [list, setList] = useState<any[]>([]);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const isFocused = useIsFocused();
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");


  const manager = new BleManager();
  const { user } = useUser();

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
        const channelName = `data-realtime-updates-${userId}-${Date.now()}`;
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

              // Update local state immediately
              setList(prevList => {
                console.log("📈 Updating list, previous length:", prevList.length);
                const newList = [...prevList, payload.new];
                console.log("📈 New list length:", newList.length);
                return newList;
              });

              setAlertMessage(`New data received: pH ${payload.new.ph.toFixed(2)}`);
              setShowAlert(true);

              // Auto-hide after 3 sec
              setTimeout(() => setShowAlert(false), 2000);


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
    return list.map((item, index) => ({
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
  }, [list, selectedBar]);

  // Check the device state 
  const checkConnectedDevices = async () => {
    try {
      const connectedDevices: Device[] = await manager.connectedDevices([]);

      if (connectedDevices.length === 0) {
        setIsDeviceConnected(true);
      } else {
        console.log("📱 Connected Devices: ", connectedDevices);
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
    
         {showAlert && <UpdateAlert />
}
      {/* Header with notifications */}
      <View style={{ justifyContent: "flex-end", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
        <TouchableOpacity onPress={refreshData}>
          <Icon name="refresh" size={30} color="#A1A1A1" style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="notifications" size={30} color="#A1A1A1" />
        </TouchableOpacity>
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
      <BarChart
        data={barData}
        barWidth={10}
        spacing={30}
        width={550}
        barBorderRadius={10}
        xAxisLabelsVerticalShift={15}
        yAxisThickness={0}
        xAxisLabelsHeight={40}
        noOfSections={4}
        xAxisColor={"#B1B1B1"}
      />
      {/* Data List */}
      <FlatList
        data={sortedList}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8, marginHorizontal: 10, borderRadius: 8, borderColor: "gray", borderWidth: 1 }}>
            <View style={{
              backgroundColor: item.ph <= 4.5 ? "#FF9359" : item.ph > 4.5 && item.ph < 7.5 ? "#B1C644" : "#007FAA",
              flexDirection: "row", justifyContent: "space-between", padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8
            }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {new Date(item.created_at).toDateString().slice(0, 3)},{new Date(item.created_at).toDateString().slice(3)}
              </Text>
              <View style={{ backgroundColor: "#FFFFFF99", borderRadius: 100 }}>
                <Ionicons name="chevron-forward-outline" size={24} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}>
              <View className="flex flex-row items-center gap-6">
                <Text style={{ color: "#555" }}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
                <View style={{
                  backgroundColor: item.ph <= 4.5 ? "#FF9359" : item.ph > 4.5 && item.ph < 7.5 ? "#B1C644" : "#007FAA",
                  width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center"
                }}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {item.ph.toFixed(2)}
                  </Text>

                </View>
              </View>
              <View className="flex flex-row  items-center gap-2">

                <View
                  style={{
                    backgroundColor:
                      item.temperature < 36
                        ? "#007FAA" // Low - Blue
                        : item.temperature <= 37.5
                          ? "#B1C644" // Normal - Green
                          : "#FF4C4C", // High - Red
                    width: 80,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {item.temperature?.toFixed(2)} °C
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor:
                      item.bat_voltage < 2.6
                        ? "#FF4C4C" // Low - Red
                        : item.bat_voltage <= 3.0
                          ? "#B1C644" // Medium - Green/Yellow
                          : "#007FAA", // Good - Blue
                    width: 60,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {item.bat_voltage?.toFixed(2)} V
                  </Text>
                </View>

              </View>


            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Device warning modal */}
      {isDeviceConnected && <Warn />}
    </SafeAreaView>
  );
}