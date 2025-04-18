import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

const dbName = 'plantify.db';
const dbFileUri = FileSystem.documentDirectory + dbName;

export async function openDatabase() {
  try {
    const dbInfo = await FileSystem.getInfoAsync(dbFileUri);

    if (!dbInfo.exists) {
      console.log('Copiando banco de dados...');
      const asset = Asset.fromModule(require('./plantify.db'));
      await asset.downloadAsync();

      if (!asset.localUri) throw new Error('asset.localUri está vazio!');

      await FileSystem.copyAsync({
        from: asset.localUri,
        to: dbFileUri,
      });

      console.log('Banco copiado com sucesso!');
    } else {
      console.log('Banco já existe.');
    }

    // Abre o banco usando caminho completo
    const db = SQLite.openDatabase(dbFileUri);

    // Teste: mostra as tabelas do banco
    db.transaction(tx => {
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table';",
        [],
        (_, { rows }) => {
          console.log('Tabelas existentes no banco:', rows._array);
        },
        (_, error) => {
          console.error('Erro ao listar tabelas:', error);
          return false;
        }
      );
    });

    return db;
  } catch (error) {
    console.error('Erro ao abrir ou copiar o banco:', error);
    throw error;
  }
}
