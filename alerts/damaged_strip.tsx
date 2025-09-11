import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE8E9',
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
    backgroundColor: '#FCECEC',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
    color: '#E53935',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
});

const DamagedStripAlert = ({ title, subtitle }:any) => {
  return (
    <View style={styles.alertContainer}>
      {/* Icon Container with a background color */}
      <View style={styles.iconContainer}>
        {/* Warning Icon */}
        <Text style={styles.icon}>&#x2716;</Text>
      </View>
      {/* Alert Text */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <DamagedStripAlert
        title="Damaged Strip"
        subtitle="Wrong/Damaged/Expired Sensor Strip"
      />
    </View>
  );
}
