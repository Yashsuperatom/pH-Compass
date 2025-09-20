import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, SectionList, RefreshControl } from "react-native";
import { MotiView } from "moti";
import * as Calendar from "expo-calendar";
import * as AddCalendarEvent from "react-native-add-calendar-event";

export default function Reminder() {
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const formatDateKey = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toDateString();
  };

  const groupEventsByDate = (eventList: any[]) => {
    const grouped: Record<string, any[]> = {};
    eventList.forEach((event) => {
      const key = formatDateKey(event.startDate);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return Object.keys(grouped).map((key) => ({ title: key, data: grouped[key] }));
  };

  const loadEvents = useCallback(async () => {
    // Load from all modifiable calendars
    const calendars = await Calendar.getCalendarsAsync();
    const modifiable = calendars.filter((c) => c.allowsModifications).map((c) => c.id);

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const eventsList = await Calendar.getEventsAsync(modifiable, today, nextWeek);
    setEvents(eventsList);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        loadEvents();
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const addEvent = async () => {
    const eventConfig = {
      title: "",
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    };

    try {
      const eventInfo = await AddCalendarEvent.presentEventCreatingDialog(eventConfig);
      if (eventInfo?.action === "SAVED") {
        loadEvents(); // immediately reload events
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const sections = groupEventsByDate(events);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#023E77",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
        onPress={addEvent}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>➕ Add New Event</Text>
      </TouchableOpacity>

      {sections.length === 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 20, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 120 }}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "gray", textAlign: "center" }}>No events found</Text>
          <Text style={{ fontSize: 14, color: "gray", marginTop: 5 }}>Tap "Add New Event" to create one</Text>
        </MotiView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 8, color: "#023E77" }}>
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={{ padding: 12, backgroundColor: "#F5F5F5", marginBottom: 8, borderRadius: 8 }}>
              <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
              <Text>
                {new Date(item.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(item.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
