import * as SQLite from 'expo-sqlite';

// Função para inicializar o banco de dados e criar as tabelas
export const initializeDatabase = async (database) => {
  try {
    await database.execAsync('PRAGMA foreign_keys = ON;');
    console.log('Chaves estrangeiras habilitadas');

    // Tabela users
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        iduser INTEGER,
        username TEXT,
        email TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME NOT NULL,
        profile_image TEXT,
        password TEXT NOT NULL,
        PRIMARY KEY(iduser AUTOINCREMENT)
      );
    `);
    console.log('Tabela users criada ou já existe');

    // Tabela watering_levels
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS watering_levels (
        id INTEGER,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        PRIMARY KEY(id AUTOINCREMENT)
      );
    `);
    console.log('Tabela watering_levels criada ou já existe');

    // Tabela sunlight_levels
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS sunlight_levels (
        id INTEGER,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        PRIMARY KEY(id AUTOINCREMENT)
      );
    `);
    console.log('Tabela sunlight_levels criada ou já existe');

    // Tabela growth_rates
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS growth_rates (
        id INTEGER,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        PRIMARY KEY(id AUTOINCREMENT)
      );
    `);
    console.log('Tabela growth_rates criada ou já existe');

    // Tabela care_levels
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS care_levels (
        id INTEGER,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        PRIMARY KEY(id AUTOINCREMENT)
      );
    `);
    console.log('Tabela care_levels criada ou já existe');

    // Tabela plant_types (atualizada com chaves estrangeiras)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS plant_types (
        idplant_type INTEGER,
        name TEXT NOT NULL,
        watering_id INTEGER,
        sunlight_id INTEGER,
        growth_rate_id INTEGER,
        care_level_id INTEGER,
        PRIMARY KEY(idplant_type AUTOINCREMENT),
        FOREIGN KEY(watering_id) REFERENCES watering_levels(id),
        FOREIGN KEY(sunlight_id) REFERENCES sunlight_levels(id),
        FOREIGN KEY(growth_rate_id) REFERENCES growth_rates(id),
        FOREIGN KEY(care_level_id) REFERENCES care_levels(id)
      );
    `);
    console.log('Tabela plant_types criada ou já existe');

    // Tabela plants
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS plants (
        idplant INTEGER,
        name TEXT NOT NULL,
        image BLOB NOT NULL,
        plant_types_idplant_type INTEGER NOT NULL,
        PRIMARY KEY(idplant AUTOINCREMENT),
        FOREIGN KEY(plant_types_idplant_type) REFERENCES plant_types(idplant_type)
      );
    `);
    console.log('Tabela plants criada ou já existe');

    // Tabela plants_acc
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS plants_acc (
        idplant_acc INTEGER,
        name TEXT NOT NULL,
        creation_date DATETIME NOT NULL,
        description TEXT,
        image BLOB,
        users_iduser INTEGER NOT NULL,
        plants_idplant INTEGER NOT NULL,
        PRIMARY KEY(idplant_acc AUTOINCREMENT),
        FOREIGN KEY(plants_idplant) REFERENCES plants(idplant),
        FOREIGN KEY(users_iduser) REFERENCES users(iduser)
      );
    `);
    console.log('Tabela plants_acc criada ou já existe');

    // Preencher as tabelas de níveis com valores iniciais (se ainda não existirem)
    await database.runAsync('INSERT OR IGNORE INTO watering_levels (name, description) VALUES (?, ?)', ['Low', 'Regar a cada 2 semanas']);
    await database.runAsync('INSERT OR IGNORE INTO watering_levels (name, description) VALUES (?, ?)', ['Moderate', 'Regar semanalmente']);
    await database.runAsync('INSERT OR IGNORE INTO watering_levels (name, description) VALUES (?, ?)', ['Regular', 'Regar a cada 2-3 dias']);

    await database.runAsync('INSERT OR IGNORE INTO sunlight_levels (name, description) VALUES (?, ?)', ['Full Sun', 'Pelo menos 6 horas de sol direto por dia']);
    await database.runAsync('INSERT OR IGNORE INTO sunlight_levels (name, description) VALUES (?, ?)', ['Partial Sun', '3-6 horas de sol por dia']);
    await database.runAsync('INSERT OR IGNORE INTO sunlight_levels (name, description) VALUES (?, ?)', ['Shade', 'Menos de 3 horas de sol direto por dia']);

    await database.runAsync('INSERT OR IGNORE INTO growth_rates (name, description) VALUES (?, ?)', ['Slow', 'Cresce menos de 30 cm por ano']);
    await database.runAsync('INSERT OR IGNORE INTO growth_rates (name, description) VALUES (?, ?)', ['Medium', 'Cresce entre 30-60 cm por ano']);
    await database.runAsync('INSERT OR IGNORE INTO growth_rates (name, description) VALUES (?, ?)', ['Fast', 'Cresce mais de 60 cm por ano']);

    await database.runAsync('INSERT OR IGNORE INTO care_levels (name, description) VALUES (?, ?)', ['Easy', 'Requer pouca manutenção']);
    await database.runAsync('INSERT OR IGNORE INTO care_levels (name, description) VALUES (?, ?)', ['Moderate', 'Requer cuidados regulares']);
    await database.runAsync('INSERT OR IGNORE INTO care_levels (name, description) VALUES (?, ?)', ['High', 'Requer cuidados frequentes e específicos']);
    console.log('Valores iniciais inseridos nas tabelas de níveis');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
};

// Função para abrir o banco de dados
export const openDatabase = async () => {
  try {
    const database = await SQLite.openDatabaseAsync('plantify.db', {
      useNewConnection: true,
    });
    console.log('Banco de dados aberto:', database);
    return database;
  } catch (error) {
    console.error('Erro ao abrir o banco de dados:', error);
    throw error;
  }
};