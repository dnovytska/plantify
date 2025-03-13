import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Title = ({ children }) => {
  return <Text style={styles.title}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    color: '#468585',
    textAlign: 'center',
    fontFamily: 'M PLUS 1',
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 50, // Ajustável para melhor espaçamento
  },
});

export default Title;
