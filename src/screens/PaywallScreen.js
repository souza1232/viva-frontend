import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createCheckout } from '../services/api';

const FEATURES = [
  { emoji: '🔮', text: 'Previsão do seu dia de trabalho baseada nos seus sintomas' },
  { emoji: '🥗', text: 'Cardápio semanal personalizado para menopausa' },
  { emoji: '🏃‍♀️', text: 'Plano de exercícios adaptado à sua fase' },
  { emoji: '📊', text: 'Rastreador de sintomas com insights de IA' },
  { emoji: '📋', text: 'Relatório mensal completo para levar ao médico' },
  { emoji: '📅', text: 'Prep para reuniões e apresentações importantes' },
  { emoji: '💬', text: 'Chat ilimitado com a Viva — sem fila, sem limite' },
  { emoji: '🌙', text: 'Apoio noturno para as madrugadas difíceis' },
];

export default function PaywallScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { data } = await createCheckout();
      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch {
      Alert.alert('Ops!', 'Não foi possível iniciar o pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#2D1B4E', '#1A0A2E']} style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ VIVA PRO</Text>
        </View>

        <Text style={styles.title}>Você merece atravessar{'\n'}essa fase com apoio real</Text>
        <Text style={styles.subtitle}>
          Tudo que uma mulher de alta performance precisa para cuidar da saúde sem parar de voar.
        </Text>

        {/* Feature list */}
        <View style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Text style={styles.trialBadge}>7 DIAS GRÁTIS</Text>
          </View>
          <Text style={styles.price}>R$49,90</Text>
          <Text style={styles.pricePeriod}>por mês, após o período gratuito</Text>
          <Text style={styles.pricingDetail}>Cancele quando quiser. Sem surpresas.</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#2D1B4E" />
          ) : (
            <>
              <Text style={styles.ctaBtnText}>Começar agora — 7 dias grátis</Text>
              <Text style={styles.ctaBtnSub}>Sem cobranças durante o período de teste</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Ao continuar, você concorda com os termos de uso.{'\n'}
          A cobrança começa após os 7 dias gratuitos.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute', top: 56, left: 24, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  scroll: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 60, alignItems: 'center' },

  badge: {
    backgroundColor: 'rgba(201,106,138,0.3)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(201,106,138,0.6)',
    marginBottom: 20,
  },
  badgeText: { color: '#E8A4BB', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },

  title: {
    fontSize: 26, fontWeight: '800', color: '#FFFFFF',
    textAlign: 'center', lineHeight: 34, marginBottom: 14,
  },
  subtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 23, marginBottom: 28,
  },

  featuresCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  featureEmoji: { fontSize: 20, width: 26 },
  featureText: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21 },

  pricingCard: {
    width: '100%', backgroundColor: 'rgba(201,106,138,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20,
    borderWidth: 1.5, borderColor: 'rgba(201,106,138,0.4)',
  },
  pricingHeader: { marginBottom: 8 },
  trialBadge: {
    backgroundColor: '#C96A8A', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1,
  },
  price: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', marginTop: 8 },
  pricePeriod: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  pricingDetail: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },

  ctaBtn: {
    width: '100%', backgroundColor: '#C96A8A',
    borderRadius: 50, paddingVertical: 18,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#C96A8A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  ctaBtnLoading: { opacity: 0.7 },
  ctaBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  ctaBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 },

  footer: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
    textAlign: 'center', lineHeight: 18,
  },
});
