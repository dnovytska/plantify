import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import BottomBar from '../components/BottomBar';

const PlantScreen = () => {
  const [plantName, setPlantName] = useState('Plant Name');
  const [taskName, setTaskName] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon} />
        <Text style={styles.userName}>User Name</Text>
        <View style={styles.downArrow} />
      </View>
      <Text style={styles.plantName}>{plantName}</Text>
      <View style={styles.plantImage}>
        {/* Replace with actual plant image */}
        <View style={styles.plantIcon} />
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Diseases</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.taskInput}>
        <TextInput
          style={styles.input}
          placeholder="Task Name"
          value={taskName}
          onChangeText={setTaskName}
        />
      </View>
      <BottomBar></BottomBar>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    color: '#468585',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  downArrow: {
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  plantName: {
    fontSize: 24,
    color: '#468585',
    marginBottom: 10,
  },
  plantImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  plantIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  taskInput: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
  },
  bottomBar: {
    flexDirection: 'row',
    color: '#1A5E5E',
    backgroundColor: '#468585',
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  icon: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
});

export default PlantScreen;