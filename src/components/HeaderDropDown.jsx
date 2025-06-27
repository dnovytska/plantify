import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const MENU_HEIGHT = 420; // Ajustei a altura para caber todos os itens confortavelmente

export default function HeaderDropdown() {
  const [visible, setVisible] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  // Valor animado para o slide-down
  const slideAnim = useState(new Animated.Value(-MENU_HEIGHT))[0];

  // Animação ao abrir/fechar
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -MENU_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  // Função para navegar e fechar o menu
  const handleNavigate = (screen) => {
    setVisible(false);
    navigation.navigate(screen);
  };

  // Função para logout com confirmação
  const handleLogout = () => {
    Alert.alert(
      'Confirmar Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: () => {
            setVisible(false);
            logout();
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <>
      {/* Trigger do menu */}
      <TouchableOpacity
        onPress={() => setVisible((v) => !v)}
        style={styles.trigger}
        accessibilityLabel="Abrir menu de navegação"
      >
        <Text style={styles.username}>{user?.name || 'utilizador'}</Text>
        <Text style={styles.arrow}>{visible ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Modal para o menu */}
      <Modal visible={visible} transparent animationType="none">
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
          accessibilityLabel="Fechar menu"
        >
          {/* Impede que o clique no menu feche o modal */}
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
            onStartShouldSetResponder={() => true} // Evita que o Pressable externo feche ao clicar no menu
          >
            {/* Removido o título do menu */}
            <TouchableOpacity onPress={() => handleNavigate('YourPlants')} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/many-plants.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Suas Plantas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('Settings')} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/gear.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('EditProfile')} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/man.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('AddPlant')} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/plant.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Adicionar Planta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('PlantIdentification')} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/camera.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Identificar Planta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.menuItemContainer}>
              <Image source={require('../../assets/images/home.png')} style={styles.menuIcon} />
              <Text style={styles.menuItem}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  username: {
    fontSize: 18, // Aumentado o tamanho do texto
    color: '#2F2182', 
    fontWeight: 'bold',
  },
  arrow: {
    marginLeft: 5,
    fontSize: 12,
    color: '#2F2182',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo semi-transparente
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: MENU_HEIGHT,
    backgroundColor: '#50B498',
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  menuItem: {
    fontSize: 18, // Aumentado o tamanho do texto
    color: '#fff',
  },
});
