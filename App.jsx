import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from './src/components/Header';
import ButtonFirst from './src/components/buttonFirst';

export default function App() {
  
  const handleBackPress = () => {
    console.log('Botão de voltar pressionado!');
  };
  return (
    <View>
      <Header 
        title="Plantify" 
        onBackPress={handleBackPress} 
        showBackButton={true} 
      />
        <ButtonFirst name="Clique Aqui" />
      {/* Conteúdo da página */}
    </View>
  );
}
