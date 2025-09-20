import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomModal from "../Modall";

interface NotificationsModalProps {
    isVisible: boolean;
    onClose: () => void;
    notifications: any[];
}

// Helper to convert color string to Tailwind static class
const getBorderColorClass = (color: string) => {
    switch (color) {
        case "green-500": return "border-green-500";
        case "orange-600": return "border-orange-600";
        case "amber-500": return "border-amber-500";
        case "blue-500": return "border-blue-500";
        case "gray-500": return "border-gray-500";
        default: return "border-gray-500";
    }
};

const NotificationsModal = ({ isVisible, onClose, notifications }: NotificationsModalProps) => {
    const getAlertInfo = (errCode?: number) => {
        switch (errCode) {
            case 21:
                return { title: "Sensor OK", message: "Sensor is working properly", color: "green-500", icon: "check-circle" };
            case 22:
                return { title: "Sensor Probe Error", message: "Issue detected with sensor probe", color: "orange-600", icon: "error" };
            case 23:
            case 24:
            case 25:
                return { title: `Measurement Error ${errCode - 22}`, message: `Measurement ${errCode - 22} failed`, color: "amber-500", icon: "warning" };
            case 26:
                return { title: "Data Update", message: "New data received successfully", color: "blue-500", icon: "update" };
            default:
                return { title: "Data Update", message: "New data received successfully", color: "blue-500", icon: "update" };
        }
    };

    const formatTime = (timestamp: string) => new Date(timestamp).toLocaleString();

    const renderNotificationItem = ({ item }: { item: any }) => {
        const alertInfo = getAlertInfo(item.err_code);

        return (
            <View className={`bg-white mx-4 my-2 p-4 rounded-lg shadow-md ${getBorderColorClass(alertInfo.color)}`}>
                <View className="flex-row items-center mb-2">
                    <Icon name={alertInfo.icon} size={20} color={alertInfo.color} />
                    <Text className="text-gray-800 text-base font-semibold ml-2 flex-1">{alertInfo.title}</Text>
                    <Text className="text-gray-500 text-xs">{formatTime(item.created_at)}</Text>
                </View>
                <Text className="text-gray-500 text-sm mb-2">{alertInfo.message}</Text>
                {item.ph && (
                    <View className="flex-row items-center">
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 text-xs">pH Value: </Text>
                            <Text className={`font-semibold text-xs ${item.ph <= 4.5 ? "text-orange-400" :
                                    item.ph > 4.5 && item.ph < 7.5 ? "text-lime-500" :
                                        "text-blue-600"
                                }`}>
                                {item.ph}
                            </Text>
                        </View>

                    </View>
                )}
            </View>
        );
    };

    const modalContent = (
        <View className="bg-white rounded-xl h-full  shadow-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <View className="flex-row items-center py-4">
                    <Icon name="notifications" size={24} color="#007FAA" />
                    <Text className="text-gray-800 text-lg font-semibold ml-2">Notifications</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <View className="">
                {notifications.length === 0 ? (
                    <View className="flex-1 justify-center items-center p-10 min-h-[200px]">
                        <Icon name="notifications-none" size={50} color="#E0E0E0" />
                        <Text className="text-gray-400 text-base mt-4 text-center">No notifications</Text>
                        <Text className="text-gray-300 text-sm mt-1 text-center">Device alerts will appear here</Text>
                    </View>
                ) : (
                    <FlatList
                        scrollEnabled={true}
                        style={{ height: "80%" }}
                        data={notifications}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderNotificationItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 10 }}
                    />
                )}
            </View>

            {/* Footer */}
            {notifications.length > 0 && (
                <View className="p-4 border-t border-gray-200 items-center">
                    <Text className="text-gray-400 text-xs">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</Text>
                </View>
            )}
        </View>
    );

    return <CustomModal isVisible={isVisible} onClose={onClose} content={modalContent} />;
};

export default NotificationsModal;
