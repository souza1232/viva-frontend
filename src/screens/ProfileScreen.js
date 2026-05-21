import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  Linking, Platform, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
// expo-print e expo-sharing só funcionam em native (iOS/Android)
const Print = Platform.OS !== 'web' ? require('expo-print') : null;
const Sharing = Platform.OS !== 'web' ? require('expo-sharing') : null;
import { createPortalSession, getCheckins } from '../services/api';

const KIWIFY_URL = 'https://pay.kiwify.com.br/OKHSJyi';
import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

const STATUS_LABELS = {
  trial: { label: 'Trial gratuito', color: '#6BAE75', emoji: '🎉' },
  active: { label: 'Assinante ativa', color: COLORS.primary, emoji: '🌸' },
  canceled: { label: 'Cancelada', color: COLORS.error, emoji: '❌' },
  past_due: { label: 'Pagamento pendente', color: COLORS.warning, emoji: '⚠️' },
  none: { label: 'Sem assinatura', color: COLORS.textLight, emoji: '•' },
};

function MenuRow({ emoji, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

function InAppAlert({ message, onDismiss }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, []);

  return (
    <Animated.View style={[styles.inAppAlert, { opacity }]}>
      <Text style={styles.inAppAlertTitle}>{message.title}</Text>
      <Text style={styles.inAppAlertText}>{message.body}</Text>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  function showInfo(title, body) {
    if (Platform.OS !== 'web') {
      Alert.alert(title, body);
    } else {
      setAlertMsg({ title, body });
    }
  }
  const sub = user?.subscription;
  const statusInfo = STATUS_LABELS[sub?.status || 'none'];

  const firstName = user?.name?.split(' ')[0] || 'você';

  async function handleSubscribe() {
    const url = user?.email
      ? `${KIWIFY_URL}?email=${encodeURIComponent(user.email)}`
      : KIWIFY_URL;
    await Linking.openURL(url);
  }

  async function handleManageSubscription() {
    try {
      const { data } = await createPortalSession();
      await Linking.openURL(data.url);
    } catch {
      Alert.alert('Ops!', 'Erro ao abrir o portal de assinatura.');
    }
  }

  async function handleExportPDF() {
    if (Platform.OS === 'web') {
      // No browser, abre janela de impressão nativa
      try {
        const { data: checkins } = await getCheckins(30);
        const html = buildReportHTML(user, checkins);
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
      } catch {
        Alert.alert('Ops!', 'Não foi possível gerar o relatório.');
      }
      return;
    }

    setGeneratingPDF(true);
    try {
      const { data: checkins } = await getCheckins(30);
      const html = buildReportHTML(user, checkins);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar relatório com seu médico',
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('Ops!', 'Não foi possível gerar o relatório.');
    } finally {
      setGeneratingPDF(false);
    }
  }

  function buildReportHTML(u, checkins) {
    const avg = (arr) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : '—';
    const moods = checkins.map(c => c.mood);
    const sleeps = checkins.filter(c => c.sleep).map(c => c.sleep);
    const energies = checkins.filter(c => c.energy).map(c => c.energy);
    const totalFog = checkins.reduce((s, c) => s + (c.hotFlashes || 0), 0);
    const moodEmojis = ['😣', '😔', '😐', '🙂', '😊'];

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#333;padding:32px;max-width:700px;margin:0 auto}
  h1{color:#C96A8A;font-size:22px;margin-bottom:4px}
  h2{color:#7B6EA8;font-size:16px;margin-top:28px;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:4px}
  .meta{color:#888;font-size:13px;margin-bottom:20px}
  .stats{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  .stat{background:#FFF0F5;border-radius:8px;padding:12px 18px;text-align:center;min-width:80px}
  .stat-n{font-size:26px;font-weight:bold;color:#C96A8A}
  .stat-l{font-size:11px;color:#888;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#C96A8A;color:#fff;padding:8px 10px;text-align:left}
  td{padding:7px 10px;border-bottom:1px solid #f0e0e8}
  tr:nth-child(even){background:#fafafa}
  .notes{font-size:12px;color:#555;margin-top:6px;padding:8px;background:#f9f9f9;border-radius:4px}
  .footer{margin-top:40px;color:#bbb;font-size:11px;border-top:1px solid #eee;padding-top:16px}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  .chip{background:#FFF0F5;border-radius:12px;padding:4px 10px;font-size:12px;color:#C96A8A}
</style></head><body>
<h1>🌸 Relatório de Saúde — Viva</h1>
<div class="meta">
  <strong>${u.name}</strong>${u.age ? ` · ${u.age} anos` : ''}<br>
  Período: últimos 30 dias · Gerado em ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
</div>
${u.mainSymptoms?.length ? `<div class="chips">${u.mainSymptoms.map(s => `<span class="chip">${s}</span>`).join('')}</div>` : ''}

<h2>Resumo do Período</h2>
<div class="stats">
  <div class="stat"><div class="stat-n">${avg(moods)}</div><div class="stat-l">humor médio</div></div>
  <div class="stat"><div class="stat-n">${avg(sleeps)}</div><div class="stat-l">sono médio</div></div>
  <div class="stat"><div class="stat-n">${avg(energies)}</div><div class="stat-l">energia média</div></div>
  <div class="stat"><div class="stat-n">${totalFog}</div><div class="stat-l">fogachos</div></div>
  <div class="stat"><div class="stat-n">${checkins.length}</div><div class="stat-l">dias registrados</div></div>
</div>

<h2>Histórico Diário</h2>
<table>
  <tr><th>Data</th><th>Humor</th><th>Energia</th><th>Sono</th><th>Fogachos</th><th>Dor</th></tr>
  ${checkins.map(c => `<tr>
    <td>${new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
    <td>${moodEmojis[(c.mood || 1) - 1]} ${c.mood}/5</td>
    <td>${c.energy ? c.energy + '/5' : '—'}</td>
    <td>${c.sleep ? c.sleep + '/5' : '—'}</td>
    <td>${c.hotFlashes != null ? c.hotFlashes : '—'}</td>
    <td>${c.painLevel ? c.painLevel + '/5' : '—'}</td>
  </tr>`).join('')}
</table>

${checkins.some(c => c.notes) ? `<h2>Observações</h2>${checkins.filter(c => c.notes).map(c =>
  `<div class="notes"><strong>${new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}:</strong> ${c.notes}</div>`
).join('')}` : ''}

<div class="footer">
  Relatório gerado pelo app Viva · Saúde e bem-estar na menopausa<br>
  Este documento é um registro pessoal. Consulte sempre seu médico para diagnóstico e tratamento.
</div>
</body></html>`;
  }

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que quer sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.age && <Text style={styles.age}>{user.age} anos</Text>}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status da assinatura */}
        <View style={[styles.subscriptionCard, SHADOW.sm, { borderColor: statusInfo.color }]}>
          <View style={styles.subRow}>
            <Text style={styles.subEmoji}>{statusInfo.emoji}</Text>
            <View>
              <Text style={[styles.subStatus, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              {sub?.trialEndsAt && sub.status === 'trial' && (
                <Text style={styles.subDetail}>
                  Trial até {new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}
                </Text>
              )}
              {sub?.currentPeriodEnd && sub.status === 'active' && (
                <Text style={styles.subDetail}>
                  Renova em {new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </View>
          </View>

          {(!sub || sub.status === 'trial' || sub.status === 'canceled') && (
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
              disabled={loadingCheckout}
            >
              <Text style={styles.subscribeBtnText}>
                {loadingCheckout ? 'Aguarde...' : 'Assinar por R$47/mês'}
              </Text>
            </TouchableOpacity>
          )}

          {sub?.status === 'active' && (
            <TouchableOpacity style={styles.manageBtn} onPress={handleManageSubscription}>
              <Text style={styles.manageBtnText}>Gerenciar assinatura</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seus sintomas */}
        {user?.mainSymptoms?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seus sintomas monitorados</Text>
            <View style={styles.chips}>
              {user.mainSymptoms.map(s => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Exportar para o médico */}
        <TouchableOpacity
          style={[styles.pdfBtn, SHADOW.sm, generatingPDF && { opacity: 0.7 }]}
          onPress={handleExportPDF}
          disabled={generatingPDF}
        >
          <Text style={styles.pdfBtnEmoji}>📋</Text>
          <View style={styles.pdfBtnInfo}>
            <Text style={styles.pdfBtnTitle}>{generatingPDF ? 'Gerando relatório...' : 'Relatório para o médico'}</Text>
            <Text style={styles.pdfBtnSub}>PDF com seus sintomas dos últimos 30 dias</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuRow emoji="🔔" label="Notificações" onPress={() => showInfo('Notificações ativas 🔔', 'Você receberá lembretes às 9h e 21h todos os dias.')} />
          <MenuRow emoji="🔒" label="Privacidade" onPress={() => showInfo('Privacidade', 'Seus dados são 100% privados e nunca compartilhados com terceiros.')} />
          <MenuRow emoji="💬" label="Suporte" onPress={() => navigation.navigate('Support')} />
          <MenuRow emoji="⭐" label="Avaliar o app" onPress={() => showInfo('Obrigada! ⭐', 'Sua avaliação nos ajuda a melhorar cada vez mais.')} />
          <MenuRow emoji="🚪" label="Sair da conta" onPress={handleLogout} danger />
        </View>

        <Text style={styles.version}>Viva v1.0.0 • Feito com 💕 para você</Text>
      </ScrollView>

      {alertMsg && (
        <InAppAlert message={alertMsg} onDismiss={() => setAlertMsg(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: SPACING.xl, alignItems: 'center', gap: 6 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textSecondary },
  age: { fontSize: 14, color: COLORS.textLight },
  scroll: { padding: SPACING.md, paddingBottom: 80 },
  subscriptionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1.5, ...SHADOW.sm },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.md },
  subEmoji: { fontSize: 28 },
  subStatus: { fontSize: 16, fontWeight: '700' },
  subDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  subscribeBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center' },
  subscribeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  manageBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center' },
  manageBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  menuEmoji: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.text },
  menuLabelDanger: { color: COLORS.error },
  menuArrow: { fontSize: 20, color: COLORS.textLight },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, marginTop: SPACING.sm },
  pdfBtn: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#7B6EA8' },
  pdfBtnEmoji: { fontSize: 26 },
  pdfBtnInfo: { flex: 1 },
  pdfBtnTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  pdfBtnSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  inAppAlert: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#3D2645',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  inAppAlertTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  inAppAlertText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
});
