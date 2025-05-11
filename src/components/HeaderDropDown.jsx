// src/components/HeaderDropdown.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const MENU_HEIGHT = 200;  // altura fixa do menu (ajuste conforme necessário)

export default function HeaderDropdown() {
  const [visible, setVisible] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  // Valor animado para o slide-down
  const slideAnim = useState(new Animated.Value(-MENU_HEIGHT))[0];

  // Ao abrir/fechar, animar
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -MENU_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleNavigate = (screen) => {
    setVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      {/* Trigger sempre visível na header */}
      <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.trigger}>
        <Text style={styles.username}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.arrow}>{visible ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none">
        {/* Menu deslizando do topo */}
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={() => handleNavigate('Home')}>
            <Text style={styles.menuItem}>Página Inicial</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate('YourPlants')}>
            <Text style={styles.menuItem}>Suas Plantas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate('Settings')}>
            <Text style={styles.menuItem}>Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate('EditProfile')}>
            <Text style={styles.menuItem}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setVisible(false); logout(); }}>
            <Text style={styles.menuItem}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Área clicável **ABAIXO** do menu para fechar */}
        <Pressable
          style={styles.closeArea}
          onPress={() => setVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  username: {
    fontSize: 16,
    color: '#000',
  },
  arrow: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: MENU_HEIGHT,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    // sombras/elevação
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
  closeArea: {
    flex: 1,
    marginTop: MENU_HEIGHT,    // começa logo abaixo do menu
  },
});
