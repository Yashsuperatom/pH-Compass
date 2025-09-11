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

const bleManager = new BleManager();

export default function PHMeterScreen() {
  const [ModalVisible, setModalVisible] = useState(false);
  const [setup, setSetup] = useState("Phase1");
  const [viewDevice, setViewDevice] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connected, setConnected] = useState<Device>()
  const { user } = useUser();
  const [manualCode, setManualCode] = useState("");

  let notificationBuffer = Buffer.alloc(0);

  useEffect(() => {
    if (isScanning) {
      setSetup("Phase1");
    } else {
      setSetup("Phase2");
    }
  }, [isScanning]);

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



  async function requestBluetoothPermissions() {
    if (Platform.OS === "android") {
      try {
        if (Platform.Version >= 31) {
          // Android 12+
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          return (
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === "granted" &&
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === "granted"
          );
        } else {
          // Android 6 - 11
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return result === "granted";
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS always returns true
  }
  const startScanning = async () => {

    const btState = await bleManager.state();
    if (btState !== 'PoweredOn') {
      alert("Please turn on bluetooth")
      return;
    }
    const PermissionGranted = await requestBluetoothPermissions();
    if (!PermissionGranted) {
      Alert.alert("Please allow Bluetooth permissions to use the app");
      return;
    }
    console.log("start scanning");
    setModalVisible(true);
    setIsScanning(true);
    setDevices([]);
    bleManager.startDeviceScan(
      [],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.log("error", error);
          setIsScanning(false);
          return;
        }

        if (device && device.name) {
          setDevices((prevDevices) => {
            if (!prevDevices.some((d) => d.id === device.id)) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
      }
    );
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);

  };

  // Outside your component or as a useRef

  const checkIfDeviceConnected = async (device: Device) => {
    try {
      console.log("Connecting to device...");
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      const negotiatedMTU = await connectedDevice.requestMTU(247);
      console.log("Negotiated MTU:", negotiatedMTU);

      const services = await connectedDevice.services();

      for (const service of services) {
        const characteristics = await service.characteristics();

        for (const char of characteristics) {
          console.log(service.uuid);
          console.log(char.uuid);

          if (char.uuid.toLowerCase().startsWith("00001234")) {
            console.log("Subscribing to notifications on:", char.uuid);

            connectedDevice.monitorCharacteristicForService(
              service.uuid,
              char.uuid,
              (error, characteristic) => {
                if (error) {
                  console.log("Notification Error:", error);
                  connectedDevice.cancelConnection();
                  return;
                }

                const data = characteristic?.value;
                if (data) {
                  try {
                    const bytes = Buffer.from(data, "base64");
                    console.log("Received bytes length:", bytes.length)
                    console.log("Raw Bytes: ", bytes.toString("hex"));


                    notificationBuffer = Buffer.concat([notificationBuffer, bytes]);

                    // Parse multiple packets if present in buffer
                    while (notificationBuffer.length >= 12) {
                      // Check magic word first
                      const magic = notificationBuffer.readUInt32LE(0);
                      if (magic !== 0xDEADBEEF) {
                        notificationBuffer = notificationBuffer.slice(1);
                        continue;
                      }

                      // Read payloadLen from header
                      const payloadLen = notificationBuffer.readUInt8(5);

                      // Full packet size: magic(4) + header(2) + payload + CRC(2)
                      const fullPacketSize = 4 + 2 + payloadLen + 2;

                      if (notificationBuffer.length < fullPacketSize) {
                        // Incomplete packet, wait for next notify
                        break;
                      }

                      const packet = notificationBuffer.slice(0, fullPacketSize);
                      notificationBuffer = notificationBuffer.slice(fullPacketSize);

                      const rspId = packet.readUInt8(4);
                      console.log("📦 Response ID:", rspId);
                      console.log("📦 Payload Length:", payloadLen);


                      function readBigUInt64LE(buffer: Buffer, offset: number = 0) {
                        const low = buffer.readUInt32LE(offset);
                        const high = buffer.readUInt32LE(offset + 4);
                        return (BigInt(high) << 32n) + BigInt(low);
                      }

                      const payload = packet.slice(6, 6 + payloadLen);

                      // Decode sensor data if payloadLen ≥ 26
                      if (payloadLen >= 26) {
                        const seq = payload.readUInt16LE(0);
                        const timestamp = Number(readBigUInt64LE(payload, 2));
                        const ph = payload.readFloatLE(10);
                        const temp = payload.readFloatLE(14);
                        const voltage = payload.readFloatLE(18);
                        const errCode = payload.readUInt32LE(22);

                        console.log("✅ Sensor Data:");
                        console.log("Seq:", seq);
                        console.log("Timestamp:", timestamp);
                        console.log("pH:", ph);
                        console.log("Temp:", temp);
                        console.log("Battery Voltage:", voltage);
                        console.log("Error Code:", errCode);

                        // data insert in database
                        const email = user?.emailAddresses[0]?.emailAddress;
                        if (email) {
                          insertData(email, {
                            sequence_no: seq,
                            ph: ph,
                            temperature: temp,
                            bat_voltage: voltage,
                            err_code: errCode,
                          });
                        }


                      }
                    }

                  } catch (e) {
                    console.log("⚠️ Failed to decode data:", e);
                  }
                }
              }
            );
          }
        }
      }

      const isConnected = await connectedDevice.isConnected();
      if (isConnected) {
        console.log("Connected!");
        setConnected(connectedDevice);
        setModalVisible(false);
        setViewDevice(false);
      } else {
        console.log("Connection failed");
        setModalVisible(false);
      }

    } catch (error) {
      console.log("Error while connecting:", error);
      setModalVisible(false);
    }
  };

  const disconnectDevice = async () => {
    try {
      if (connected) {
        await connected.cancelConnection();
        console.log("🔌 Device disconnected successfully");
      }
    } catch (error) {
      console.log("❌ Error disconnecting device:", error);
    } finally {
      setConnected(undefined);
      setViewDevice(true);
      notificationBuffer = Buffer.alloc(0);
    }
  };

  const modalContent = () => {
    return (
      <View>
          <View>
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
            <View className="mt-20">
              {setup === "Phase1" && (
                <View className="items-center gap-4 p-4 mt-20">
                  <Text className="text-center font-bold text-xl">
                    Looking for devices
                  </Text>
                  <Image className="animate-spin" source={require("@/assets/images/load.png")} style={{ width: 30, height: 30 }} />

                </View>
              )}
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
                      <TouchableOpacity key={item.id} className="flex-row items-center justify-between my-3 bg-white p-3 rounded-xl" onPress={() => checkIfDeviceConnected(item)}>
                        <View className="flex-row items-center gap-2">
                          <AntDesign name="calculator" size={24} color="black" />
                          <View><Text className="font-bold">{item.name || "Unnamed Device"}</Text>
                            <Text>{item.id}</Text></View>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={24} color={"#848484"} />


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

  return (
    <SafeAreaView className="bg-white">
      <View className="justify-around h-full px-4 bg-white ">
        <View>
          <Text className="text-4xl font-bold text-center">
            Connect Your Smart pH
          </Text>
          <Text className="text-center text-lg mt-1 tracking-wider">
            Ensure your device is turned on and nearby.
          </Text>
        </View>

        <View className="items-center mt-6">
          <Image
            style={{ width: 188, height: 200 }}
            source={require("@/assets/images/BTKit.png")}
          />
        </View>

        {viewDevice && (
          <View className="gap-4 ">
            <Button onPress={() =>
              startScanning()
            } title="Pair my Smart pH" />
            <CustomModal
              isVisible={ModalVisible}
              content={modalContent()}
              onClose={() => setModalVisible(false)}
            />
            <View className="flex-row  items-center gap-3 px-6 ">
              <Image source={require("@/assets/images/btimg.png")} />
              <Text className="text-left pr-6  ">
                During the Bluetooth® pairing process, you may be asked to enter a Device Code. This code is printed on your Smart pH
                device. Please keep it nearby to complete the connection
                successfully.
              </Text>
            </View>
          </View>
        )}
        {!viewDevice && (
          <View className="gap-4 ">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="bluetooth" size={18} color="#000" />
              <Text className="ml-2 text-black text-base">
                Bluetooth® wireless technology
              </Text>
            </View>

            <View className="flex-row items-center mb-4">
              <Ionicons name="heart" size={18} color="red" />
              <Text className="ml-2 text-black text-base">
                Usage activates mySugr PRO
              </Text>
            </View>

            <View className="w-80 p-4 bg-white rounded-lg shadow-md mb-4 flex-row items-center justify-between ">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calculator" size={24} />
                <View>
                  <Text className="text-base font-semibold">
                    {connected?.name || "No device connected"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Last import 5 seconds ago
                  </Text>
                </View>
              </View>
              <View>
                <Ionicons name="chevron-forward-outline" size={24} />
              </View>
            </View>

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

            <Text className="text-black font-bold text-lg mb-2">
              How does the pH meter work?
            </Text>
            <Text className="text-gray-700 text-base">
              The pH meter talks to myPH and features a spill-resistant vial,
              large dosing area, and illuminated test strip slot.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}