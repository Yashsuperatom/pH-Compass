import React from "react";
import { Text, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Buffer } from "buffer";
import { useBlePH } from "@/hooks/Ble"; // adjust path if needed

const FOTA_COMMAND =
  "efbeadde3a04010732000000000000000000000000000000000000000000000000000000000000000000000000000000b30e";

// TODO: Replace with your device’s real UUIDs
const serviceUUID = "00001234-0000-1000-8000-00805f9b34fb";
const characteristicUUID = "00001234-0000-1000-8000-00805f9b34fb";

export default function Fota() {
  const { connected } = useBlePH();

  const sendFOTACommand = async () => {
    if (!connected) {
      Alert.alert("⚠️ No device connected");
      return;
    }

    try {
      const bytes = Buffer.from(FOTA_COMMAND, "hex");
      const base64Data = bytes.toString("base64");

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

      {!connected && (
        <Text className="mt-4 text-gray-600 text-center">
          Connect a device first to enable FOTA
        </Text>
      )}
    </SafeAreaView>
  );
}
