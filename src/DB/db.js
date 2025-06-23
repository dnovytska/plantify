import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('plantifydb.db', {
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
      CREATE TABLE IF NOT EXISTS users (
        iduser INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        name TEXT,
        created_at datetime NOT NULL,
        password TEXT,
        profile_image TEXT
      );
      CREATE TABLE IF NOT EXISTS care_levels (
        idcare_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS growth_rates (
        idgrowth_rate INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sunlight_levels (
        idsunlight_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS watering_levels (
        idwatering_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS plant_types (
        idplant_type INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        watering_id INTEGER,
        sunlight_id INTEGER,
        growth_rate_id INTEGER,
        care_level_id INTEGER,
        FOREIGN KEY (watering_id) REFERENCES watering_levels(idwatering_level),
        FOREIGN KEY (sunlight_id) REFERENCES sunlight_levels(idsunlight_level),
        FOREIGN KEY (growth_rate_id) REFERENCES growth_rates(idgrowth_rate),
        FOREIGN KEY (care_level_id) REFERENCES care_levels(idcare_level)
      );
      CREATE TABLE IF NOT EXISTS plants (
        idplant INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        plant_type_id INTEGER,
        FOREIGN KEY (plant_type_id) REFERENCES plant_types(idplant_type)
      );
      CREATE TABLE IF NOT EXISTS plants_acc (
        idplants_acc INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        creation_date TEXT NOT NULL,
        description TEXT,
        image TEXT,
        iduser INTEGER,
        idplant INTEGER,
        FOREIGN KEY (iduser) REFERENCES users(iduser),
        FOREIGN KEY (idplant) REFERENCES plants(idplant)
      );
      CREATE TABLE IF NOT EXISTS diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS diseases_plants_acc (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plants_acc_id INTEGER,
        disease_id INTEGER,
        FOREIGN KEY (plants_acc_id) REFERENCES plants_acc(idplants_acc),
        FOREIGN KEY (disease_id) REFERENCES diseases(id)
      );
      CREATE TABLE IF NOT EXISTS notification_types (
        idnotification_type INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_type TEXT
      );
      CREATE TABLE IF NOT EXISTS notifications (
        idnotification INTEGER PRIMARY KEY AUTOINCREMENT,
        idplants_acc INTEGER,
        message TEXT NOT NULL,
        due_date TEXT,
        is_read INTEGER DEFAULT 0,
        id_notification_type INTEGER,
        FOREIGN KEY (idplants_acc) REFERENCES plants_acc(idplants_acc),
        FOREIGN KEY (id_notification_type) REFERENCES notification_types(idnotification_type)
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

    // Inserir dados iniciais para notification_types
    await db.runAsync('INSERT OR IGNORE INTO notification_types (notification_type) VALUES (?);', ['Única']);
    await db.runAsync('INSERT OR IGNORE INTO notification_types (notification_type) VALUES (?);', ['Diária']);
    await db.runAsync('INSERT OR IGNORE INTO notification_types (notification_type) VALUES (?);', ['Semanal']);
    await db.runAsync('INSERT OR IGNORE INTO notification_types (notification_type) VALUES (?);', ['Mensal']);

    console.log('Database initialized successfully in db.js');
  } catch (error) {
    console.error('Error initializing database in db.js:', error);
    throw error;
  }
};