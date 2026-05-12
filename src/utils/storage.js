import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Camada unificada de storage:
// - Web: usa localStorage (não tem SecureStore no browser)
// - Nativo (Android/iOS): usa SecureStore (criptografado)

export async function setItem(key, value) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch {}
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getItem(key) {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

export async function removeItem(key) {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch {}
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
