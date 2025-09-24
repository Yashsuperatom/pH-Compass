// Simple FOTA (Firmware Over-The-Air) trigger screen.
// Sends a prebuilt command to a connected BLE device using a known service/characteristic.
import React from "react";
import { Text, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Buffer } from "buffer";
import { useBlePH } from "@/hooks/Ble"; // adjust path if needed

// Pre-encoded FOTA command payload as a hex string (device-specific)
const FOTA_COMMAND =
  "efbeadde3a04010732000000000000000000000000000000000000000000000000000000000000000000000000000000b30e";

// TODO: Replace with your device’s real UUIDs
const serviceUUID = "00001234-0000-1000-8000-00805f9b34fb";
const characteristicUUID = "00001234-0000-1000-8000-00805f9b34fb";

export default function Fota() {
  // BLE hook: provides the currently connected device (if any)
  const { connected } = useBlePH();

  // Converts the hex command to base64 and writes it to the BLE characteristic
  const sendFOTACommand = async () => {
    if (!connected) {
      Alert.alert("⚠️ No device connected");
      return;
    }

    try {
      // Convert hex string -> bytes -> base64 (react-native-ble-plx expects base64)
      const bytes = Buffer.from(FOTA_COMMAND, "hex");
      const base64Data = bytes.toString("base64");

      // Write with response to ensure the device acknowledges the command
      await connected.writeCharacteristicWithResponseForService(
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
      {/* Button is enabled only when a device is connected */}
      <TouchableOpacity
        className={`p-3 rounded-xl ${
          connected ? "bg-green-500" : "bg-gray-400"
        }`}
        onPress={sendFOTACommand}
        disabled={!connected}
      >
        <Text className="text-white font-bold text-lg text-center">
          Send FOTA Update
        </Text>
      </TouchableOpacity>

      {/* Helper text shown when no device is connected */}
      {!connected && (
        <Text className="mt-4 text-gray-600 text-center">
          Connect a device first to enable FOTA
        </Text>
      )}
    </SafeAreaView>
  );
}
