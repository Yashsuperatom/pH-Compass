import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";

const SuccessAlert = ({ message }: any) => {
  return (
    <LinearGradient
      colors={["#E6F9EC", "#FFFFFF"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Checkmark Icon */}
      <View style={styles.iconContainer}>
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="green"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M20 6L9 17L4 12" />
        </Svg>
      </View>

      {/* Text */}
      <Text style={styles.text}>{message}</Text>
    </LinearGradient>
  );
};

export default function UpdateAlert() {
  return (
    <View style={styles.screen}>
      <SuccessAlert message="Data Updated" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // gray-100
    top:35,
    alignSelf: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    width:200
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: "#D1FAE5", // green-100
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937", // gray-800
  },
});
