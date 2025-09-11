import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
// import { fetchRecords } from '@/Database/Database';
import { getData, getUser } from '@/Database/supabaseData';
import { useUser } from '@clerk/clerk-expo';
import Button from '@/components/Button';

export default function Report() {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [range, setRange] = useState(false);
  const { user } = useUser();

  const onChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      if (editingDate === "fromDate") {
        setFromDate(selectedDate);
      } else if (editingDate === "toDate") {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(false);
  };

  const toggleRange = () => setRange(!range);

  const exportDataToPDF = async () => {
    try {
      if (!range) {
        alert("Please select a date range first.");
        return;
      }

      // ✅ Fetch Data
      const email = user?.emailAddresses[0].emailAddress;
      if (!email) {
        alert("User email not found.");
        return;
      }

     const usr = await getUser(email);
if (!usr || usr.length === 0) {
  alert("User not found.");
  return;
}

const userId = usr[0].id;

const records = await getData(userId);



      // ✅ Filter records by date range
      const filteredRecords = records.filter((item) => {
  const recordDate = new Date(item.created_at);
  return recordDate >= fromDate && recordDate <= toDate;
});


      if (!filteredRecords.length) {
        alert("No data available for the selected date range.");
        return;
      }

      // ✅ Format data as HTML for PDF
      let htmlContent = `
        <html>
        <head><style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #007FAA; color: white; }
        </style></head>
        <body>
            <h2 style="text-align:center;">pH Records (${fromDate.toDateString()} - ${toDate.toDateString()})</h2>
            <table>
                <tr>
                    <th>#</th>
                    <th>pH Level</th>
                    <th>Date & Time</th>
                </tr>
                ${filteredRecords
          .map(
            (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.ph}</td>
                        <td>${new Date(item.created_at).toLocaleString()}</td>
                    </tr>
                `
          )
          .join("")}
            </table>
        </body>
        </html>
      `;

      // ✅ Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // ✅ Ensure Sharing is Available Before Proceeding
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        alert("Sharing is not available on this device.");
        return;
      }

      // ✅ Share the PDF file
      await Sharing.shareAsync(uri).catch(() => {
        alert("Sharing process was interrupted.");
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <SafeAreaView className="h-full gap-8 items-center bg-white ">
      <Image
        style={{ width: 200, height: 270, marginTop: 80 }}
        source={require("@/assets/images/Kit.png")}
      />

      <View className="w-full">
        <View className="flex flex-row w-full justify-between px-[16px] py-[8px]">
          <Text className="text-[#808080] text-[20px] ">File Format</Text>
          <View className="flex flex-row gap-[8px] items-center">
            <Image source={require("@/assets/images/pdf.png")} />
            <Text className="text-xl font-semibold">PDF</Text>
          </View>
        </View>

        <Text className="text-[#304FFE] text-2xl font-semibold py-[8px] px-[16px]">
          Period
        </Text>
        <View className="border-solid border-black border-y px-[16px]">
          <TouchableOpacity>
            <Text className="text-2xl py-[8px]">2 Week</Text>
          </TouchableOpacity>
          <View className="border-solid border-y border-[#D7D7D7]">
            <TouchableOpacity>
              <Text className="text-2xl py-[8px] ">3 Month</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex flex-row items-center justify-between"
            onPress={toggleRange}
          >
            <Text className="text-2xl py-[8px]">Custom</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={"#304FFE"}
              style={{ transform: [{ rotate: range ? "90deg" : "0deg" }] }}
            />
          </TouchableOpacity>

          {range && (
            <View>
              <View className="flex flex-row justify-between border-[#D7D7D7] border-y py-[8px]">
                <Text className="text-[#808080] text-[18px]">From Date</Text>
                {showDatePicker && editingDate === "fromDate" && (
                  <DateTimePicker value={fromDate} mode="date" onChange={onChange} />
                )}
                <TouchableOpacity onPress={() => {
                  setEditingDate("fromDate");
                  setShowDatePicker(true);
                }}>
                  <Text className="text-[#808080] text-[18px]">
                    {fromDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex flex-row justify-between py-[8px]">
                <Text className="text-[#808080] text-[18px] ">To Date</Text>
                {showDatePicker && editingDate === "toDate" && (
                  <DateTimePicker value={toDate} mode="date" onChange={onChange} />
                )}
                <TouchableOpacity onPress={() => {
                  setEditingDate("toDate");
                  setShowDatePicker(true);
                }}>
                  <Text className="text-[#808080] text-[18px]">
                    {toDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <Button onPress={exportDataToPDF} title='Continue' style={{ width: "80%", padding: 4 }} />
    </SafeAreaView>
  );
}