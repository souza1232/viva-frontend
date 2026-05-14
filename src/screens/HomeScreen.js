import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { getGreeting, getVoice, getTodayCheckin, saveCheckin, getWorkForecast, getDailyRitual, completeRitual } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useSubscription from '../hooks/useSubscription';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

function calculateWellnessScore(checkin) {
  if (!checkin) return null;
  let num = 0, den = 0;
  if (checkin.mood)      { num += ((checkin.mood - 1) / 4) * 40; den += 40; }
  if (checkin.energy)    { num += ((checkin.energy - 1) / 4) * 25; den += 25; }
  if (checkin.sleep)     { num += ((checkin.sleep - 1) / 4) * 25; den += 25; }
  if (checkin.hotFlashes != null) {
    num += Math.max(0, 1 - checkin.hotFlashes / 12) * 10; den += 10;
  }
  return den === 0 ? null : Math.round((num / den) * 100);
}

function scoreAppearance(score) {
  if (score >= 80) return { color: '#388E3C', bg: '#F0FFF4', border: '#A5D6A7', label: 'Ótima forma hoje! ✨' };
  if (score >= 60) return { color: '#E65100', bg: '#FFF8F0', border: '#FFCC80', label: 'Dia equilibrado 🌤️' };
  if (score >= 40) return { color: '#F57F17', bg: '#FFFDE7', border: '#FFE082', label: 'Cuide-se hoje 💛' };
  return { color: '#AD1457', bg: '#FFF0F5', border: '#F48FB1', label: 'Merece atenção especial 💜' };
}

