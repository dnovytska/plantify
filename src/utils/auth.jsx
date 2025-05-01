// src/utils/auth.js
import * as Crypto from 'expo-crypto';

// Gera um hash unidirecional da senha
export async function hashPassword(plainText) {
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    plainText
  );
  return hashed;
}

// Verifica se uma senha em texto corresponde ao hash
export async function verifyPassword(plainText, hash) {
  const hashedPlainText = await hashPassword(plainText);
  return hashedPlainText === hash;
}
