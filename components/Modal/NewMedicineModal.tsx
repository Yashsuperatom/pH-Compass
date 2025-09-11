import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import CustomModal from "@/components/Modall";
import AddTagsModal from "@/components/Modal/AddTagsModal";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../Button";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenEntryModal: () => void;
}

export default function NewMedicineModal({ visible, onClose, onOpenEntryModal }: Props) {
  const [medicineName, setMedicineName] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("MG");
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const units = ["MG", "ML", "TABLETS", "CAPSULES", "PUFFS"];

  const handleCloseAndOpenEntry = () => {
    onClose();
    setTimeout(() => onOpenEntryModal(), 300);
  };

  return (
    <>
      <CustomModal
        content={
          <View className="h-full bg-[#EBEBEB] rounded-2xl mt-2">
            <View className="flex-row justify-between items-center border-b border-gray-300 p-4">
              <TouchableOpacity onPress={handleCloseAndOpenEntry}>
                <Text className="text-[#304FFE]">Cancel</Text>
              </TouchableOpacity>
              <Text className="font-bold">New Medicine</Text>
              <TouchableOpacity onPress={handleCloseAndOpenEntry}>
                <Text className="text-[#304FFE]">Save</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4 gap-4">
              <View className="gap-2">
                <Text>Medicine Name</Text>
                <TextInput
                  value={medicineName}
                  onChangeText={setMedicineName}
                  placeholder="Enter medicine name"
                  className="bg-white p-3 rounded-lg"
                />
              </View>

              <View className="gap-2">
                <Text>Select Unit</Text>
                <FlatList
                  horizontal
                  data={units}
                  keyExtractor={(item) => item}
                  contentContainerStyle={{ gap: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedUnit(item)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        backgroundColor: selectedUnit === item ? "#304FFE" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#304FFE",
                      }}
                    >
                      <Text
                        style={{
                          color: selectedUnit === item ? "#FFFFFF" : "#304FFE",
                          fontWeight: "500",
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View className="gap-2">
                <Text>Tags</Text>
                <View className="bg-white rounded-lg" style={{ borderColor: '#D4D4D4', borderWidth: 1 }}>
                  <TouchableOpacity
                    onPress={() => setTagModalVisible(true)}
                    className="p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2">
                      <FontAwesome5 name="capsules" size={20} />
                      <Text>
                        {selectedTags.length > 0
                          ? `${selectedTags.length} selected`
                          : "Add Tags"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} />
                  </TouchableOpacity>

                  {selectedTags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 p-3">
                      {selectedTags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-[#E7F5FF] px-3 py-1 rounded-full"
                        >
                          <Text className="text-[#0983C8] text-xs">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity onPress={() => setTagModalVisible(true)}>
                    <Text
                      style={{
                        padding: 15,
                        borderTopWidth: 1,
                        borderTopColor: "#D4D4D4",
                        textAlign: "center",
                        color: "#0983C8",
                        fontWeight: "600",
                      }}
                    >
                      Add Tags
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button onPress={handleCloseAndOpenEntry} title=" Save Entry"  style={{marginTop:50}}  />
            </View>
          </View>
        }
        isVisible={visible}
        onClose={onClose}
      />

      <AddTagsModal
        isVisible={tagModalVisible}
        onClose={() => setTagModalVisible(false)}
        onSelect={(tags) => setSelectedTags(tags)}
      />
    </>
  );
}
