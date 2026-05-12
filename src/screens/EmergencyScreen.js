import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const TIPS = [
  { emoji: '🧊', text: 'Pressione o pulso em superfície fria por 10 segundos' },
  { emoji: '💨', text: 'Continue respirando em "O" com a boca — resfria por dentro' },
  { emoji: '👁️', text: 'Foque em um detalhe neutro da sala: cor, textura, forma' },
  { emoji: '💜', text: 'Ninguém percebe tanto quanto você sente. Você está ótima.' },
];

const PHASE_CONFIG = {
  inhale: { label: 'Inspire pelo nariz...', toValue: 1.5, duration: 4000 },
  hold:   { label: 'Segure...', toValue: 1.5, duration: 4000 },
  exhale: { label: 'Expire pela boca...', toValue: 1.0, duration: 6000 },
};

export default function EmergencyScreen({ navigation }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const holdTimerRef = useRef(null);

  function runRound(r) {
    if (r > 4) { setDone(true); return; }
    setRound(r);

    // Inhale
    setPhaseLabel(PHASE_CONFIG.inhale.label);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
    ]).start(() => {
      // Hold
      setPhaseLabel(PHASE_CONFIG.hold.label);
      holdTimerRef.current = setTimeout(() => {
        // Exhale
        setPhaseLabel(PHASE_CONFIG.exhale.label);
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 6000, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 6000, useNativeDriver: true }),
        ]).start(() => runRound(r + 1));
      }, 4000);
    });
  }

  function start() {
    setStarted(true);
    runRound(1);
  }

  function stop() {
    scaleAnim.stopAnimation();
    opacityAnim.stopAnimation();
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={stop}>
        <Text style={styles.closeText}>✕ Fechar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🌬️ Respira comigo</Text>
      <Text style={styles.subtitle}>Técnica 4-4-6 · alivia o fogacho em 1 minuto</Text>

      {!started && !done && (
        <>
          <View style={styles.circleIdle}>
            <Text style={styles.idleEmoji}>🌸</Text>
          </View>
          <Text style={styles.instruction}>Encontre uma posição confortável{'\n'}e respire normalmente por um momento</Text>
          <TouchableOpacity style={styles.startBtn} onPress={start}>
            <Text style={styles.startBtnText}>Começar agora</Text>
          </TouchableOpacity>
        </>
      )}

      {started && !done && (
        <>
          <View style={styles.circleWrapper}>
            <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
            <View style={styles.circleInner}>
              <Text style={styles.roundText}>Rodada {round} de 4</Text>
            </View>
          </View>
          <Text style={styles.phaseText}>{phaseLabel}</Text>
          <Text style={styles.hint}>Inspire 4s · Segure 4s · Expire 6s</Text>
        </>
      )}

      {done && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>✨</Text>
          <Text style={styles.doneTitle}>Muito bem!</Text>
          <Text style={styles.doneSub}>Você atravessou. Agora mais algumas dicas:</Text>

          {TIPS.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{t.emoji}</Text>
              <Text style={styles.tipText}>{t.text}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.okBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.okBtnText}>Estou bem agora ✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A2E', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  closeBtn: { position: 'absolute', top: 56, right: 24 },
  closeText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },

  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 48 },

  circleIdle: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(201,106,138,0.3)', borderWidth: 2, borderColor: 'rgba(201,106,138,0.6)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  idleEmoji: { fontSize: 52 },

  instruction: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 26, marginBottom: 40 },
  startBtn: { backgroundColor: '#C96A8A', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 48 },
  startBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  circleWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  circleOuter: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(201,106,138,0.4)', borderWidth: 2, borderColor: 'rgba(201,106,138,0.8)' },
  circleInner: { justifyContent: 'center', alignItems: 'center' },
  roundText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  phaseText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  hint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },

  doneContainer: { alignItems: 'center', width: '100%' },
  doneEmoji: { fontSize: 52, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  doneSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28, textAlign: 'center' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, width: '100%' },
  tipEmoji: { fontSize: 22, width: 30 },
  tipText: { flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  okBtn: { marginTop: 24, backgroundColor: '#C96A8A', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 48 },
  okBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
