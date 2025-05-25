import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';

export default function SettingsScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }} // Substitua por uma URL de imagem real ou use um estado para a foto
            style={styles.avatar}
          />
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#468585',
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#468585',
    color: '#fff',
    width: 20,
    height: 20,
    textAlign: 'center',
    borderRadius: 10,
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    color: '#468585',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#468585',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#B0A8F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});