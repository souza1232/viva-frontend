import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { updateProfile } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../theme';

const SYMPTOMS = [
  { key: 'fogachos', label: 'Fogachos', emoji: '🔥' },
  { key: 'insonia', label: 'Insônia', emoji: '🌙' },
  { key: 'ansiedade', label: 'Ansiedade', emoji: '💭' },
  { key: 'fadiga', label: 'Fadiga', emoji: '😴' },
  { key: 'humor', label: 'Alterações de humor', emoji: '🌊' },
  { key: 'peso', label: 'Alteração de peso', emoji: '⚖️' },
  { key: 'libido', label: 'Baixa libido', emoji: '💝' },
  { key: 'dores', label: 'Dores no corpo', emoji: '🦴' },
  { key: 'memoria', label: 'Lapsos de memória', emoji: '🧠' },
  { key: 'pele', label: 'Pele seca', emoji: '✨' },
];

const ROLES = [
  { key: 'empresaria', label: 'Empresária', emoji: '💼' },
  { key: 'mae', label: 'Mãe', emoji: '👩‍👧' },
  { key: 'esposa', label: 'Esposa/Companheira', emoji: '💕' },
  { key: 'todas', label: 'Tudo isso junto!', emoji: '🦋' },
];

const STEPS = ['welcome', 'symptoms', 'role', 'age'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuthStore();

  function toggleSymptom(key) {
    setSelectedSymptoms(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  }

  async function handleFinish() {
    setLoading(true);
    try {
      const { data } = await updateProfile({
        mainSymptoms: selectedSymptoms,
        mainRole: selectedRole || 'todas',
        age: age ? parseInt(age) : undefined,
        onboardingDone: true,
      });
      updateUser(data);
    } catch {
      Alert.alert('Ops!', 'Erro ao salvar suas informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const currentStep = STEPS[step];

  return (
    <LinearGradient colors={['#FDF6F8', '#F0E6F5']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Indicador de progresso */}
        <View style={styles.progressBar}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        {currentStep === 'welcome' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🌸</Text>
            <Text style={styles.title}>Olá, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.description}>
              Eu sou a Viva, sua companheira nessa fase tão importante da vida.{'\n\n'}
              Vou te acompanhar com carinho, sem julgamento, 24 horas por dia.{'\n\n'}
              Antes de começar, me conta um pouco sobre você.
            </Text>
          </View>
        )}

        {currentStep === 'symptoms' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>💭</Text>
            <Text style={styles.title}>Quais sintomas você sente?</Text>
            <Text style={styles.subtitle}>Selecione todos que se aplicam</Text>
            <View style={styles.grid}>
              {SYMPTOMS.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.chip, selectedSymptoms.includes(s.key) && styles.chipSelected]}
                  onPress={() => toggleSymptom(s.key)}
                >
                  <Text style={styles.chipEmoji}>{s.emoji}</Text>
                  <Text style={[styles.chipLabel, selectedSymptoms.includes(s.key) && styles.chipLabelSelected]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 'role' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.title}>Qual o seu papel principal?</Text>
            <Text style={styles.subtitle}>Como você se identifica?</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, selectedRole === r.key && styles.roleCardSelected]}
                  onPress={() => setSelectedRole(r.key)}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, selectedRole === r.key && styles.roleLabelSelected]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 'age' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🎂</Text>
            <Text style={styles.title}>Quantos anos você tem?</Text>
            <Text style={styles.subtitle}>Para personalizar ainda mais minha ajuda</Text>
            <TextInput
              style={styles.ageInput}
              placeholder="Ex: 52"
              placeholderTextColor={COLORS.textLight}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        )}

        <View style={styles.buttons}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backBtnText}>Voltar</Text>
            </TouchableOpacity>
          )}

          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(s => s + 1)}>
              <Text style={styles.nextBtnText}>
                {step === 0 ? 'Vamos começar!' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.btnDisabled]}
              onPress={handleFinish}
              disabled={loading}
            >
              <Text style={styles.nextBtnText}>{loading ? 'Salvando...' : 'Conhecer a Viva! 🌸'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingTop: 60 },
  progressBar: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: SPACING.xl },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary, width: 24 },
  stepContainer: { flex: 1, alignItems: 'center', paddingBottom: SPACING.xl },
  emoji: { fontSize: 56, marginBottom: SPACING.md },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 10 },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: 16 },
  chipLabel: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  chipLabelSelected: { color: COLORS.white },
  roleGrid: { width: '100%', gap: 12 },
  roleCard: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: 16 },
  roleCardSelected: { backgroundColor: '#FFF0F5', borderColor: COLORS.primary },
  roleEmoji: { fontSize: 32 },
  roleLabel: { fontSize: 17, color: COLORS.text, fontWeight: '600' },
  roleLabelSelected: { color: COLORS.primary },
  ageInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 32, textAlign: 'center', width: 140, color: COLORS.text, backgroundColor: COLORS.white },
  buttons: { flexDirection: 'row', gap: 12, paddingBottom: SPACING.xl },
  backBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center' },
  backBtnText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  nextBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  nextBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
