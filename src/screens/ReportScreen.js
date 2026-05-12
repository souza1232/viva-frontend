import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getReport } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

const MONTH_NAMES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function Section({ title, emoji, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{emoji} {title}</Text>
      {children}
    </View>
  );
}

function Tag({ text, color }) {
  return (
    <View style={[styles.tag, { backgroundColor: (color || COLORS.primary) + '22' }]}>
      <Text style={[styles.tagText, { color: color || COLORS.primary }]}>{text}</Text>
    </View>
  );
}

export default function ReportScreen() {
  const { user } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => { loadReport(); }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getReport(month, year);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Gerando seu relatório...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>📊</Text>
        <Text style={styles.errorTitle}>Relatório indisponível</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadReport}>
          <Text style={styles.retryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) return null;

  const moodMap = { excelente: '🌟', bem: '😊', ok: '😐', cansada: '😔', dificil: '😢' };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Relatório Mensal</Text>
        <Text style={styles.headerSubtitle}>{MONTH_NAMES[month]} {year}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Resumo */}
        <View style={[styles.summaryCard, SHADOW.md]}>
          <Text style={styles.summaryTitle}>Resumo do mês</Text>
          <Text style={styles.summaryText}>{report.summaryText}</Text>
        </View>

        {/* Sintomas */}
        {report.topSymptoms?.length > 0 && (
          <Section title="Sintomas mais frequentes" emoji="🌡️">
            <View style={styles.tags}>
              {report.topSymptoms.map(s => <Tag key={s} text={s} color={COLORS.error} />)}
            </View>
          </Section>
        )}

        {/* Humor por semana */}
        {report.moodEvolution && Object.keys(report.moodEvolution).length > 0 && (
          <Section title="Humor por semana" emoji="🌈">
            <View style={styles.moodGrid}>
              {Object.entries(report.moodEvolution).map(([week, mood]) => (
                <View key={week} style={styles.moodCard}>
                  <Text style={styles.moodEmoji}>{moodMap[mood] || '😊'}</Text>
                  <Text style={styles.moodWeek}>{week.replace('semana', 'Sem. ')}</Text>
                  <Text style={styles.moodLabel}>{mood}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Sono */}
        {report.sleepPatterns && (
          <Section title="Padrões de sono" emoji="🌙">
            <Text style={styles.bodyText}>{report.sleepPatterns}</Text>
          </Section>
        )}

        {/* Conquistas */}
        {report.achievements?.length > 0 && (
          <Section title="Suas conquistas este mês" emoji="🏆">
            {report.achievements.map((a, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listDot}>✓</Text>
                <Text style={styles.listText}>{a}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Sugestões */}
        {report.suggestions?.length > 0 && (
          <Section title="Sugestões para o próximo mês" emoji="💡">
            {report.suggestions.map((s, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listDot}>→</Text>
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Perguntas para o médico */}
        {report.doctorQuestions?.length > 0 && (
          <Section title="Perguntas para o médico" emoji="👩‍⚕️">
            <View style={styles.doctorCard}>
              <Text style={styles.doctorIntro}>Leve estas perguntas na sua próxima consulta:</Text>
              {report.doctorQuestions.map((q, i) => (
                <View key={i} style={styles.doctorQuestion}>
                  <Text style={styles.questionNum}>{i + 1}.</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 15 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  errorEmoji: { fontSize: 56, marginBottom: SPACING.md },
  errorTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  errorText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  retryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  header: { paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },
  scroll: { padding: SPACING.md },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.sm },
  summaryText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 13, fontWeight: '600' },
  moodGrid: { flexDirection: 'row', gap: 8 },
  moodCard: { flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  moodEmoji: { fontSize: 24, marginBottom: 2 },
  moodWeek: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  moodLabel: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  bodyText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  listItem: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  listDot: { fontSize: 15, color: COLORS.primary, fontWeight: '700', marginTop: 1 },
  listText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  doctorCard: { backgroundColor: '#F0F8FF', borderRadius: RADIUS.md, padding: SPACING.md },
  doctorIntro: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, fontStyle: 'italic' },
  doctorQuestion: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  questionNum: { fontSize: 14, color: COLORS.secondary, fontWeight: '700' },
  questionText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
