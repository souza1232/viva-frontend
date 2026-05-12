import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

const GYM_PLAN = [
  { day: 'Segunda', emoji: '💪', name: 'Musculação Superior', duration: '45 min', focus: 'Peito, costas, ombros', benefit: 'Preserva massa muscular e ossos', desc: 'Supino, remada, desenvolvimento e rosca. Peso moderado, 3 séries de 12.' },
  { day: 'Terça', emoji: '🚴', name: 'Cardio Moderado', duration: '30 min', focus: 'Elíptico ou bicicleta', benefit: 'Reduz fogachos e melhora o sono', desc: 'Intensidade moderada, 60–70% da frequência cardíaca máxima.' },
  { day: 'Quarta', emoji: '🧘', name: 'Yoga / Pilates', duration: '50 min', focus: 'Equilíbrio e flexibilidade', benefit: 'Reduz ansiedade e melhora o humor', desc: 'Posições que trabalham core e equilíbrio. Finaliza com meditação guiada.' },
  { day: 'Quinta', emoji: '🦵', name: 'Musculação Inferior', duration: '45 min', focus: 'Pernas e glúteos', benefit: 'Previne osteoporose e melhora metabolismo', desc: 'Agachamento, leg press, stiff e elevação de quadril. 3 séries de 12.' },
  { day: 'Sexta', emoji: '🏊', name: 'Natação / Aqua Aeróbica', duration: '40 min', focus: 'Corpo todo na água', benefit: 'Alivia dores articulares e fogachos', desc: 'Exercício de baixo impacto, ideal para articulações. Ótimo para o humor.' },
  { day: 'Sábado', emoji: '🚶‍♀️', name: 'Caminhada Ativa', duration: '40 min', focus: 'Ao ar livre ou pista', benefit: 'Vitamina D e bem-estar mental', desc: 'Ritmo moderado a intenso. Finalize com 10 min de alongamento completo.' },
  { day: 'Domingo', emoji: '🌿', name: 'Descanso Ativo', duration: '20 min', focus: 'Alongamento e respiração', benefit: 'Recuperação e paz interior', desc: 'Alongamento leve, respiração diafragmática ou meditação guiada no tapete.' },
];

const HOME_PLAN = [
  { day: 'Segunda', emoji: '🧘', name: 'Yoga em Casa', duration: '30 min', focus: 'Flexibilidade e respiração', benefit: 'Reduz ansiedade e melhora o humor', desc: 'Use tapete e vídeo guiado. Foque em respiração profunda e alongamentos.' },
  { day: 'Terça', emoji: '🚶‍♀️', name: 'Caminhada Rápida', duration: '35 min', focus: 'Cardio ao ar livre', benefit: 'Melhora sono e reduz fogachos', desc: 'Saia do bloco ou vá a um parque. Leve fone com música animada.' },
  { day: 'Quarta', emoji: '💪', name: 'Força com Peso do Corpo', duration: '35 min', focus: 'Agachamento, prancha e afundo', benefit: 'Preserva massa muscular', desc: '3 séries: 15 agachamentos, 10 afundos, 30s prancha e 15 elevações de quadril.' },
  { day: 'Quinta', emoji: '🌊', name: 'Pilates no Chão', duration: '30 min', focus: 'Core e postura', benefit: 'Alivia dores nas costas', desc: 'Exercícios de ativação do core, respiração costal e mobilidade de coluna.' },
  { day: 'Sexta', emoji: '💃', name: 'Dança Livre', duration: '30 min', focus: 'Alegria e movimento', benefit: 'Melhora humor e autoestima', desc: 'Coloque músicas que você ama e dance! Sem regras — é pura liberdade.' },
  { day: 'Sábado', emoji: '🌸', name: 'Caminhada + Respiração', duration: '45 min', focus: 'Atenção plena em movimento', benefit: 'Reduz estresse e cortisol', desc: 'Caminhe prestando atenção ao corpo. Pare e respire fundo a cada 10 min.' },
  { day: 'Domingo', emoji: '🌿', name: 'Descanso e Alongamento', duration: '20 min', focus: 'Recuperação gentil', benefit: 'Recuperação muscular e paz', desc: 'Deite no tapete, ouça algo relaxante e alongue cada músculo com carinho.' },
];

const DAY_COLORS = ['#C96A8A', '#7B6EA8', '#6BAE75', '#E8A87C', '#5BAACC', '#C96A8A', '#7B6EA8'];

export default function ExerciseScreen({ navigation }) {
  const [mode, setMode] = useState('home');
  const plan = mode === 'gym' ? GYM_PLAN : HOME_PLAN;

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Exercícios 🏃‍♀️</Text>
          <Text style={styles.subtitle}>Plano semanal para a menopausa</Text>
        </View>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'home' && styles.toggleActive]}
            onPress={() => setMode('home')}
          >
            <Text style={[styles.toggleText, mode === 'home' && styles.toggleTextActive]}>🏠 Em Casa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'gym' && styles.toggleActive]}
            onPress={() => setMode('gym')}
          >
            <Text style={[styles.toggleText, mode === 'gym' && styles.toggleTextActive]}>🏋️‍♀️ Academia</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 3 a 5x por semana já reduz fogachos, melhora o sono e protege seus ossos. Você consegue!
          </Text>
        </View>

        {plan.map((item, index) => {
          const isToday = index === todayIndex;
          return (
            <View key={item.day} style={[styles.dayCard, isToday && styles.todayCard, SHADOW.md]}>
              <View style={[styles.dayBadge, { backgroundColor: DAY_COLORS[index] }]}>
                <Text style={styles.dayName}>{item.day}</Text>
                {isToday && <Text style={styles.todayLabel}>Hoje</Text>}
              </View>
              <View style={styles.dayContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={styles.flex1}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.duration}>{item.duration} · {item.focus}</Text>
                  </View>
                </View>
                <Text style={styles.desc}>{item.desc}</Text>
                <View style={styles.benefitBadge}>
                  <Text style={styles.benefitText}>✨ {item.benefit}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌸 Ouça seu corpo. Se sentir desconforto, descanse — isso também é cuidado.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.sm },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.white },
  tipCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tipText: { fontSize: 13, color: '#8B6914', lineHeight: 20 },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  todayCard: { borderWidth: 2, borderColor: COLORS.primary },
  dayBadge: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  dayName: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  todayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  dayContent: { flex: 1, padding: SPACING.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  itemEmoji: { fontSize: 24 },
  flex1: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  duration: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 8 },
  benefitBadge: {
    backgroundColor: '#FFF0F5',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  benefitText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  footer: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOW.sm,
  },
  footerText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
