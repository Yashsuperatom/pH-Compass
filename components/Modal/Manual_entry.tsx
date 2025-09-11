import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomModal from "@/components/Modall";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../Button";
import { insertData } from "@/Database/supabaseData";
import { useUser } from "@clerk/clerk-expo";



interface EntryModalProps {
    visible: boolean;
    onClose: () => void;
    onAddMedicine: () => void;
}

export default function EntryModal({
    visible,
    onClose,
    onAddMedicine,
}: EntryModalProps) {
    const [dateTime, setDateTime] = useState(new Date());
    const [activePicker, setActivePicker] = useState<"date" | "time" | null>(null);
    const [ph, setPh] = useState<number | null>(null);

    const onChange = (event: any, selected?: Date) => {
        if (selected) setDateTime(selected);
        setActivePicker(null);
    };


    const { user } = useUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    const handleSave = async () => {
        if (ph !== null) {
            if (!email) return
            await insertData(email, { 'ph': ph });
            // ideally use a Toast / Snackbar here
            onClose();
        } else {
            alert("Please enter pH value");
        }
    };

    return (
        <CustomModal
            content={
                <View className="h-full bg-[#EBEBEB] rounded-2xl mt-2">
                    {/* Header */}
                    <View className="flex-row justify-between items-center border-b border-gray-300 p-4">
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-[#304FFE]">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="font-bold">New Entry</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text className="text-[#304FFE]">Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View className="p-4 gap-4">
                        {/* Date & Time */}
                        <View className="gap-2">
                            <Text>Date & Time</Text>
                            <View className="flex-row items-center justify-between p-4 bg-white rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                <View className="flex-row items-center gap-3">
                                    <Ionicons name="calendar" size={20} />
                                    {/* <TouchableOpacity onPress={() => setActivePicker("date")}>
                                        <Text>{dateTime.toDateString()}</Text>
                                    </TouchableOpacity>
                                    <Text>at</Text>
                                    <TouchableOpacity onPress={() => setActivePicker("time")}>
                                        <Text>{dateTime.toLocaleTimeString()}</Text>
                                    </TouchableOpacity> */}

                                    <Text>{dateTime.toDateString()}</Text>
                                    <Text>at</Text>
                                    <Text>{dateTime.toLocaleTimeString()}</Text>


                                </View>
                                <Ionicons name="chevron-forward" size={24} />
                            </View>
                            {/* DateTimePicker */}
                            {activePicker === "date" && (
                                <DateTimePicker
                                    value={dateTime}
                                    mode="date"
                                    onChange={onChange}
                                    focusable={false}

                                />
                            )}
                            {activePicker === "time" && (
                                <DateTimePicker
                                    focusable={false}
                                    value={dateTime}
                                    mode="time"
                                    onChange={onChange}
                                />
                            )}
                        </View>

                        {/* pH Value */}
                        <View className="gap-2">
                            <Text>pH Value</Text>
                            <View className="flex-row items-center gap-4 bg-white p-2 rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                <View
                                    style={{
                                        backgroundColor:
                                            ph === null
                                                ? "#B1C644"
                                                : ph <= 4.5
                                                    ? "#FF9359"
                                                    : ph > 4.5 && ph < 7.5
                                                        ? "#B1C644"
                                                        : "#007FAA",
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                    }}
                                />
                                <TextInput
                                    keyboardType="numeric"
                                    value={ph !== null ? ph.toString() : ""}
                                    onChangeText={(text) =>
                                        setPh(isNaN(parseFloat(text)) ? null : parseFloat(text))
                                    }
                                    placeholder="5.5"
                                    className="flex-1"
                                />
                            </View>
                        </View>

                        {/* Pills / Add Medicine */}
                        <View className="gap-2 ">
                            <Text>Pills</Text>
                            <View className="bg-white rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                <TouchableOpacity
                                    onPress={onAddMedicine}
                                    className="p-4 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center gap-2 ">
                                        <FontAwesome5 name="capsules" size={20} />
                                        <TouchableOpacity onPress={() => setActivePicker("date")}>
                                            <Text>{dateTime.toDateString()}</Text>
                                        </TouchableOpacity>
                                        <Text>at</Text>
                                        <TouchableOpacity onPress={() => setActivePicker("time")}>
                                            <Text>{dateTime.toLocaleTimeString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onAddMedicine}>
                                    <Text style={{ padding: 15, borderTopWidth: 1, borderTopColor: "#D4D4D4", textAlign: 'center', color: '#0983C8', fontWeight: 600 }}>
                                        Add Pills
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                        {/* save button  */}

                        <Button style={{ marginTop: 50 }} onPress={handleSave} title="Save Entry" />
                    </View>
                </View>
            }
            isVisible={visible}
            onClose={onClose}
        />
    );
}
