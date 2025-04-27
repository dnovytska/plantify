import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

// Verifica se a API assíncrona existe
console.log('openDatabaseAsync:', typeof SQLite.openDatabaseAsync);

const dbName = 'plantify.db';
const dbAssetPath = require('./plantify.db');
const dbFileUri = FileSystem.documentDirectory + dbName;

function logError(context, error) {
  console.error(`❌ [${context}]`, error);
}

/**
 * Abre (ou copia) e retorna a instância da base de dados usando a nova API assíncrona
 */
export async function openDatabase() {
  try {
    const dbInfo = await FileSystem.getInfoAsync(dbFileUri);
    if (!dbInfo.exists) {
      console.log('📦 Copiando base de dados...');
      const asset = Asset.fromModule(dbAssetPath);
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      await FileSystem.copyAsync({ from: asset.localUri, to: dbFileUri });
      console.log('✅ Base de dados copiada.');
    } else {
      console.log('✅ Base de dados já existe.');
    }

    // Abre a base de dados usando a nova API assíncrona
    const db = await SQLite.openDatabaseAsync(dbName);
    return db;
  } catch (error) {
    logError('openDatabase', error);
    throw error;
  }
}

/**
 * Retorna todos os registos da tabela users
 */
export async function getAllUsers() {
  try {
    const db = await openDatabase();
    const rows = await db.getAllAsync(`SELECT * FROM users;`);
    console.log('👥 Users in DB:', rows);
    return rows;
  } catch (error) {
    logError('getAllUsers', error);
    throw error;
  }
}

/**
 * Testa se há dados na tabela users e exibe contagem
 */
export async function testDatabase() {
  try {
    const users = await getAllUsers();
    console.log(`📊 Total de utilizadores: ${users.length}`);
  } catch (error) {
    logError('testDatabase', error);
  }
}
