import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';

const HomeScreen = () => {
  const [frame, setFrame] = useState(1);

  const handleFrameChange = () => {
    setFrame(frame === 1 ? 2 : 1);
  };

  return (
    <View style={styles.container}>
      {frame === 1 ? (
        <>
 <Text style={styles.frameText}>Frame 1: Conteúdo A</Text>
        </>
      ) : (
        <>
          <Text style={styles.frameText}>Frame 2: Conteúdo B</Text>
        </>
      )}
      <Button title="Mudar Frame" onPress={handleFrameChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;