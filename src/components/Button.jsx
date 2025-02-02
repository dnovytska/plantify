import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    width: '80%',
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Button;