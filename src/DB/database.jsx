import * as FileSystem from 'expo-file-system';
import { openDatabase as expoOpenDatabase } from 'expo-sqlite';
import { Asset } from 'expo-asset';

const dbName = 'plantify.db';
const dbFileUri = FileSystem.documentDirectory + dbName;

export async function openDatabase() {
  try {
    const dbInfo = await FileSystem.getInfoAsync(dbFileUri);

    if (!dbInfo.exists) {
      console.log('📦 Copiando banco de dados para o diretório do app...');
      const asset = Asset.fromModule(require('./plantify.db'));
      await asset.downloadAsync();

      await FileSystem.copyAsync({
        from: asset.localUri,
        to: dbFileUri,
      });
    } else {
      console.log('✅ Banco de dados já existe.');
    }

    const db = expoOpenDatabase(dbName); // <- Agora vai funcionar!
    return db;
  } catch (error) {
    console.error('❌ Erro ao abrir ou criar o banco de dados:', error);
    throw error;
  }
}
