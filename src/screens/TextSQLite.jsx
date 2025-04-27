import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function TestSQLite() {
  useEffect(() => {
    try {
      const db = SQLite.openDatabase('test.db');
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);',
          [],
          () => console.log('✅ Tabela criada com sucesso!'),
          (_, error) => {
            console.error('❌ Erro ao criar tabela:', error);
            return false;
          }
        );
      });
    } catch (err) {
      console.error('❌ Erro geral:', err);
    }
  }, []);

  return (
    <View>
      <Text>Testando SQLite...</Text>
    </View>
  );
}
