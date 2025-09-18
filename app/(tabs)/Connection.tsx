import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
  Alert,
  TextInput
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "@/components/Modall";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BleManager, Characteristic, Device, Service } from "react-native-ble-plx";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Buffer } from "buffer";
import Button from "@/components/Button";
import { insertData, getUser } from "@/Database/supabaseData";
import { useUser } from "@clerk/clerk-expo";
import { useBlePH } from "@/hooks/Ble";



export default function PHMeterScreen() {
  const { user } = useUser();
  const {
    devices,
    connected,
    isScanning,
    startScanning,
    connectToDevice,
    disconnectDevice,
  } = useBlePH(user);
  // State for modal visibility
  const [ModalVisible, setModalVisible] = useState(false);
  // Setup phase indicator (Phase1 = scanning, Phase2 = list devices)
  const [setup, setSetup] = useState("Phase1");
  // Flag for scanning
  // const [isScanning, setIsScanning] = useState(false);
  // // Found devices list
  // const [devices, setDevices] = useState<Device[]>([]);
  // // Connected device
  // const [connected, setConnected] = useState<Device>();
  // // Current logged-in user (via Clerk)
  // const { user } = useUser();
  // Manual code entry (not fully used here, but exists for pairing input)
  const [manualCode, setManualCode] = useState("");

  // Buffer to accumulate BLE notification packets
  let notificationBuffer = Buffer.alloc(0);

  

  // Update setup phase based on scanning state
  useEffect(() => {
    if (isScanning) {
      setSetup("Phase1"); // scanning
    } else {
      setSetup("Phase2"); // scanning done, show list
    }
  }, [isScanning]);

  // Fetch user details from Supabase when Clerk user is available
  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = user?.emailAddresses[0]?.emailAddress;
      if (!email) return;
      const result = await getUser(email);
      console.log("User data:", result);
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  


  // Modal content (pairing instructions & device list)
  const modalContent = () => {
    return (
      <View>
        <View>
          {/* Header with back button */}
          <View
            className="flex-row items-center justify-between p-4 border-b "
            style={{ borderColor: "#D7D7D7" }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={"chevron-back-outline"}
                size={20}
                color={"#304FFE"}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-[#304FFE] font-semibold text-md">
                  Back
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="font-semibold text-xl">Connect</Text>
            </View>
            <View className="mx-8"></View>
          </View>

          {/* Step instructions */}
          <View className="gap-4 p-4">
            <Text className="font-semibold text-xl ">
              Let's connect your pH meter
            </Text>
            <View className="flex-row items-center gap-3">
              <Text
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#304FFE",
                  textAlign: "center",
                  borderRadius: 100,
                  color: "white",
                }}
              >
                1
              </Text>
              <Text className="font-semibold">
                Power on <Text className="font-normal">your meter.</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#304FFE",
                  textAlign: "center",
                  borderRadius: 100,
                  color: "white",
                }}
              >
                2
              </Text>
              <Text className="p-2">
                Go to your meter and{" "}
                <Text className="font-semibold">select Settings,</Text> then{" "}
                <Text className="font-semibold">Wireless,</Text> then{" "}
                <Text className="font-semibold">Pairing.</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-3 ">
              <Text
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#304FFE",
                  textAlign: "center",
                  borderRadius: 100,
                  color: "white",
                }}
              >
                3
              </Text>
              <Text>
                Then{" "}
                <Text className="font-semibold">select "Pair Device"</Text>{" "}
                and follow the on-screen instructions.
              </Text>
            </View>
          </View>

          {/* Phase1 = scanning loader */}
          <View className="mt-20">
            {setup === "Phase1" && (
              <View className="items-center gap-4 p-4 mt-20">
                <Text className="text-center font-bold text-xl">
                  Looking for devices
                </Text>
                <Image
                  className="animate-spin"
                  source={require("@/assets/images/load.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
            )}

            {/* Phase2 = show list of devices */}
            {setup === "Phase2" && (
              <View className="p-4">
                <Text className="text-lg font-bold mb-4">
                  Select your Smart pH
                </Text>
                <FlatList
                  className="h-40"
                  data={devices}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center justify-between my-3 bg-white p-3 rounded-xl"
                      onPress={() => connectToDevice(item)}
                    >
                      <View className="flex-row items-center gap-2">
                        <AntDesign name="calculator" size={24} color="black" />
                        <View>
                          <Text className="font-bold">
                            {item.name || "Unnamed Device"}
                          </Text>
                          <Text>{item.id}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward-outline"
                        size={24}
                        color={"#848484"}
                      />
                    </TouchableOpacity>
                  )}
                />
                <View style={{ margin: 70, alignItems: "center" }}>
                  <Text className="text-sm text-center text-gray-500 ">
                    Not yours?
                  </Text>
                  <Text className="text-sm text-gray-500 ">
                    We are scanning for more...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Main UI
  return (
    <SafeAreaView className="bg-white">
      <View className="justify-around h-full px-4 bg-white items-center ">
        {/* Title */}
        <View>
          <Text className="text-4xl font-bold text-center">
            Connect Your Smart pH
          </Text>
          <Text className="text-center text-lg mt-1 tracking-wider">
            Ensure your device is turned on and nearby.
          </Text>
        </View>

        {/* Device image */}
        <Image
          style={{ height: 214, width: 201 }}
          source={require("@/assets/images/BTKit.png")}
        />

        {/* Before connection → show scan button & modal */}
        {!connected && (
          <View className="gap-4 px-4">
            <Button onPress={() => startScanning()} title="Pair my Smart pH" />
            <CustomModal
              isVisible={ModalVisible}
              content={modalContent()}
              onClose={() => setModalVisible(false)}
            />
            <View className="flex-row  items-center gap-3 px-6 ">
              <Image source={require("@/assets/images/btimg.png")} />
              <Text className="text-left pr-6  ">
                During the Bluetooth® pairing process, you may be asked to enter
                a Device Code. This code is printed on your Smart pH device.
                Please keep it nearby to complete the connection successfully.
              </Text>
            </View>
          </View>
        )}

        {/* After connection → show connected device info */}
        {connected && (
          <View className="gap-2 ">
            <View className=" p-4 bg-white rounded-lg shadow-md mb-4 flex-row items-center justify-between ">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calculator" size={24} />
                <View>
                  <Text className="text-base font-semibold">
                    {connected?.name || "No device connected"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Device is connected
                  </Text>
                </View>
              </View>
            </View>

            {/* Disconnect button */}
            <TouchableOpacity
              className="p-3  mb-6 border rounded-xl"
              style={{ borderColor: "#CF2828" }}
              onPress={disconnectDevice}
            >
              <Text
                className=" text-center font-bold text-lg"
                style={{ color: "#CF2828" }}
              >
                Disconnect
              </Text>
            </TouchableOpacity>

            {/* Info section */}
            <Text className="text-black font-bold text-lg mb-2">
              How does the pH meter work?
            </Text>
            <Text className="text-gray-700 text-base">
              The pH Compass app talks to device and features a spill-resistant
              vial, large dosing area, and illuminated test strip slot.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
