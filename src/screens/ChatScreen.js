import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { sendMessage, getHistory, getVoice, getChatUsage } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useSubscription from '../hooks/useSubscription';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

function MessageBubble({ message, onPlayAudio }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && <Text style={styles.vivaAvatar}>🌸</Text>}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleViva]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.content}
        </Text>
        {!isUser && (
          <TouchableOpacity style={styles.audioIconBtn} onPress={() => onPlayAudio(message.content)}>
            <Text style={styles.audioIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function formatCountdown(resetAt) {
  if (!resetAt) return '';
  const diff = new Date(resetAt) - new Date();
  if (diff <= 0) return 'agora';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} minuto${m !== 1 ? 's' : ''}`;
}

export default function ChatScreen({ route, navigation }) {
  const { user } = useAuthStore();
  const { isPremium, loading: subLoading } = useSubscription();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatListRef = useRef(null);
  const [sound, setSound] = useState(null);
  const [chatUsed, setChatUsed] = useState(0);
  const [chatLimit, setChatLimit] = useState(20);
  const [resetAt, setResetAt] = useState(null);
  const [countdown, setCountdown] = useState('');

  const isBlocked = chatUsed >= chatLimit;
  const remaining = Math.max(0, chatLimit - chatUsed);

  useEffect(() => {
    loadHistory();
    loadUsage();
    if (route?.params?.initialMessage) {
      setInput(route.params.initialMessage);
    }
    return () => { sound?.unloadAsync(); };
  }, []);

  // Atualiza o countdown a cada 30 segundos
  useEffect(() => {
    if (!resetAt) return;
    const update = () => setCountdown(formatCountdown(resetAt));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [resetAt]);

  async function loadUsage() {
    try {
      const { data } = await getChatUsage();
      setChatUsed(data.used);
      setChatLimit(data.limit);
      if (data.resetAt) setResetAt(data.resetAt);
    } catch { /* silencia */ }
  }

  async function loadHistory() {
    try {
      const { data } = await getHistory(50);
      if (data.messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Olá, ${user?.name?.split(' ')[0]}! 🌸 Estou aqui, pronta para conversar com você. Como você está se sentindo hoje?`,
          createdAt: new Date().toISOString(),
        }]);
      } else {
        setMessages(data.messages);
      }
    } catch {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Estou aqui para te ouvir. Como você está?',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data } = await sendMessage(text);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (data.used != null) setChatUsed(data.used);
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.error === 'limit_reached') {
        setChatUsed(chatLimit);
        if (err.response.data.resetAt) setResetAt(err.response.data.resetAt);
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      } else {
        Alert.alert('Ops!', err.response?.data?.error || 'Erro ao enviar mensagem.');
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        setInput(text);
      }
    } finally {
      setSending(false);
    }
  }

  async function playAudio(text) {
    try {
      await sound?.unloadAsync();
      const blob = await getVoice(text);
      const uri = URL.createObjectURL(blob);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch {
      Alert.alert('Ops!', 'Não foi possível reproduzir o áudio.');
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  if (loadingHistory) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando conversa...</Text>
      </View>
    );
  }

  if (!subLoading && !isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FDF6F8', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 52, marginBottom: 16 }}>💬</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A0A2E', textAlign: 'center', marginBottom: 10 }}>
          Converse com a Viva
        </Text>
        <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 23, marginBottom: 28 }}>
          Apoio emocional, orientações sobre sintomas e uma companheira disponível 24h para te ouvir sem julgamentos.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#C96A8A', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16 }}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>🔒 Desbloquear com Viva Pro</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{ fontSize: 14, color: '#999' }}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.header}>
        <Text style={styles.headerTitle}>🌸 Viva</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>Disponível 24 horas • com carinho</Text>
          {!isBlocked && remaining <= 5 && (
            <Text style={styles.usageWarning}>⚡ {remaining} msg restante{remaining !== 1 ? 's' : ''}</Text>
          )}
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} onPlayAudio={playAudio} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {sending && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>🌸 Viva está digitando...</Text>
        </View>
      )}

      {isBlocked ? (
        <View style={styles.blockedBanner}>
          <Text style={styles.blockedEmoji}>🌙</Text>
          <View style={styles.blockedInfo}>
            <Text style={styles.blockedTitle}>Suas {chatLimit} mensagens foram usadas</Text>
            <Text style={styles.blockedSub}>
              {countdown ? `Novas mensagens em ${countdown}` : 'Volte em breve para continuar'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Escreva aqui... Estou te ouvindo."
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 15 },
  header: { paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  messagesList: { padding: SPACING.md, paddingBottom: SPACING.lg },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  vivaAvatar: { fontSize: 24 },
  bubble: { maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleViva: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4, ...SHADOW.sm },
  bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.white },
  audioIconBtn: { marginTop: 6, alignSelf: 'flex-end' },
  audioIcon: { fontSize: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  usageWarning: { fontSize: 12, fontWeight: '700', color: '#E65100', backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  typingIndicator: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  typingText: { color: COLORS.textSecondary, fontSize: 13, fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: 15, color: COLORS.text, maxHeight: 120, backgroundColor: COLORS.background },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.primaryLight },
  blockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A0A2E', padding: SPACING.lg,
    borderTopWidth: 1, borderTopColor: 'rgba(201,106,138,0.3)',
  },
  blockedEmoji: { fontSize: 28 },
  blockedInfo: { flex: 1 },
  blockedTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 3 },
  blockedSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  sendIcon: { color: COLORS.white, fontSize: 18 },
});
