// SignUp.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { openDatabase, createUserTable } from './DatabaseService';  // Importe as funções que criamos

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const db = openDatabase();  // Abre o banco de dados
    createUserTable(db);  // Cria a tabela de usuários, se necessário

    return () => {
      db.close();  // Fecha o banco de dados quando o componente for desmontado
    };
  }, []);

  // Função para registrar o usuário no banco de dados
  const handleSignUp = () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios!');
      return;
    }

    const db = openDatabase();

    // Verificar se o e-mail já está cadastrado
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ?;',
        [email],
        (tx, results) => {
          if (results.rows.length > 0) {
            Alert.alert('Erro', 'Este e-mail já está cadastrado.');
          } else {
            // Inserir o novo usuário
            tx.executeSql(
              'INSERT INTO users (name, email, password) VALUES (?, ?, ?);',
              [name, email, password],
              () => {
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
                setName('');
                setEmail('');
                setPassword('');
              },
              (tx, error) => {
                console.log('Erro ao inserir o usuário:', error);
                Alert.alert('Erro', 'Falha ao registrar usuário!');
              }
            );
          }
        },
        (tx, error) => {
          console.log('Erro ao consultar o banco:', error);
        }
      );
    });
  };

  return (
    <View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome"
        style={{borderWidth: 1, padding: 10, margin: 10}}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="E-mail"
        keyboardType="email-address"
        style={{borderWidth: 1, padding: 10, margin: 10}}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Senha"
        secureTextEntry
        style={{borderWidth: 1, padding: 10, margin: 10}}
      />
      <Button title="Registrar" onPress={handleSignUp} />
    </View>
  );
};

export default SignUp;