function ScoreCard({ checkin, onDetailPress, isPremium }) {
  const score = calculateWellnessScore(checkin);
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (score == null) return;
    counterAnim.setValue(0);
    Animated.timing(counterAnim, {
      toValue: score,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = counterAnim.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => counterAnim.removeListener(id);
  }, [score]);

  if (score == null) return null;
  const { color, bg, border, label } = scoreAppearance(score);
  const hasFullData = checkin.energy || checkin.sleep;

  return (
    <View style={[styles.scoreCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>Bem-estar de hoje</Text>
        <Text style={styles.scoreDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
      </View>

      <View style={styles.scoreCenter}>
        <Text style={[styles.scoreNumber, { color }]}>{display}</Text>
        <Text style={[styles.scoreMax, { color }]}>/100</Text>
      </View>

      <Text style={[styles.scoreLabel, { color }]}>{label}</Text>

      {!hasFullData && (
        <TouchableOpacity
          style={[styles.scoreDetailBtn, { borderColor: color }]}
          onPress={onDetailPress}
        >
          <Text style={[styles.scoreDetailText, { color }]}>
            {isPremium ? '📊 Completar sintomas para score preciso →' : '🔒 Score completo com Viva Pro →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RitualCard({ ritual, onComplete }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.12, useNativeDriver: true, speed: 20 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    await onComplete();
    setCompleting(false);
  }

  const streakLabel = ritual.streak === 0
    ? 'Comece hoje!'
    : ritual.streak === 1
    ? '1 dia seguido'
    : `${ritual.streak} dias seguidos`;

  return (
    <Animated.View style={[styles.ritualCard, { transform: [{ scale: scaleAnim }] }]}>
      {/* Streak + dots */}
      <View style={styles.ritualStreakRow}>
        <View style={styles.ritualStreakLeft}>
          <Text style={styles.ritualFireEmoji}>🔥</Text>
          <Text style={styles.ritualStreakText}>{streakLabel}</Text>
        </View>
        <View style={styles.ritualDots}>
          {(ritual.last7 || []).map((day, i) => (
            <View
              key={i}
              style={[
                styles.ritualDot,
                day.completed && styles.ritualDotDone,
                day.isToday && !day.completed && styles.ritualDotToday,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Mensagem da Viva */}
      <Text style={styles.ritualMessage}>{ritual.message}</Text>

      {/* Desafio */}
      <View style={styles.ritualChallenge}>
        <Text style={styles.ritualChallengeEmoji}>{ritual.challengeEmoji}</Text>
        <View style={styles.ritualChallengeInfo}>
          <Text style={styles.ritualChallengeLabel}>Desafio de hoje</Text>
          <Text style={styles.ritualChallengeText}>{ritual.challenge}</Text>
        </View>
      </View>

      {/* Botão */}
      {ritual.completed ? (
        <View style={styles.ritualDoneBtn}>
          <Text style={styles.ritualDoneBtnText}>✅ Concluído hoje!</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.ritualBtn}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.85}
        >
          <Text style={styles.ritualBtnText}>{completing ? '...' : 'Fiz! ✓'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

function LockedOverlay({ onPress }) {
  return (
    <TouchableOpacity style={styles.lockedOverlay} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.lockedIcon}>🔒</Text>
      <Text style={styles.lockedText}>Assinar Viva Pro →</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { isPremium } = useSubscription();
  const [greeting, setGreeting] = useState('');
  const [loadingGreeting, setLoadingGreeting] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [sound, setSound] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [ritual, setRitual] = useState(null);
  const [loadingRitual, setLoadingRitual] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'você';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const isBusinesswoman = user?.mainRole === 'empresaria' || user?.mainRole === 'todas';
  const isHomemaker = user?.mainRole === 'esposa' || user?.mainRole === 'mae';

  useEffect(() => {
    loadGreeting();
    loadCheckin();
    loadRitual();
    return () => { sound?.unloadAsync(); };
  }, []);

  async function loadRitual() {
    try {
      const { data } = await getDailyRitual();
      setRitual(data);
    } catch { /* silencia */ } finally {
      setLoadingRitual(false);
    }
  }

  async function handleCompleteRitual() {
    try {
      const { data } = await completeRitual();
      setRitual(prev => ({ ...prev, completed: true, streak: data.streak }));
    } catch { /* silencia */ }
  }

  async function loadCheckin() {
    try {
      const { data } = await getTodayCheckin();
      if (data) {
        setTodayCheckin(data);
        setCheckinDone(true);
        const role = user?.mainRole;
        const isBusiness = role === 'empresaria' || role === 'todas';
        if (isPremium && isBusiness) loadForecast(data);
      }
    } catch { /* silencia */ }
  }

  async function loadForecast(checkin) {
    if (!checkin?.mood) return;
    setLoadingForecast(true);
    try {
      const { data } = await getWorkForecast({
        mood: checkin.mood,
        sleep: checkin.sleep,
        energy: checkin.energy,
        hotFlashes: checkin.hotFlashes,
      });
      setForecast(data);
    } catch { /* silencia */ } finally {
      setLoadingForecast(false);
    }
  }

  async function handleMoodCheckin(mood) {
    const checkin = { mood };
    setCheckinDone(true);
    setTodayCheckin(checkin);
    try {
      await saveCheckin({ mood });
      const role = user?.mainRole;
      const isBusiness = role === 'empresaria' || role === 'todas';
      if (isPremium && isBusiness) loadForecast(checkin);
    } catch { /* silencia */ }
  }

  async function loadGreeting() {
    try {
      const { data } = await getGreeting();
      setGreeting(data.greeting);
    } catch {
      setGreeting(`${timeGreeting}, ${firstName}! Como você está se sentindo hoje? Estou aqui para te ouvir com carinho.`);
    } finally {
      setLoadingGreeting(false);
    }
  }

  async function playGreetingAudio() {
    if (playingAudio) {
      await sound?.stopAsync();
      setPlayingAudio(false);
      return;
    }
    setPlayingAudio(true);
    try {
      const audioBlob = await getVoice(greeting);
      const uri = URL.createObjectURL(audioBlob);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlayingAudio(false);
      });
    } catch {
      Alert.alert('Ops!', 'Não foi possível reproduzir o áudio agora.');
      setPlayingAudio(false);
    }
  }

  function goToPaywall() {
    navigation.navigate('Paywall');
  }

  const MOODS = ['😣', '😔', '😐', '🙂', '😊'];
  const MOOD_LABELS = ['Péssima', 'Mal', 'Ok', 'Bem', 'Ótima'];

  const quickActions = [
    { label: 'Falar com a Viva', emoji: '💬', screen: 'Chat', color: COLORS.primary, free: false },
    { label: 'Meu cardápio', emoji: '🥗', screen: 'Food', color: COLORS.secondary, free: false },
    { label: 'Exercícios', emoji: '🏃‍♀️', screen: 'Exercise', color: '#6BAE75', free: false },
    { label: 'Sintomas', emoji: '📊', screen: 'SymptomTracker', color: '#7B6EA8', free: false },
  ];

  return (
    <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.timeGreeting}>{timeGreeting},</Text>
            <Text style={styles.name}>{firstName} 🌸</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        {/* Ritual da manhã */}
        {loadingRitual ? (
          <View style={styles.ritualCardLoading}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.ritualLoadingText}>Preparando seu ritual de hoje...</Text>
          </View>
        ) : ritual ? (
          <RitualCard ritual={ritual} onComplete={handleCompleteRitual} />
        ) : null}

        {/* Saudação da Viva */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingHeader}>
            <Text style={styles.vivaName}>🌸 Viva</Text>
            <TouchableOpacity onPress={playGreetingAudio} style={styles.audioBtn}>
              <Text style={styles.audioBtnText}>{playingAudio ? '⏸ Pausar' : '▶ Ouvir'}</Text>
            </TouchableOpacity>
          </View>
          {loadingGreeting ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />
          ) : (
            <Text style={styles.greetingText}>{greeting}</Text>
          )}
        </View>

        {/* Check-in diário — GRÁTIS */}
        {!checkinDone ? (
          <View style={styles.checkinCard}>
            <Text style={styles.checkinTitle}>Como você está hoje?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((emoji, i) => (
                <TouchableOpacity key={i} style={styles.moodBtn} onPress={() => handleMoodCheckin(i + 1)}>
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text style={styles.moodLabel}>{MOOD_LABELS[i]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.checkinDone}>
              <Text style={styles.checkinDoneEmoji}>{MOODS[(todayCheckin?.mood || 3) - 1]}</Text>
              <View style={styles.checkinDoneInfo}>
                <Text style={styles.checkinDoneTitle}>Check-in registrado ✓</Text>
                <Text style={styles.checkinDoneSub}>
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
                </Text>
              </View>
            </View>
            <ScoreCard
              checkin={todayCheckin}
              isPremium={isPremium}
              onDetailPress={() => isPremium ? navigation.navigate('SymptomTracker') : goToPaywall()}
            />
          </>
        )}

        {/* Previsão do dia — só para empresária/todas, PREMIUM */}
        {checkinDone && isBusinesswoman && (
          <View style={{ position: 'relative', marginBottom: SPACING.md }}>
            <View style={[styles.forecastCard, !isPremium && styles.cardDimmed]}>
              {loadingForecast ? (
                <Text style={styles.forecastLoading}>🔮 Analisando seu dia...</Text>
              ) : forecast && isPremium ? (
                <>
                  <View style={styles.forecastHeader}>
                    <Text style={styles.forecastEmoji}>{forecast.emoji || '🟡'}</Text>
                    <View style={styles.forecastInfo}>
                      <Text style={styles.forecastTitle}>Previsão do seu dia</Text>
                      <Text style={styles.forecastEnergy}>Energia {forecast.energyLevel}</Text>
                    </View>
                  </View>
                  <Text style={styles.forecastText}>{forecast.forecast}</Text>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>⏰ Melhor hora para decisões:</Text>
                    <Text style={styles.forecastValue}>{forecast.bestTime}</Text>
                  </View>
                  <View style={styles.forecastTip}>
                    <Text style={styles.forecastTipText}>💡 {forecast.tip}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.forecastHeader}>
                    <Text style={styles.forecastEmoji}>🔮</Text>
                    <View style={styles.forecastInfo}>
                      <Text style={styles.forecastTitle}>Previsão do seu dia</Text>
                      <Text style={styles.forecastEnergy}>Energia Alta</Text>
                    </View>
                  </View>
                  <Text style={styles.forecastText}>
                    Sua previsão personalizada baseada nos sintomas de hoje estará aqui...
                  </Text>
                  <View style={styles.forecastTip}>
                    <Text style={styles.forecastTipText}>💡 Dica especial para você hoje</Text>
                  </View>
                </>
              )}
            </View>
            {!isPremium && <LockedOverlay onPress={goToPaywall} />}
          </View>
        )}

        {/* Botões de emergência — GRÁTIS */}
        <View style={styles.emergencyRow}>
          <TouchableOpacity style={styles.emergencyBtn} onPress={() => navigation.navigate('Emergency')}>
            <Text style={styles.emergencyEmoji}>🌡️</Text>
            <Text style={styles.emergencyBtnText}>Fogacho agora</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.desabafoBtn}
            onPress={() => isPremium ? navigation.navigate('Chat', { initialMessage: 'Preciso desabafar sobre algo que aconteceu...' }) : goToPaywall()}
          >
            <Text style={styles.emergencyEmoji}>💜</Text>
            <Text style={styles.desabafoBtnText}>Preciso desabafar</Text>
          </TouchableOpacity>
        </View>

        {/* Ações rápidas */}
        <Text style={styles.sectionTitle}>O que você precisa agora?</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(action => {
            const locked = !action.free && !isPremium;
            return (
              <View key={action.screen} style={{ flex: 1, minWidth: '28%', position: 'relative' }}>
                <TouchableOpacity
                  style={[styles.actionCard, SHADOW.md, locked && styles.actionCardLocked]}
                  onPress={() => locked ? goToPaywall() : navigation.navigate(action.screen)}
                >
                  <Text style={styles.actionEmoji}>{action.emoji}</Text>
                  <Text style={[styles.actionLabel, { color: locked ? '#BBBBBB' : action.color }]}>
                    {action.label}
                  </Text>
                  {locked && <Text style={styles.actionLockBadge}>🔒</Text>}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Prep para reunião — só para empresária/todas, PREMIUM */}
        {isBusinesswoman && (
          <View style={{ position: 'relative', marginBottom: SPACING.md }}>
            <View style={[styles.meetingCard, !isPremium && styles.cardDimmed]}>
              <Text style={styles.meetingEmoji}>📊</Text>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle}>Reunião importante hoje?</Text>
                <Text style={styles.meetingSub}>A Viva te ajuda a se preparar →</Text>
              </View>
            </View>
            {isPremium ? (
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                onPress={() => navigation.navigate('Chat', {
                  initialMessage: 'Tenho uma reunião importante hoje. Me ajude a me preparar e a gerenciar meus sintomas para estar no meu melhor.',
                })}
              />
            ) : (
              <LockedOverlay onPress={goToPaywall} />
            )}
          </View>
        )}

        {/* Card empreendedorismo — para esposa/mae */}
        {isHomemaker && (
          <TouchableOpacity
            style={styles.reinventionCard}
            onPress={() => isPremium
              ? navigation.navigate('Chat', { initialMessage: 'Quero pensar em formas de empreender ou criar uma nova fonte de renda nessa fase da minha vida. Me ajuda a descobrir minhas habilidades e possibilidades?' })
              : goToPaywall()
            }
            activeOpacity={0.88}
          >
            <Text style={styles.reinventionEmoji}>🌱</Text>
            <View style={styles.reinventionInfo}>
              <Text style={styles.reinventionTitle}>Sua próxima fase</Text>
              <Text style={styles.reinventionSub}>A menopausa pode ser o começo de algo novo. Que tal descobrir seu potencial de empreender? →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Suporte noturno — PREMIUM */}
        <View style={{ position: 'relative', marginBottom: SPACING.lg }}>
          <View style={[styles.nightCard, !isPremium && { opacity: 0.5 }]}>
            <Text style={styles.nightEmoji}>🌙</Text>
            <View style={styles.nightInfo}>
              <Text style={styles.nightTitle}>Acordou de madrugada?</Text>
              <Text style={styles.nightSub}>A Viva está aqui para te ouvir agora →</Text>
            </View>
          </View>
          {isPremium ? (
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => navigation.navigate('Chat', { initialMessage: 'Acordei de madrugada e preciso de apoio 🌙' })}
            />
          ) : (
            <LockedOverlay onPress={goToPaywall} />
          )}
        </View>

        {/* Banner Viva Pro — só aparece para não-assinantes */}
        {!isPremium && (
          <TouchableOpacity style={styles.proBanner} onPress={goToPaywall} activeOpacity={0.88}>
            <LinearGradient colors={['#C96A8A', '#7B3F7F']} style={styles.proBannerGradient}>
              <Text style={styles.proBannerEmoji}>✨</Text>
              <View style={styles.proBannerInfo}>
                <Text style={styles.proBannerTitle}>Experimente Viva Pro grátis</Text>
                <Text style={styles.proBannerSub}>7 dias sem compromisso · Cancele quando quiser</Text>
              </View>
              <Text style={styles.proBannerArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Lembretes gentis */}
        <View style={styles.remindersCard}>
          <Text style={styles.remindersTitle}>Lembretes gentis de hoje</Text>
          {['💧 Beba água agora', '🧘 Respira fundo por 1 minuto', '🚶‍♀️ Movimente o corpo hoje'].map(r => (
            <Text key={r} style={styles.reminder}>{r}</Text>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  timeGreeting: { fontSize: 16, color: COLORS.textSecondary },
  name: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },

  greetingCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.md },
  greetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  vivaName: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  audioBtn: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6 },
  audioBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  greetingText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },

  checkinCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.md },
  checkinTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  checkinDone: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...SHADOW.sm },
  checkinDoneEmoji: { fontSize: 36 },
  checkinDoneInfo: { flex: 1 },
  checkinDoneTitle: { fontSize: 14, fontWeight: '700', color: '#388E3C' },
  checkinDoneSub: { fontSize: 13, color: COLORS.primary, marginTop: 2 },

  forecastCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.md, borderLeftWidth: 4, borderLeftColor: '#6BAE75' },
  forecastLoading: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 8 },
  forecastHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  forecastEmoji: { fontSize: 28 },
  forecastInfo: { flex: 1 },
  forecastTitle: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  forecastEnergy: { fontSize: 15, fontWeight: '800', color: COLORS.text, textTransform: 'capitalize' },
  forecastText: { fontSize: 14, color: COLORS.text, lineHeight: 21, marginBottom: 10 },
  forecastRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8 },
  forecastLabel: { fontSize: 12, color: COLORS.textSecondary },
  forecastValue: { fontSize: 13, fontWeight: '700', color: '#7B6EA8', textTransform: 'capitalize' },
  forecastTip: { backgroundColor: '#F0FFF4', borderRadius: RADIUS.sm, padding: SPACING.sm },
  forecastTipText: { fontSize: 13, color: '#276749', lineHeight: 19 },

  emergencyRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  emergencyBtn: { flex: 1, backgroundColor: '#FFF0F0', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#FFCDD2' },
  desabafoBtn: { flex: 1, backgroundColor: '#F3E8FF', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#E1BEE7' },
  emergencyEmoji: { fontSize: 24 },
  emergencyBtnText: { fontSize: 13, fontWeight: '700', color: '#C62828', textAlign: 'center' },
  desabafoBtnText: { fontSize: 13, fontWeight: '700', color: '#6A1B9A', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.lg },
  actionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 6 },
  actionCardLocked: { backgroundColor: '#F9F9F9' },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  actionLockBadge: { position: 'absolute', top: 6, right: 6, fontSize: 12 },

  meetingCard: { backgroundColor: '#EEF2FF', borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#C5CAE9' },
  meetingEmoji: { fontSize: 28 },
  meetingInfo: { flex: 1 },
  meetingTitle: { fontSize: 14, fontWeight: '700', color: '#283593' },
  meetingSub: { fontSize: 13, color: '#5C6BC0', marginTop: 2 },

  nightCard: { backgroundColor: '#2D1B4E', borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  nightEmoji: { fontSize: 32 },
  nightInfo: { flex: 1 },
  nightTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  nightSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  cardDimmed: { opacity: 0.45 },

  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: RADIUS.lg,
  },
  lockedIcon: { fontSize: 22, marginBottom: 4 },
  lockedText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  proBanner: { marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  proBannerGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: 12 },
  proBannerEmoji: { fontSize: 28 },
  proBannerInfo: { flex: 1 },
  proBannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  proBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  proBannerArrow: { fontSize: 20, color: '#FFFFFF', fontWeight: '700' },

  reinventionCard: { backgroundColor: '#F0FFF4', borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.md, borderWidth: 1.5, borderColor: '#A5D6A7' },
  reinventionEmoji: { fontSize: 32 },
  reinventionInfo: { flex: 1 },
  reinventionTitle: { fontSize: 15, fontWeight: '800', color: '#1B5E20' },
  reinventionSub: { fontSize: 13, color: '#388E3C', marginTop: 3, lineHeight: 19 },

  remindersCard: { backgroundColor: '#FFF8E7', borderRadius: RADIUS.lg, padding: SPACING.lg },
  remindersTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  reminder: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6, lineHeight: 22 },

  scoreCard: {
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1.5, alignItems: 'center',
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  scoreTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreDate: { fontSize: 12, color: COLORS.textSecondary },
  scoreCenter: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginBottom: 6 },
  scoreNumber: { fontSize: 72, fontWeight: '900', lineHeight: 80 },
  scoreMax: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  scoreLabel: { fontSize: 15, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  scoreDetailBtn: {
    borderWidth: 1.5, borderRadius: 50, paddingVertical: 10,
    paddingHorizontal: 18, width: '100%', alignItems: 'center',
  },
  scoreDetailText: { fontSize: 13, fontWeight: '700' },

  ritualCard: {
    backgroundColor: '#1A0A2E', borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(201,106,138,0.3)',
  },
  ritualCardLoading: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 10, ...SHADOW.sm,
  },
  ritualLoadingText: { fontSize: 13, color: COLORS.textSecondary },
  ritualStreakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ritualStreakLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ritualFireEmoji: { fontSize: 18 },
  ritualStreakText: { fontSize: 13, fontWeight: '700', color: '#E8A4BB' },
  ritualDots: { flexDirection: 'row', gap: 5 },
  ritualDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  ritualDotDone: { backgroundColor: '#C96A8A' },
  ritualDotToday: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#C96A8A' },
  ritualMessage: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21, marginBottom: 14 },
  ritualChallenge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: 14,
  },
  ritualChallengeEmoji: { fontSize: 22 },
  ritualChallengeInfo: { flex: 1 },
  ritualChallengeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  ritualChallengeText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  ritualBtn: {
    backgroundColor: '#C96A8A', borderRadius: 50,
    paddingVertical: 12, alignItems: 'center',
  },
  ritualBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  ritualDoneBtn: {
    backgroundColor: 'rgba(107,174,117,0.25)', borderRadius: 50,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(107,174,117,0.5)',
  },
  ritualDoneBtnText: { color: '#6BAE75', fontSize: 15, fontWeight: '700' },
});
