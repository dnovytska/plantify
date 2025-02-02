import React from 'react';
import { View, StyleSheet } from 'react-native';

const Plant = () => {
  return (
    <View style={styles.plantContainer}>
      <View style={styles.plantLeaves} />
      <View style={styles.plantPot} />
    </View>
  );
};

const styles = StyleSheet.create({
  plantContainer: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
  plantLeaves: {
    width: 100,
    height: 100,
    backgroundColor: 'green',
    borderRadius: 20,
  },
  plantPot: {
    width: 80,
    height: 40,
    backgroundColor: 'yellow',
    borderRadius: 10,
    marginTop: -20,
  },
});

export default Plant;