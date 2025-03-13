// DatabaseService.js
import SQLite from 'react-native-sqlite-storage';

// Função para abrir o banco de dados
export const openDatabase = () => {
  const db = SQLite.openDatabase(
    {name: 'plantify.db', location: 'default'},
    () => {
      console.log('Banco de dados aberto com sucesso!');
    },
    error => {
      console.log('Erro ao abrir o banco de dados: ', error);
    }
  );
  return db;
};

// Função para criar a tabela de usuários
export const createUserTable = (db) => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT);',
      [],
      () => {
        console.log('Tabela de usuários criada com sucesso!');
      },
      (tx, error) => {
        console.log('Erro ao criar a tabela de usuários:', error);
      }
    );
  });
};
