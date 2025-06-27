import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('plantifydb.db');
    if (!db) {
      throw new Error("Falha ao abrir o banco de dados: objeto db é null");
    }
    console.log("Banco de dados aberto com sucesso!");
    return db;
  } catch (error) {
    console.error("Erro ao abrir banco de dados:", error);
    Alert.alert("Erro", "Falha ao inicializar o banco de dados SQLite: " + error.message);
    throw error;
  }
};

export const initializeDatabase = async (db) => {
  if (!db) {
    throw new Error("Objeto de banco de dados inválido");
  }

  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    console.log("PRAGMA foreign_keys ativado");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        iduser INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at datetime,
        profile_image TEXT
      );
    `);
    console.log("Tabela users criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS care_levels (
        idcare_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);
    console.log("Tabela care_levels criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS growth_rates (
        idgrowth_rate INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);
    console.log("Tabela growth_rates criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sunlight_levels (
        idsunlight_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);
    console.log("Tabela sunlight_levels criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS watering_levels (
        idwatering_level INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);
    console.log("Tabela watering_levels criada ou já existe");

    await db.execAsync(`
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
    `);
    console.log("Tabela plant_types criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS plants (
        idplant INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        plant_type_id INTEGER,
        FOREIGN KEY (plant_type_id) REFERENCES plant_types(idplant_type)
      );
    `);
    console.log("Tabela plants criada ou já existe");

    await db.execAsync(`
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
    `);
    console.log("Tabela plants_acc criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );
    `);
    console.log("Tabela diseases criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS diseases_plants_acc (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plants_acc_id INTEGER,
        disease_id INTEGER,
        is_treated INTEGER DEFAULT 0,
        FOREIGN KEY (plants_acc_id) REFERENCES plants_acc(idplants_acc),
        FOREIGN KEY (disease_id) REFERENCES diseases(id)
      );
    `);
    console.log("Tabela diseases_plants_acc criada ou já existe");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notification_types (
        idnotification_type INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_type TEXT
      );
    `);
    console.log("Tabela notification_types criada ou já existe");

    await db.execAsync(`
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
    console.log("Tabela notifications criada ou já existe");

    console.log("Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    Alert.alert("Erro", "Falha ao inicializar o banco de dados: " + error.message);
    throw error;
  }
};