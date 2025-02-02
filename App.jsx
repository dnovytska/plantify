import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from './src/components/Header'; 


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
      {/* Conteúdo da página */}
    </View>
  );
}
