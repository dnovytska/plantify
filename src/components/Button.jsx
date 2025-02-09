import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, color, textColor, width, borderWeight }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color, width: width, borderWeight: borderWeight }]} 
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 50,
    borderWeight: 10,
    borderColor: 'black',
    margin: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
});

export default Button;
