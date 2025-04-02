import { db } from '../database/database';

const register = (email, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, password],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const login = (email, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            reject(new Error('Credenciais inválidas'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export { register, login };