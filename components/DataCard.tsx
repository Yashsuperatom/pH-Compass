import React, { memo } from "react";
import { View, Text } from "react-native";

const DataCard = memo(({ item }: { item: any }) => {
  return (
    <View style={{ marginBottom: 8, marginHorizontal: 10, borderRadius: 8, borderColor: "gray", borderWidth: 1 }}>
      {/* Header */}
      <View style={{
        backgroundColor: item.ph <= 4.5 ? "#FF9359" : item.ph > 4.5 && item.ph < 7.5 ? "#B1C644" : "#007FAA",
        flexDirection: "row", justifyContent: "space-between", padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8
      }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {new Date(item.created_at).toDateString().slice(0, 3)},{new Date(item.created_at).toDateString().slice(3)}
        </Text>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          pH Value : {item.ph.toFixed(2)}
        </Text>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 }}>
        <Text style={{ color: "#555" }}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {/* Temperature */}
          <View
            style={{
              backgroundColor:
                item.temperature < 36 ? "#007FAA" :
                item.temperature <= 37.5 ? "#B1C644" : "#FF4C4C",
              width: 80, height: 40, borderRadius: 20,
              justifyContent: "center", alignItems: "center"
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {item.temperature?.toFixed(2)} °C
            </Text>
          </View>
          {/* Battery */}
          <View
            style={{
              backgroundColor:
                item.bat_voltage < 2.6 ? "#FF4C4C" :
                item.bat_voltage <= 3.0 ? "#B1C644" : "#007FAA",
              width: 60, height: 40, borderRadius: 20,
              justifyContent: "center", alignItems: "center"
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {item.bat_voltage?.toFixed(2)} V
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default DataCard;
