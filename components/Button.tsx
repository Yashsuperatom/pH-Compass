import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type LinearGradientButtonProps = {
  title: string;
  onPress: () => void;
  colors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const Button: React.FC<LinearGradientButtonProps> = ({
  title,
  onPress,
  colors = ['#4c669f', '#3b5998', '#192f6a'],
  style,
  textStyle,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, style]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.button}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 10,
    padding: 2,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
