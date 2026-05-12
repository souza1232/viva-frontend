import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveCheckin, getTodayCheckin, getCheckins, getSymptomInsights } from '../services/api';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';
import useSubscription from '../hooks/useSubscription';

const MOODS = ['😣', '😔', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Péssima', 'Mal', 'Ok', 'Bem', 'Ótima'];
const MOOD_COLORS = ['#D05555', '#E8A87C', '#B8B820', '#6BAE75', '#C96A8A'];

function ScaleSelector({ value, onChange, count = 5, color = COLORS.primary }) {
  return (
    <View style={scale.row}>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <TouchableOpacity
          key={n}
          style={[scale.dot, value >= n && { backgroundColor: color }]}
          onPress={() => onChange(n)}
        >
          <Text style={[scale.dotText, value >= n && scale.dotTextActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Counter({ value, onChange, min = 0, max = 20 }) {
  return (
    <View style={counter.row}>
      <TouchableOpacity
        style={counter.btn}
        onPress={() => onChange(Math.max(min, (value || 0) - 1))}
      >
        <Text style={counter.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={counter.value}>{value || 0}</Text>
      <TouchableOpacity
        style={counter.btn}
        onPress={() => onChange(Math.min(max, (value || 0) + 1))}
      >
        <Text style={counter.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryCard({ item }) {
  const moodEmoji = MOODS[(item.mood || 1) - 1];
  const date = new Date(item.date + 'T12:00:00');
  const label = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <View style={[hist.card, SHADOW.sm]}>
      <View style={hist.left}>
        <Text style={hist.emoji}>{moodEmoji}</Text>
        <View>
          <Text style={hist.date}>{label}</Text>
          <Text style={hist.detail}>
            {item.sleep ? `😴 ${item.sleep}/5` : ''}
            {item.energy ? `  ⚡ ${item.energy}/5` : ''}
            {item.hotFlashes != null ? `  🌡️ ${item.hotFlashes} fog.` : ''}
          </Text>
        </View>
      </View>
      {item.notes ? (
        <Text style={hist.notes} numberOfLines={1}>{item.notes}</Text>
      ) : null}
    </View>
  );
}

export default function SymptomTrackerScreen({ navigation }) {
  const { isPremium, loading: subLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState('registro'); // 'registro' | 'insights'
  const [saving, setSaving] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saved, setSaved] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [hotFlashes, setHotFlashes] = useState(0);
  const [painLevel, setPainLevel] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [todayRes, histRes] = await Promise.all([
        getTodayCheckin(),
        getCheckins(30),
      ]);
      const today = todayRes.data;
      if (today) {
        setTodayCheckin(today);
        setMood(today.mood);
        setEnergy(today.energy);
        setSleep(today.sleep);
        setHotFlashes(today.hotFlashes || 0);
        setPainLevel(today.painLevel);
        setNotes(today.notes || '');
        setSaved(true);
      }
      setHistory(histRes.data.filter(c => !today || c.date !== new Date().toISOString().split('T')[0]));
    } catch {
      // silencia
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadInsights() {
    if (insights) return;
    setLoadingInsights(true);
    try {
      const { data } = await getSymptomInsights();
      setInsights(data);
    } catch { /* silencia */ } finally {
      setLoadingInsights(false);
    }
  }

  function calcScore(c) {
    if (!c) return null;
    let num = 0, den = 0;
    if (c.mood)      { num += ((c.mood - 1) / 4) * 40; den += 40; }
    if (c.energy)    { num += ((c.energy - 1) / 4) * 25; den += 25; }
    if (c.sleep)     { num += ((c.sleep - 1) / 4) * 25; den += 25; }
    if (c.hotFlashes != null) { num += Math.max(0, 1 - c.hotFlashes / 12) * 10; den += 10; }
    return den === 0 ? null : Math.round((num / den) * 100);
  }

  async function handleSave() {
    if (!mood) {
      Alert.alert('Como você está?', 'Selecione seu humor antes de salvar.');
      return;
    }
    setSaving(true);
    try {
      const checkinData = {
        mood,
        energy: energy || undefined,
        sleep: sleep || undefined,
        hotFlashes,
        painLevel: painLevel || undefined,
        notes: notes.trim() || undefined,
      };
      await saveCheckin(checkinData);
      const score = calcScore({ mood, energy, sleep, hotFlashes });
      setSaved(true);
      setTodayCheckin(checkinData);
      const scoreMsg = score != null ? `\n\nSeu score de bem-estar: ${score}/100` : '';
      Alert.alert('Registrado! 💚', `Seu check-in de hoje foi salvo.${scoreMsg}`);
      load();
    } catch {
      Alert.alert('Ops!', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (!subLoading && !isPremium) {
    return (
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 52, marginBottom: 16 }}>📊</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A0A2E', textAlign: 'center', marginBottom: 10 }}>
          Rastreador de sintomas
        </Text>
        <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 23, marginBottom: 28 }}>
          Registre seus sintomas diários e receba insights de IA sobre seus padrões de saúde.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#C96A8A', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40 }}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>🔒 Desbloquear com Viva Pro</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Seus Sintomas 📊</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'registro' && styles.tabBtnActive]}
            onPress={() => setActiveTab('registro')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'registro' && styles.tabBtnTextActive]}>Registro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'insights' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('insights'); loadInsights(); }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'insights' && styles.tabBtnTextActive]}>Insights ✨</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'insights' && (
          loadingInsights ? (
            <View style={styles.insightsLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.insightsLoadingText}>A Viva está analisando seus padrões...</Text>
            </View>
          ) : !insights ? (
            <View style={[styles.card, SHADOW.sm]}>
              <Text style={styles.cardTitle}>Dados insuficientes</Text>
              <Text style={styles.cardSubtitle}>Registre pelo menos 5 dias para ver seus padrões de saúde.</Text>
            </View>
          ) : (
            <>
              <View style={[styles.card, SHADOW.md, { borderLeftWidth: 4, borderLeftColor: COLORS.primary }]}>
                <Text style={styles.cardTitle}>💡 Insight principal</Text>
                <Text style={styles.insightText}>{insights.topInsight}</Text>
              </View>
              <View style={[styles.card, SHADOW.sm]}>
                <Text style={styles.cardTitle}>✅ Seus melhores dias</Text>
                <Text style={styles.insightText}>{insights.bestDaysPattern}</Text>
              </View>
              <View style={[styles.card, SHADOW.sm]}>
                <Text style={styles.cardTitle}>⚠️ Dias mais difíceis</Text>
                <Text style={styles.insightText}>{insights.worstDaysPattern}</Text>
              </View>
              <View style={[styles.card, SHADOW.sm]}>
                <Text style={styles.cardTitle}>😴 Impacto do sono</Text>
                <Text style={styles.insightText}>{insights.sleepImpact}</Text>
              </View>
              {insights.recommendations?.length > 0 && (
                <View style={[styles.card, SHADOW.sm]}>
                  <Text style={styles.cardTitle}>🎯 Recomendações</Text>
                  {insights.recommendations.map((r, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{i + 1}.</Text>
                      <Text style={[styles.insightText, { flex: 1 }]}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )
        )}

        {activeTab === 'registro' && (
          <>
            {saved && (
              <View style={styles.savedBanner}>
                <Text style={styles.savedText}>✓ Check-in de hoje registrado</Text>
                <TouchableOpacity onPress={() => setSaved(false)}>
                  <Text style={styles.editLink}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.card, SHADOW.md]}>
              <Text style={styles.cardTitle}>Como você está hoje?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.moodBtn, mood === i + 1 && { backgroundColor: MOOD_COLORS[i] + '22', borderColor: MOOD_COLORS[i], borderWidth: 2 }]}
                    onPress={() => setMood(i + 1)}
                  >
                    <Text style={styles.moodEmoji}>{emoji}</Text>
                    <Text style={[styles.moodLabel, mood === i + 1 && { color: MOOD_COLORS[i], fontWeight: '700' }]}>
                      {MOOD_LABELS[i]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, SHADOW.sm]}>
              <View style={styles.rowLabel}>
                <Text style={styles.cardTitle}>⚡ Energia</Text>
                <Text style={styles.scaleHint}>1 = esgotada · 5 = ótima</Text>
              </View>
              <ScaleSelector value={energy || 0} onChange={setEnergy} color="#E8A87C" />
            </View>

            <View style={[styles.card, SHADOW.sm]}>
              <View style={styles.rowLabel}>
                <Text style={styles.cardTitle}>😴 Sono (ontem)</Text>
                <Text style={styles.scaleHint}>1 = péssimo · 5 = ótimo</Text>
              </View>
              <ScaleSelector value={sleep || 0} onChange={setSleep} color="#7B6EA8" />
            </View>

            <View style={[styles.card, SHADOW.sm]}>
              <Text style={styles.cardTitle}>🌡️ Fogachos hoje</Text>
              <Text style={styles.cardSubtitle}>Quantas vezes você sentiu calor intenso?</Text>
              <Counter value={hotFlashes} onChange={setHotFlashes} />
            </View>

            <View style={[styles.card, SHADOW.sm]}>
              <View style={styles.rowLabel}>
                <Text style={styles.cardTitle}>💊 Dor / desconforto</Text>
                <Text style={styles.scaleHint}>1 = muita dor · 5 = sem dor</Text>
              </View>
              <ScaleSelector value={painLevel || 0} onChange={setPainLevel} color="#C96A8A" />
            </View>

            <View style={[styles.card, SHADOW.sm]}>
              <Text style={styles.cardTitle}>📝 Observações (opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Algo que você quer lembrar hoje..."
                placeholderTextColor={COLORS.textLight}
                multiline
                maxLength={300}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.saveBtnText}>💚 Salvar registro de hoje</Text>
              }
            </TouchableOpacity>

            {!loadingHistory && history.length > 0 && (
              <View style={styles.histSection}>
                <Text style={styles.histTitle}>Últimos dias</Text>
                {history.map(item => <HistoryCard key={item.id} item={item} />)}
              </View>
            )}
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: SPACING.lg },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.sm },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  savedBanner: {
    backgroundColor: '#E8F5E9', borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  savedText: { fontSize: 14, color: '#388E3C', fontWeight: '600' },
  editLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  scaleHint: { fontSize: 11, color: COLORS.textLight },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  moodBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: RADIUS.md, borderWidth: 2, borderColor: 'transparent', marginHorizontal: 2 },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  notesInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 14, color: COLORS.text, minHeight: 80,
    textAlignVertical: 'top', marginTop: SPACING.sm,
  },
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 50, padding: 3, marginBottom: SPACING.md },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 50 },
  tabBtnActive: { backgroundColor: COLORS.white },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabBtnTextActive: { color: COLORS.primary },
  insightsLoading: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  insightsLoadingText: { fontSize: 14, color: COLORS.textSecondary },
  insightText: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginTop: 6 },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg,
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  histSection: { marginTop: SPACING.sm },
  histTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
});

const scale = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  dotText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  dotTextActive: { color: COLORS.white },
});

const counter = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginTop: SPACING.md },
  btn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { fontSize: 22, color: COLORS.white, fontWeight: '700', lineHeight: 26 },
  value: { fontSize: 32, fontWeight: '800', color: COLORS.text, minWidth: 50, textAlign: 'center' },
});

const hist = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 28 },
  date: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notes: { fontSize: 12, color: COLORS.textLight, maxWidth: 120, textAlign: 'right' },
});
