import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.image || 'https://via.placeholder.com/100' }} // Usa a imagem do usuário ou uma padrão
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'User  Name'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('About')}>
            <Text style={styles.optionText}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#2F2182',
  },
});
