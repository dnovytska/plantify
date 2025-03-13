import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import Title from '../components/Title';
import PlantCard from '../components/PlantCard';

const HomeScreen = () => {
  const [frame, setFrame] = useState(1);

  const handleFrameChange = () => {
    setFrame(frame === 1 ? 2 : 1);
  };

  return (
    <View>
      <Title>Your Plants</Title>

    <ScrollView>
      <View style={{ padding: 15 }}>
        <PlantCard
          image={require('../../assets/images/plant.png')}
          name="Aloe Vera"
          type="Succulent"
          createdAt="Added on Jan 20, 2025"
        />
        <PlantCard
          image={require('../../assets/images/plant.png')} 
          name="Snake Plant"
          type="Evergreen"
          createdAt="Added on Feb 10, 2025"
        />
        <PlantCard
          image={require('../../assets/images/plant.png')} 
          name="Cactus"
          type="Desert Plant"
          createdAt="Added on Mar 1, 2025"
        />
      </View>
    </ScrollView>
    </View>
  );
};

export default HomeScreen;