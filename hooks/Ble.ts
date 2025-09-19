import { useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import { insertData } from "@/Database/supabaseData";
import { useUser } from "@clerk/clerk-expo";

const bleManager = new BleManager();
let notificationBuffer = Buffer.alloc(0);
let subscription: any;


export function useBlePH() {
    const { user } = useUser();
    const [devices, setDevices] = useState<Device[]>([]);
    const [connected, setConnected] = useState<Device>();
    const [isScanning, setIsScanning] = useState(false);

    // -------- Permissions ----------
    const requestBluetoothPermissions = async () => {
        if (Platform.OS === "android") {
            try {
                if (Platform.Version >= 31) {
                    const result = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    ]);
                    return (
                        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === "granted" &&
                        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === "granted"
                    );
                } else {
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
        return true;
    };

    // -------- Scan ----------
    const startScanning = async () => {
        const btState = await bleManager.state();
        if (btState !== "PoweredOn") {
            alert("Please turn on bluetooth");
            return;
        }
        const granted = await requestBluetoothPermissions();
        if (!granted) {
            Alert.alert("Please allow Bluetooth permissions to use the app");
            return;
        }

        setDevices([]);
        setIsScanning(true);

        bleManager.startDeviceScan([], { allowDuplicates: false }, (error, device) => {
            if (error) {
                console.log("Scan error", error);
                setIsScanning(false);
                return;
            }
            if (device && device.name) {
                setDevices((prev) => {
                    if (!prev.some((d) => d.id === device.id)) {
                        return [...prev, device];
                    }
                    return prev;
                });
            }
        });

        setTimeout(() => {
            bleManager.stopDeviceScan();
            setIsScanning(false);
        }, 10000);
    };

    // -------- Connect ----------

    const connectToDevice = async (device: Device) => {
        try {
            const connectedDevice = await device.connect();
            await connectedDevice.discoverAllServicesAndCharacteristics();
            await connectedDevice.requestMTU(247);

            subscription = undefined;

            connectedDevice.onDisconnected(() => {
                setConnected(undefined);
                notificationBuffer = Buffer.alloc(0);
                if (subscription) {
                    subscription.remove();  // stop notifications
                    subscription = undefined;
                }
            });

            const services = await connectedDevice.services();
            for (const service of services) {
                const characteristics = await service.characteristics();
                for (const char of characteristics) {
                    if (char.uuid.toLowerCase().startsWith("00001234")) {
                        subscription = connectedDevice.monitorCharacteristicForService(
                            service.uuid,
                            char.uuid,
                            (error, characteristic) => {
                                if (error) {
                                    console.log("Notification error", error);
                                    return;
                                }
                                if (characteristic?.value) {
                                    const bytes = Buffer.from(characteristic.value, "base64");
                                    notificationBuffer = Buffer.concat([notificationBuffer, bytes]);

                                    while (notificationBuffer.length >= 12) {
                                        const magic = notificationBuffer.readUInt32LE(0);
                                        if (magic !== 0xDEADBEEF) {
                                            notificationBuffer = notificationBuffer.slice(1);
                                            continue;
                                        }
                                        const payloadLen = notificationBuffer.readUInt8(5);
                                        const fullPacketSize = 4 + 2 + payloadLen + 2;
                                        if (notificationBuffer.length < fullPacketSize) break;

                                        const packet = notificationBuffer.slice(0, fullPacketSize);
                                        notificationBuffer = notificationBuffer.slice(fullPacketSize);

                                        const payload = packet.slice(6, 6 + payloadLen);
                                        if (payloadLen >= 26) {
                                            const seq = payload.readUInt16LE(0);
                                            const timestamp =
                                                Number(
                                                    (BigInt(payload.readUInt32LE(6)) << 32n) +
                                                    BigInt(payload.readUInt32LE(2))
                                                );
                                            const ph = payload.readFloatLE(10);
                                            const temp = payload.readFloatLE(14);
                                            const voltage = payload.readFloatLE(18);
                                            const errCode = payload.readUInt32LE(22);

                                            console.log("Sensor Data", { seq, ph, temp, voltage, errCode });

                                            const email = user?.emailAddresses[0]?.emailAddress;
                                            if (email) {
                                                insertData(email, {
                                                    sequence_no: seq,
                                                    ph,
                                                    temperature: temp,
                                                    bat_voltage: voltage,
                                                    err_code: errCode,
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        );
                    }
                }
            }
            setConnected(connectedDevice);
        } catch (err) {
            console.log("Connection error", err);
        }
    };

    // -------- Disconnect ----------
    const disconnectDevice = async () => {
        if (connected) {
            try {
                await connected.cancelConnection();
            } catch (err) {
                console.log("Disconnect error", err);
            } finally {
                setConnected(undefined);
                notificationBuffer = Buffer.alloc(0);
            }
        }
    };

    return {
        devices,
        connected,
        isScanning,
        startScanning,
        connectToDevice,
        disconnectDevice,
    };
}
