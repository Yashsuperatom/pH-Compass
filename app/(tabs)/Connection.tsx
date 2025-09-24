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
import { Ionicons } from "@expo/vector-icons";
// import { BleManager, Characteristic, Device, Service } from "react-native-ble-plx";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Buffer } from "buffer";
import Button from "@/components/Button";
import { useBlePH } from "@/hooks/Ble";

export default function PHMeterScreen() {
  // Custom hook that handles all Bluetooth Low Energy (BLE) operations
  // Returns devices array, connection status, scanning state, and functions
  const {
    devices,        // Array of discovered BLE devices
    connected,      // Currently connected device object (null if none)
    isScanning,     // Boolean indicating if device scan is in progress
    startScanning,  // Function to start scanning for devices
    connectToDevice,// Function to connect to a specific device
    disconnectDevice,// Function to disconnect from current device
  } = useBlePH();

  // State to control the visibility of the connection modal
  const [ModalVisible, setModalVisible] = useState(false);
  
  // State to track the setup phase:
  // "Phase1" = Currently scanning for devices (shows loading spinner)
  // "Phase2" = Scanning completed, showing list of found devices
  const [setup, setSetup] = useState("Phase1");
  
  // State for manual device code entry (currently not fully implemented)
  const [manualCode, setManualCode] = useState("");

  // Buffer to accumulate BLE notification packets (declared but not used in current implementation)
  let notificationBuffer = Buffer.alloc(0);

  // Effect to update the setup phase based on scanning state
  // When scanning starts -> Phase1 (loading screen)
  // When scanning stops -> Phase2 (device list)
  useEffect(() => {
    if (isScanning) {
      setSetup("Phase1"); // Show loading/scanning UI
    } else {
      setSetup("Phase2"); // Show device list UI
    }
  }, [isScanning]);

  // Effect to automatically close the modal when a device gets connected
  useEffect(() => {
    if (connected) {
      setModalVisible(false); // Hide modal on successful connection
    }
  }, [connected]);

  // Commented out user fetching logic - was previously used to get user details from Supabase
  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     const email = user?.emailAddresses[0]?.emailAddress;
  //     if (!email) return;
  //     const result = await getUser(email);
  //     console.log("User data:", result);
  //   };

  //   if (user) {
  //     fetchUserDetails();
  //   }
  // }, [user]);

  // Function that returns the modal content JSX
  // Contains the pairing instructions and device selection interface
  const modalContent = () => {
    return (
      <View>
        <View>
          {/* Modal Header with back button and title */}
          <View
            className="flex-row items-center justify-between p-4 border-b "
            style={{ borderColor: "#D7D7D7" }}
          >
            {/* Back button section */}
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
            {/* Modal title */}
            <View>
              <Text className="font-semibold text-xl">Connect</Text>
            </View>
            {/* Spacer for centering */}
            <View className="mx-8"></View>
          </View>

          {/* Step-by-step pairing instructions */}
          <View className="gap-4 p-4">
            <Text className="font-semibold text-xl ">
              Let's connect your pH meter
            </Text>
            
            {/* Step 1: Power on device */}
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
            
            {/* Step 2: Navigate to device settings */}
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
            
            {/* Step 3: Initiate pairing on device */}
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

          {/* Dynamic content based on setup phase */}
          <View className="mt-20">
            {/* Phase 1: Scanning in progress - show loading spinner */}
            {setup === "Phase1" && (
              <View className="items-center gap-4 p-4 mt-20">
                <Text className="text-center font-bold text-xl">
                  Looking for devices
                </Text>
                {/* Animated loading spinner */}
                <Image
                  className="animate-spin"
                  source={require("@/assets/images/load.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
            )}

            {/* Phase 2: Scanning complete - show discovered devices list */}
            {setup === "Phase2" && (
              <View className="p-4">
                <Text className="text-lg font-bold mb-4">
                  Select your Smart pH
                </Text>
                {/* FlatList displaying discovered BLE devices */}
                <FlatList
                  className="h-40"
                  data={devices} // Array of discovered devices
                  keyExtractor={(item) => item.id} // Use device ID as key
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center justify-between my-3 bg-white p-3 rounded-xl"
                      onPress={() => connectToDevice(item)} // Connect when tapped
                    >
                      <View className="flex-row items-center gap-2">
                        {/* Device icon */}
                        <AntDesign name="calculator" size={24} color="black" />
                        <View>
                          {/* Device name (or "Unnamed Device" if no name) */}
                          <Text className="font-bold">
                            {item.name || "Unnamed Device"}
                          </Text>
                          {/* Device ID/MAC address */}
                          <Text>{item.id}</Text>
                        </View>
                      </View>
                      {/* Arrow indicator */}
                      <Ionicons
                        name="chevron-forward-outline"
                        size={24}
                        color={"#848484"}
                      />
                    </TouchableOpacity>
                  )}
                />
                {/* Message indicating continued scanning */}
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

  // Main component UI render
  return (
    <SafeAreaView className="bg-white">
      <View className="justify-around h-full px-4 bg-white items-center ">
        
        {/* Main title and subtitle */}
        <View>
          <Text className="text-4xl font-bold text-center">
            Connect Your Smart pH
          </Text>
          <Text className="text-center text-lg mt-1 tracking-wider">
            Ensure your device is turned on and nearby.
          </Text>
        </View>

        {/* pH device image illustration */}
        <Image
          style={{ height: 214, width: 201 }}
          source={require("@/assets/images/BTKit.png")}
        />

        {/* UI when NO device is connected - show pairing options */}
        {!connected && (
          <View className="gap-4 px-4">
            {/* Main pairing button */}
            <Button onPress={() => {
              startScanning(); // Start BLE device scanning
              // Only show modal if scanning actually started
              if(isScanning){
                setModalVisible(true)
              }
            }} title="Pair my Smart pH" />
            
            {/* Modal containing pairing instructions and device list */}
            <CustomModal
              isVisible={ModalVisible}
              content={modalContent()} // Modal content defined above
              onClose={() => setModalVisible(false)} // Close modal handler
            />
            
            {/* Information section about device codes */}
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

        {/* UI when a device IS connected - show device info and controls */}
        {connected && (
          <View className="gap-2 ">
            {/* Connected device information card */}
            <View className=" p-4 bg-white rounded-lg shadow-md mb-4 flex-row items-center justify-between ">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calculator" size={24} />
                <View>
                  {/* Connected device name */}
                  <Text className="text-base font-semibold">
                    {connected?.name || "No device connected"}
                  </Text>
                  {/* Connection status */}
                  <Text className="text-sm text-gray-500">
                    Device is connected
                  </Text>
                </View>
              </View>
            </View>

            {/* Disconnect button */}
            <TouchableOpacity
              className="p-3  mb-6 border rounded-xl"
              style={{ borderColor: "#CF2828" }} // Red border
              onPress={disconnectDevice} // Disconnect function from hook
            >
              <Text
                className=" text-center font-bold text-lg"
                style={{ color: "#CF2828" }} // Red text
              >
                Disconnect
              </Text>
            </TouchableOpacity>

            {/* Information section about how the pH meter works */}
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