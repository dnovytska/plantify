import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'main.db', location: 'default' },
  () => console.log('Database connected'),
  error => console.log('Database error', error)
);

const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
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

export { db, initializeDatabase };