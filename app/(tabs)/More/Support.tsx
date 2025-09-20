import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import * as MailComposer from "expo-mail-composer";

export default function SupportScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = async () => {
    if (!email || !message) {
      Alert.alert("Error", "Please fill in your email and message.");
      return;
    }


    
    const options = {
      recipients: ["gorasg2010@gmail.com"], // your support email
      subject: `Support Request from ${name || "User"}`,
      body: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Email is not available on this device.");
      return;
    }

    try {
      await MailComposer.composeAsync(options);
      Alert.alert("Success", "Your message has been sent!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      Alert.alert("Error", "Failed to send email.");
      console.warn(err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Contact Support</Text>

      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Your Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={6}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={sendEmail}
        style={{
          backgroundColor: "#023E77",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>Send Message</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
