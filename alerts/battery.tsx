import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 20,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F0',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 250,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
    color: '#FFD700',
  },
  alertText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

const BatteryAlert = ({ message }:any) => {
  return (
    <View style={styles.alertContainer}>
      <View style={styles.iconContainer}>
        {/* Unicode warning sign */}
        <Text style={styles.icon}>&#9888;&#xFE0E;</Text>
      </View>
      <Text style={styles.alertText}>{message}</Text>
    </View>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <BatteryAlert message="Battery needs replacement" />
    </View>
  );
}
