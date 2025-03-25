import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();

  
  return (
    <View style={styles.container}>
      {/* Imagem do perfil */}
      <View style={styles.profileContainer}>
        <Image source={require('../../assets/images/woman.png')} style={styles.profileImage} />
      </View>

      {/* Nome e Email */}
      <Text style={styles.username}>Username</Text>
      <Text style={styles.email}>Email</Text>

      {/* Botão de Editar Perfil */}
      <TouchableOpacity style={styles.editButton} 
        onPress={() => navigation.navigate('EditProfileScreen')}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  profileContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3D2A6D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D9C9C',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#5D9C9C',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#B2B8F5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#3D2A6D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;
