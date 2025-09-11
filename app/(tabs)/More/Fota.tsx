// Fota.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

interface FotaProps {
  connectedDevice: Device | null;
}

const FOTA_COMMAND =
  "efbeadde3a04010732000000000000000000000000000000000000000000000000000000000000000000000000000000b30e";

export default function Fota({ connectedDevice }: FotaProps) {
  const sendFOTACommand = async () => {
    if (!connectedDevice) {
      Alert.alert("⚠️ No device Found");
      return;
    }

    try {
      // Replace these with your actual service + characteristic UUIDs
      const serviceUUID = "00001234-0000-1000-8000-00805f9b34fb";
      const characteristicUUID = "00001234-0000-1000-8000-00805f9b34fb";

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
        className="p-4 bg-green-500 rounded-xl"
        onPress={sendFOTACommand}
      >
        <Text className="text-white text-center font-bold text-lg">
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
