// Fota.tsx
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

const manager = new BleManager();

const FOTA_COMMAND =
  "efbeadde3a04010732000000000000000000000000000000000000000000000000000000000000000000000000000000b30e";

export default function Fota() {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // TODO: Replace with your device’s real UUIDs
  const serviceUUID = "00001234-0000-1000-8000-00805f9b34fb";
  const characteristicUUID = "00001234-0000-1000-8000-00805f9b34fb";

  // 🔍 Check for already connected devices
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const devices = await manager.connectedDevices([]); // empty [] means "any service"
        if (devices.length > 0) {
          setConnectedDevice(devices[0]);
          console.log("✅ Device connected:", devices[0].id);
        } else {
          setConnectedDevice(null);
          console.log("⚠️ No connected device found");
        }
      } catch (error) {
        console.log("❌ Error checking connection:", error);
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendFOTACommand = async () => {
    if (!connectedDevice) {
      Alert.alert("⚠️ No device connected");
      return;
    }

    try {
      const bytes = Buffer.from(FOTA_COMMAND, "hex");
      const base64Data = bytes.toString("base64");

      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Data
      );

      Alert.alert("✅ Success", "FOTA command sent!");
    } catch (error) {
      console.log("❌ FOTA Error:", error);
      Alert.alert("Error", "Failed to send FOTA command.");
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
      <TouchableOpacity
        className={`p-3 rounded-xl ${
          connectedDevice ? "bg-green-500" : "bg-gray-400"
        }`}
        onPress={sendFOTACommand}
        disabled={!connectedDevice}
      >
        <Text className="text-white font-bold text-lg text-center">
          Send FOTA Update
        </Text>
      </TouchableOpacity>

      {!connectedDevice && (
        <Text className="mt-4 text-gray-600 text-center">
          Connect a device first to enable FOTA
        </Text>
      )}
    </SafeAreaView>
  );
}
