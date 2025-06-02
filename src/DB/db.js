import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('plantify.db', {
      useNewConnection: true,
    });
    console.log('Database opened successfully in db.js:', db);
    return db;
  } catch (error) {
    console.error('Error opening database in db.js:', error);
    throw error;
  }
};

export const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS plant_types (
        idplant_type INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        watering_id INTEGER,
        sunlight_id INTEGER,
        growth_rate_id INTEGER,
        care_level_id INTEGER
      );
      CREATE TABLE IF NOT EXISTS watering_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sunlight_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS growth_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS care_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS plants (
        idplant INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        plant_types_idplant_type INTEGER,
        FOREIGN KEY (plant_types_idplant_type) REFERENCES plant_types(idplant_type)
      );
      CREATE TABLE IF NOT EXISTS plants_acc (
        idplants_acc INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        creation_date TEXT NOT NULL,
        description TEXT,
        image TEXT,
        users_iduser INTEGER,
        plants_idplant INTEGER,
        FOREIGN KEY (users_iduser) REFERENCES users(iduser),
        FOREIGN KEY (plants_idplant) REFERENCES plants(idplant)
      );
      CREATE TABLE IF NOT EXISTS users (
        iduser INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        full_name TEXT,
        email TEXT UNIQUE,
        password TEXT
      );
    `);

    // Inserir dados iniciais para as tabelas de níveis
    await db.runAsync('INSERT OR IGNORE INTO watering_levels (name) VALUES (?);', ['Low']);
    await db.runAsync('INSERT OR IGNORE INTO watering_levels (name) VALUES (?);', ['Moderate']);
    await db.runAsync('INSERT OR IGNORE INTO watering_levels (name) VALUES (?);', ['Regular']);
    await db.runAsync('INSERT OR IGNORE INTO sunlight_levels (name) VALUES (?);', ['Full Sun']);
    await db.runAsync('INSERT OR IGNORE INTO sunlight_levels (name) VALUES (?);', ['Partial Sun']);
    await db.runAsync('INSERT OR IGNORE INTO sunlight_levels (name) VALUES (?);', ['Shade']);
    await db.runAsync('INSERT OR IGNORE INTO growth_rates (name) VALUES (?);', ['Slow']);
    await db.runAsync('INSERT OR IGNORE INTO growth_rates (name) VALUES (?);', ['Medium']);
    await db.runAsync('INSERT OR IGNORE INTO growth_rates (name) VALUES (?);', ['Fast']);
    await db.runAsync('INSERT OR IGNORE INTO care_levels (name) VALUES (?);', ['Easy']);
    await db.runAsync('INSERT OR IGNORE INTO care_levels (name) VALUES (?);', ['Moderate']);
    await db.runAsync('INSERT OR IGNORE INTO care_levels (name) VALUES (?);', ['High']);
    
    console.log('Database initialized successfully in db.js');
  } catch (error) {
    console.error('Error initializing database in db.js:', error);
    throw error;
  }
};