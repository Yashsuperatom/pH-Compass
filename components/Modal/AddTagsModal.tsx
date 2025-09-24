// Modal for selecting one or more tags with icons and returning selection to parent
// Renders a 3-column grid inside a reusable CustomModal component
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "@/components/Modal2";

// Props for controlling visibility and receiving selected tags
interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (tags: string[]) => void;  // ✅ multi-select
}
// Available tag options with Ionicons names
const tags = [
  { label: "Out of Bed", icon: "bed-outline" },
  { label: "Before Breakfast", icon: "cafe-outline" },
  { label: "After Breakfast", icon: "fast-food-outline" },
  { label: "Before Lunch", icon: "restaurant-outline" },
  { label: "After Lunch", icon: "pizza-outline" },
  { label: "Before Dinner", icon: "wine-outline" },
  { label: "After Dinner", icon: "ice-cream-outline" },
  { label: "Before Bed", icon: "moon-outline" },
  { label: "After Snack", icon: "cafe-outline" },
  { label: "Before Snack", icon: "bag-outline" },
  { label: "Before Activity", icon: "time-outline" },
  { label: "After Activity", icon: "sunny-outline" },
  { label: "Other", icon: "apps-outline" },
];

export default function AddTagsModal({ isVisible, onClose, onSelect }: Props) {
// Local multiselect state
const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Toggle selection: add if missing, remove if already selected
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Return selected tags and close modal
  const handleDone = () => {
    onSelect(selectedTags);
    onClose();
  };

  return (
    <CustomModal
      isVisible={isVisible}
      onClose={onClose}
      content={
        <View className=" bg-white  w-[98%] rounded-xl">
          <View className="bg-white w-full rounded-xl p-4 ">
            <Text className="text-lg font-semibold mb-2">Add Tags</Text>
            <Text className="text-gray-500 mb-4">Add tags to your medicine</Text>

           {/* Grid of selectable tag chips */}
           <FlatList
            data={tags}
            numColumns={3}
            keyExtractor={(item) => item.label}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
            renderItem={({ item }) => {
              const isSelected = selectedTags.includes(item.label);
              return (
                <TouchableOpacity
                  onPress={() => toggleTag(item.label)}
                  style={{
                    borderColor: isSelected ? "#0983C8" : "#D8D8D8",
                    backgroundColor: isSelected ? "#E7F5FF" : "#FFFFFF",
                    borderWidth: 1,
                    width: "30%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={26}
                    color={isSelected ? "#0983C8" : "#000"}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      textAlign: "center",
                      marginTop: 6,
                      color: isSelected ? "#0983C8" : "#000",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />


          </View>
          {/* Footer with Done action */}
          <View style={{width:"auto",borderColor:"#D7D7D7",borderTopWidth:1,justifyContent:'flex-end'}}>
            <TouchableOpacity onPress={handleDone}>
                <Text style={{textAlign:'right',color:'#0983C8',fontWeight:600,padding:10}}>
                Done
            </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    />
  );
}
