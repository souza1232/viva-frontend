import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Atenção', 'Digite um telefone válido com DDD.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password });
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Ops!', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🌸 Viva</Text>
            <Text style={styles.subtitle}>7 dias grátis para experimentar</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Criar minha conta</Text>

            <TextInput
              style={styles.input}
              placeholder="Como você se chama?"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Seu email"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="WhatsApp com DDD (ex: 11 99999-9999)"
              placeholderTextColor={COLORS.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha (mínimo 8 caracteres)"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.trialBanner}>
              <Text style={styles.trialText}>🎉 Experimente grátis • R$37,90/mês • Cancele quando quiser</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Começar gratuitamente'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkBtn}>
              <Text style={styles.linkText}>Já tenho conta. <Text style={styles.linkBold}>Entrar</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 48, marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: '#C96A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 16, color: COLORS.text, marginBottom: SPACING.md, backgroundColor: COLORS.background },
  trialBanner: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  trialText: { color: COLORS.primary, fontSize: 13, textAlign: 'center', fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  linkBtn: { marginTop: SPACING.lg, alignItems: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 15 },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});
