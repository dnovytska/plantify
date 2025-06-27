
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sobre a Aplicação</Text>

      <Text style={styles.description}>
        Esta aplicação foi desenvolvida para o ajudar a cuidar das suas plantas de forma prática e eficiente.
        Com funcionalidades que permitem a gestão de tarefas, identificação de plantas e monitorização de doenças,
        o nosso objetivo é facilitar a vida de todos os amantes de jardinagem e botânica.
      </Text>
      <Text style={styles.description}>
        Acreditamos que qualquer pessoa pode ter um espaço verde na sua vida, e esta aplicação é uma ferramenta
        para tornar isso possível. Quer seja um jardineiro experiente ou um principiante, a nossa aplicação oferece
        recursos que respondem a todas as suas necessidades.
      </Text>
      <Text style={styles.version}>
        Versão: 1.0.0
      </Text>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#468585',
    marginBottom: 10,
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#2F2182',
    marginBottom: 10,
    lineHeight: 24,
  },
  version: {
    fontSize: 16,
    color: '#468585',
    textAlign: 'center',
    marginTop: 20,
  },
});
