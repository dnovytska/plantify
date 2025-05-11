// src/DB/database.js
import * as SQLite from 'expo-sqlite';

/**
 * Abre (ou cria) o banco de dados 'plantify.db' e retorna a instância SQLiteDatabase.
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function openDatabase() {
  // openDatabaseAsync retorna uma Promise<SQLiteDatabase>
  const db = await SQLite.openDatabaseAsync('plantify.db');
  return db;
}

/**
 * Retorna o primeiro registro de uma consulta SQL ou null se não houver.
 * @param {string} sql    A string SQL, ex: 'SELECT * FROM users WHERE email = ? LIMIT 1'
 * @param {Array=} params Parâmetros para os placeholders '?' na SQL
 * @returns {Promise<Object|null>}
 */
export async function getFirstAsync(sql, params = []) {
  const db = await openDatabase();
  const row = await db.getFirstAsync(sql, Array.isArray(params) ? params : [params]);
  // getFirstAsync já retorna undefined se não houver, convertendo para null
  return row ?? null;
}

/**
 * Retorna todos os registros de uma consulta SQL como array (pode ser vazio).
 * @param {string} sql    A string SQL, ex: 'SELECT * FROM users'
 * @param {Array=} params Parâmetros para os placeholders '?' na SQL
 * @returns {Promise<Array<Object>>}
 */
export async function getAllAsync(sql, params = []) {
  const db = await openDatabase();
  const rows = await db.getAllAsync(sql, Array.isArray(params) ? params : [params]);
  return rows;
}

/**
 * Executa um comando SQL que não retorna linhas (INSERT, UPDATE, DELETE).
 * @param {string} sql    Comando SQL
 * @param {Array=} params Parâmetros para os placeholders '?' na SQL
 * @returns {Promise<void>}
 */
export async function runAsync(sql, params = []) {
  const db = await openDatabase();
  await db.runAsync(sql, Array.isArray(params) ? params : [params]);
}

/**
 * Executa um batch de comandos SQL.
 * @param {string[]} sqlStatements Lista de comandos SQL
 * @param {Array<Array>=} paramsList Lista de arrays de parâmetros para cada comando
 * @returns {Promise<void>}
 */
export async function execAsync(sqlStatements, paramsList = []) {
  const db = await openDatabase();
  await db.execAsync(sqlStatements, paramsList);
}
