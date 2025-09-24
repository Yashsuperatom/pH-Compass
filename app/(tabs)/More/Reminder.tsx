// Calendar-based reminders screen.
// - Requests calendar permission, loads upcoming week events from modifiable calendars
// - Lets user add a new event via native dialog
// - Groups events into sections: Today, Tomorrow, or date string
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, SectionList, RefreshControl } from "react-native";
import { MotiView } from "moti";
import * as Calendar from "expo-calendar";
import * as AddCalendarEvent from "react-native-add-calendar-event";

export default function Reminder() {
  // Events returned by Calendar API (any[] due to platform differences)
  const [events, setEvents] = useState<any[]>([]);
  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Returns a friendly section key for a given date
  const formatDateKey = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toDateString();
  };

  // Groups a flat event list into SectionList sections by date
  const groupEventsByDate = (eventList: any[]) => {
    const grouped: Record<string, any[]> = {};
    eventList.forEach((event) => {
      const key = formatDateKey(event.startDate);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return Object.keys(grouped).map((key) => ({ title: key, data: grouped[key] }));
  };

  // Loads next 7 days of events from calendars that allow modifications
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

  // Ask for calendar permission on mount, then load events
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        loadEvents();
      }
    })();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Opens native UI to create a calendar event with defaults
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

  // Transform events into sections consumable by SectionList
  const sections = groupEventsByDate(events);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Button to launch native event creation dialog */}
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
        // Empty state animation and hint
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
        // Render grouped events with pull-to-refresh
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
