import React from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  content?: React.ReactNode;
  children?: React.ReactNode;
  modalPosition?: "center" | "bottom" | "top";
  animationType?: "slide" | "fade" | "none";
  backgroundColor?: string;
}

export default function CustomModal({ isVisible, content, onClose }: CustomModalProps) {
  return (
    <Modal transparent visible={isVisible} animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "center", alignItems: "center" }}
      >
        {content}
      </TouchableOpacity>
    </Modal>
  );
}