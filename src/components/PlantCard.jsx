import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PlantCard = ({ image, name, type, createdAt }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.plantName}>{name}</Text>
        <Text style={styles.plantType}>{type}</Text>
        <Text style={styles.createdAt}>{createdAt}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ECEAF5',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3D2A6D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D2A6D',
  },
  plantType: {
    fontSize: 14,
    color: '#5D9C9C',
  },
  createdAt: {
    fontSize: 12,
    color: '#5D9C9C',
  },
});

export default PlantCard;
