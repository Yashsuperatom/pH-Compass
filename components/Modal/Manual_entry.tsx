import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomModal from "@/components/Modall";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../Button";
import { updateUser} from "@/Database/supabaseData";
import { useUser } from "@clerk/clerk-expo";

// TypeScript interface defining the props this modal component expects
interface EntryModalProps {
    visible: boolean;        // Controls whether modal is shown or hidden
    onClose: () => void;     // Function to call when modal should be closed
    onAddMedicine: () => void; // Function to call when "Add Pills" is pressed
}

export default function EntryModal({
    visible,
    onClose,
    onAddMedicine,
}: EntryModalProps) {
    // State for storing the selected date and time (initialized to current time)
    const [dateTime, setDateTime] = useState(new Date());
    
    // State to track which date/time picker is currently active (null = none active)
    const [activePicker, setActivePicker] = useState<"date" | "time" | null>(null);
    
    // State to store the pH value entered by user (null initially)
    const [ph, setPh] = useState<any | null>(null);

    // Handler for date/time picker changes
    const onChange = (event: any, selected?: Date) => {
        if (selected) setDateTime(selected); // Update dateTime if a date was selected
        setActivePicker(null); // Close the picker after selection
    };

    // Get current user information from Clerk authentication
    const { user } = useUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    // Function to handle saving the target pH value
    const handleSave = async () => {
        if (ph !== "") {
            // Convert string input to float number
            const phValue = parseFloat(ph);
            
            // Validate that the conversion was successful (not NaN)
            if (!isNaN(phValue)) {
                if (!email) return; // Exit if no user email available
                
                // Update user's target pH in the database
                await updateUser(email, { target_pH: phValue });
                onClose(); // Close modal after successful save
            } else {
                alert("Please enter a valid pH value");
            }
        } else {
            alert("Please enter pH value");
        }
    };

    return (
        <CustomModal
            content={
                <View className="h-full bg-[#EBEBEB] rounded-2xl mt-2">
                    {/* Modal Header with Cancel/Save buttons */}
                    <View className="flex-row justify-between items-center border-b border-gray-300 p-4">
                        {/* Cancel button */}
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-[#304FFE]">Cancel</Text>
                        </TouchableOpacity>
                        
                        {/* Modal title */}
                        <Text className="font-bold">New Entry</Text>
                        
                        {/* Save button */}
                        <TouchableOpacity onPress={handleSave}>
                            <Text className="text-[#304FFE]">Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content Area */}
                    <View className="p-4 gap-4">
                        
                        {/* Date & Time Section */}
                        <View className="gap-2">
                            <Text>Date & Time</Text>
                            <View className="flex-row items-center justify-between p-4 bg-white rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                <View className="flex-row items-center gap-3">
                                    <Ionicons name="calendar" size={20} />
                                    
                                    {/* Date and time display (currently non-interactive) */}
                                    {/* Commented out interactive date/time pickers:
                                    <TouchableOpacity onPress={() => setActivePicker("date")}>
                                        <Text>{dateTime.toDateString()}</Text>
                                    </TouchableOpacity>
                                    <Text>at</Text>
                                    <TouchableOpacity onPress={() => setActivePicker("time")}>
                                        <Text>{dateTime.toLocaleTimeString()}</Text>
                                    </TouchableOpacity> */}

                                    {/* Static date and time display */}
                                    <Text>{dateTime.toDateString()}</Text>
                                    <Text>at</Text>
                                    <Text>{dateTime.toLocaleTimeString()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} />
                            </View>
                            
                            {/* Conditional Date Picker - shows when date is being edited */}
                            {activePicker === "date" && (
                                <DateTimePicker
                                    value={dateTime}
                                    mode="date"
                                    onChange={onChange}
                                    focusable={false}
                                />
                            )}
                            
                            {/* Conditional Time Picker - shows when time is being edited */}
                            {activePicker === "time" && (
                                <DateTimePicker
                                    focusable={false}
                                    value={dateTime}
                                    mode="time"
                                    onChange={onChange}
                                />
                            )}
                        </View>

                        {/* Target pH Value Section */}
                        <View className="gap-2">
                            <Text>Target pH value</Text>
                            <View className="flex-row items-center gap-4 bg-white p-2 rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                {/* Color indicator circle - changes color based on pH level */}
                                <View
                                    style={{
                                        backgroundColor:
                                            ph === null
                                                ? "#B1C644"      // Default green for null
                                                : ph <= 4.5
                                                    ? "#FF9359"  // Orange for acidic (pH ≤ 4.5)
                                                    : ph > 4.5 && ph < 7.5
                                                        ? "#B1C644"  // Green for normal (4.5 < pH < 7.5)
                                                        : "#007FAA", // Blue for alkaline (pH ≥ 7.5)
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10, // Makes it circular
                                    }}
                                />
                                
                                {/* pH value input field */}
                                <TextInput
                                    keyboardType="decimal-pad" // Optimized keyboard for decimal numbers
                                    value={ph}
                                    onChangeText={(text) => {
                                        // Input validation: allow only numbers and one decimal point
                                        const cleaned: any = text.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
                                        if ((cleaned.match(/\./g) || []).length <= 1) { // Allow max one decimal point
                                            setPh(cleaned);
                                        }
                                    }}
                                    placeholderTextColor="gray"
                                    placeholder="Enter the value"
                                    className="flex-1"
                                />
                            </View>
                        </View>

                        {/* Pills/Medicine Section */}
                        <View className="gap-2 ">
                            <Text>Pills</Text>
                            <View className="bg-white rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                                {/* Pills date/time display */}
                                <TouchableOpacity
                                    onPress={onAddMedicine}
                                    className="p-4 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center gap-2 ">
                                        <FontAwesome5 name="capsules" size={20} />
                                        {/* Interactive date picker for pills */}
                                        <TouchableOpacity onPress={() => setActivePicker("date")}>
                                            <Text>{dateTime.toDateString()}</Text>
                                        </TouchableOpacity>
                                        <Text>at</Text>
                                        {/* Interactive time picker for pills */}
                                        <TouchableOpacity onPress={() => setActivePicker("time")}>
                                            <Text>{dateTime.toLocaleTimeString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} />
                                </TouchableOpacity>
                                
                                {/* Add Pills button */}
                                <TouchableOpacity onPress={onAddMedicine}>
                                    <Text style={{ 
                                        padding: 15, 
                                        borderTopWidth: 1, 
                                        borderTopColor: "#D4D4D4", 
                                        textAlign: 'center', 
                                        color: '#0983C8', 
                                        fontWeight: 600 
                                    }}>
                                        Add Pills
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* Bottom Save Button */}
                        <Button 
                            style={{ marginTop: 50 }} 
                            onPress={handleSave} 
                            title="Save Entry" 
                        />
                    </View>
                </View>
            }
            isVisible={visible}
            onClose={onClose}
        />
    );
}