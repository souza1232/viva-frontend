import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS } from '../theme';

const features = [
  { emoji: '🤖', title: 'IA personalizada 24h', sub: 'Chat que entende seus sintomas e responde com base na sua fase da menopausa.' },
  { emoji: '📊', title: 'Controle de sintomas', sub: 'Registre fogachos, insônia, humor e veja sua evolução ao longo do tempo.' },
  { emoji: '🥗', title: 'Cardápio anti-inflamatório', sub: 'Receitas e dicas de alimentação criadas para aliviar os sintomas.' },
  { emoji: '💆', title: 'Rituais de bem-estar', sub: 'Rotinas diárias de autocuidado para dormir melhor e reduzir a ansiedade.' },
];

const testimonials = [
  { name: 'Ana Paula, 52 anos', text: '"Finalmente encontrei um app que me entende. O chat da IA é incrível, responde tudo que eu precisava saber."' },
  { name: 'Marcia S., 49 anos', text: '"Os fogachos reduziram muito depois que comecei a seguir o cardápio do Viva. Recomendo para todas!"' },
];

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <LinearGradient colors={['#C96A8A', '#7B6EA8']} style={styles.hero}>
        <Text style={styles.heroEmoji}>🌸</Text>
        <Text style={styles.heroApp}>Viva</Text>
        <Text style={styles.heroTitle}>Sua saúde na menopausa com inteligência artificial</Text>
        <Text style={styles.heroSub}>
          Apoio personalizado para controlar sintomas, melhorar sua alimentação e se sentir melhor todo dia.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.ctaBtnText}>Começar 7 dias grátis →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Já tenho conta. <Text style={{ fontWeight: '700' }}>Entrar</Text></Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✨ Mais de 1.000 mulheres já usam o Viva</Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tudo que você precisa em um só lugar</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialSection}>
        <Text style={styles.sectionTitle}>O que dizem nossas usuárias</Text>
        {testimonials.map((t, i) => (
          <View key={i} style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>{t.text}</Text>
            <Text style={styles.testimonialName}>— {t.name}</Text>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionTitle}>Simples e acessível</Text>
        <View style={styles.priceCard}>
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>🎉 7 dias grátis</Text>
          </View>
          <Text style={styles.price}>R$37,90<Text style={styles.priceMes}>/mês</Text></Text>
          <Text style={styles.priceDesc}>Cancele quando quiser. Sem pegadinhas.</Text>
          <View style={styles.priceFeatures}>
            {['Chat com IA ilimitado', 'Cardápio personalizado', 'Controle de sintomas', 'Comunidade exclusiva'].map((item, i) => (
              <Text key={i} style={styles.priceFeatureItem}>✅ {item}</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.ctaBtnPink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.ctaBtnText}>Experimentar grátis agora</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>🌸 Viva</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:suporte@appviva.com.br')}>
          <Text style={styles.footerLink}>suporte@appviva.com.br</Text>
        </TouchableOpacity>
        <Text style={styles.footerCopy}>© 2025 Viva App. Todos os direitos reservados.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F8' },
  content: { paddingBottom: 0 },

  // Hero
  hero: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 48, alignItems: 'center' },
  heroEmoji: { fontSize: 56, marginBottom: 4 },
  heroApp: { fontSize: 32, fontWeight: '900', color: 'white', letterSpacing: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: 'white', textAlign: 'center', marginTop: 12, lineHeight: 30 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.88)', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  ctaBtn: { backgroundColor: 'white', borderRadius: RADIUS.full, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24, width: '100%', alignItems: 'center' },
  ctaBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },
  loginLink: { marginTop: 16 },
  loginLinkText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },

  // Badge
  badge: { backgroundColor: '#FFF0F5', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F5E6EF' },
  badgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // Section
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },

  // Features
  featureCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, shadowColor: '#C96A8A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  featureEmoji: { fontSize: 32, marginRight: 14, marginTop: 2 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  featureSub: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Testimonials
  testimonialSection: { backgroundColor: '#FFF0F5', padding: SPACING.lg },
  testimonialCard: { backgroundColor: 'white', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  testimonialText: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontStyle: 'italic' },
  testimonialName: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 8 },

  // Pricing
  pricingSection: { padding: SPACING.lg },
  priceCard: { backgroundColor: 'white', borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: '#C96A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4, alignItems: 'center' },
  trialBadge: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 12 },
  trialBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  price: { fontSize: 42, fontWeight: '900', color: COLORS.primary },
  priceMes: { fontSize: 18, fontWeight: '400', color: COLORS.textSecondary },
  priceDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 16 },
  priceFeatures: { width: '100%', marginBottom: 20 },
  priceFeatureItem: { fontSize: 14, color: COLORS.text, marginBottom: 8 },
  ctaBtnPink: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center' },

  // Footer
  footer: { backgroundColor: '#3D2C35', padding: SPACING.lg, alignItems: 'center', gap: 8 },
  footerLogo: { fontSize: 22, fontWeight: '800', color: 'white' },
  footerLink: { color: '#C96A8A', fontSize: 13 },
  footerCopy: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
