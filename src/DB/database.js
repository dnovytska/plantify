import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('plantify.db');

// Criar a tabela se não existir
export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE "diseases" (
        "iddisease"	INTEGER,
        "name"	TEXT NOT NULL,
        "description"	TEXT,
        PRIMARY KEY("iddisease" AUTOINCREMENT)
        );`
    );

    tx.executeSql(
        `CREATE TABLE IF NOT EXIST "diseases_plants" (
          "iddisease"	INTEGER NOT NULL,
          "idplant"	INTEGER NOT NULL,
          PRIMARY KEY("iddisease","idplant"),
          FOREIGN KEY("iddisease") REFERENCES "diseases"("iddisease"),
          FOREIGN KEY("idplant") REFERENCES "plants"("idplant")
         );`
      ); 
    tx.executeSql(
        `CREATE TABLE "diseases_plants_acc" (
        "iddisease"	INTEGER NOT NULL,
        "idplant_acc"	INTEGER NOT NULL,
        PRIMARY KEY("iddisease","idplant_acc"),
        FOREIGN KEY("iddisease") REFERENCES "diseases"("iddisease"),
        FOREIGN KEY("idplant_acc") REFERENCES "plants_acc"("idplant_acc")
        );`
      );    
      tx.executeSql(
        `CREATE TABLE "notifications" (
        "idnotification"	INTEGER,
        "type"	TEXT NOT NULL,
        "message"	TEXT,
        "time"	DATETIME NOT NULL,
        "status"	INTEGER NOT NULL,
        "users_plants_idusers_plant"	INTEGER NOT NULL,
        PRIMARY KEY("idnotification" AUTOINCREMENT),
        FOREIGN KEY("users_plants_idusers_plant") REFERENCES "plants_acc"("idplant_acc")
        );`
      );     
      tx.executeSql(
        `CREATE TABLE "plant_types" (
        "idplant_type"	INTEGER,
        "name"	TEXT NOT NULL,
        PRIMARY KEY("idplant_type" AUTOINCREMENT)
        );`
      );   
      tx.executeSql(
        `CREATE TABLE "plants" (
        "idplant"	INTEGER,
        "name"	TEXT NOT NULL,
        "image"	BLOB NOT NULL,
        "plant_types_idplant_type"	INTEGER NOT NULL,
        PRIMARY KEY("idplant" AUTOINCREMENT),
        FOREIGN KEY("plant_types_idplant_type") REFERENCES "plant_types"("idplant_type")
        );`
      );   
      tx.executeSql(
        `CREATE TABLE "plants_acc" (
        "idplant_acc"	INTEGER,
        "name"	TEXT NOT NULL,
        "creation_date"	DATETIME NOT NULL,
        "description"	TEXT,
        "image"	BLOB,
        "users_iduser"	INTEGER NOT NULL,
        "plants_idplant"	INTEGER NOT NULL,
        PRIMARY KEY("idplant_acc" AUTOINCREMENT),
        FOREIGN KEY("plants_idplant") REFERENCES "plants"("idplant"),
        FOREIGN KEY("users_iduser") REFERENCES "users"("iduser")
        );`
      ); 
      tx.executeSql(
        `CREATE TABLE "users" (
        "iduser"	INTEGER,
        "username"	TEXT NOT NULL,
        "email"	TEXT NOT NULL,
        "full_name"	TEXT,
        "created_at"	DATETIME NOT NULL,
        "profile_image"	TEXT,
        "password"	TEXT NOT NULL,
        PRIMARY KEY("iduser" AUTOINCREMENT)
        );`
      );
  });
};

export const addUser = (name, email, password, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?);',
        [name, email, password],
        (_, result) => callback(result),
        (_, error) => console.log('Erro ao inserir usuário:', error)
      );
    });
  };

  export const getUser = (email, password, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ? AND password = ?;',
        [email, password],
        (_, { rows }) => callback(rows._array),
        (_, error) => console.log('Erro ao buscar usuário:', error)
      );
    });
  };
  
  export const addPlant = (name, species, lastWatered, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO plants (name, species, lastWatered) VALUES (?, ?, ?);',
        [name, species, lastWatered],
        (_, result) => callback(result),
        (_, error) => console.log('Erro ao adicionar planta:', error)
      );
    });
  };

  export const getPlants = callback => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM plants;',
        [],
        (_, { rows }) => callback(rows._array),
        (_, error) => console.log('Erro ao buscar plantas:', error)
      );
    });
  };
  

export default db;
