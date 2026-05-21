import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';

const WHATSAPP_URL = 'https://wa.me/5573998419275?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20o%20app%20Viva.';

const FAQ = [
  {
    question: 'Paguei mas não tenho acesso',
    answer: 'Isso pode acontecer quando o pagamento ainda está sendo processado. Aguarde alguns minutos e faça logout e login novamente. Se persistir, fale com a gente no WhatsApp.',
  },
  {
    question: 'O cardápio não carrega',
    answer: 'Tente fechar e abrir o app novamente. Se continuar, pode ser que o servidor esteja gerando seu plano — aguarde 1 minuto e tente de novo.',
  },
  {
    question: 'Como cancelar minha assinatura?',
    answer: 'Você pode cancelar diretamente na plataforma Kiwify onde realizou o pagamento. Acesse kiwify.com.br, entre na sua conta e cancele por lá.',
  },
  {
    question: 'Como funciona o trial?',
    answer: 'Você tem 7 dias grátis para experimentar o app. Após esse período, é necessário assinar por R$47/mês para continuar com acesso completo.',
  },
  {
    question: 'Não consigo fazer login',
    answer: 'Verifique se o email e senha estão corretos. Caso tenha esquecido a senha, entre em contato pelo WhatsApp que a gente te ajuda a redefinir.',
  },
  {
    question: 'O chat da Viva não responde',
    answer: 'O chat usa inteligência artificial e pode ter um pequeno atraso. Se ficar mais de 30 segundos sem resposta, feche e abra novamente.',
  },
];

export default function SupportScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Olá! 🌸 Sou a assistente de suporte da Viva. Como posso te ajudar hoje?' },
  ]);
  const [showFAQ, setShowFAQ] = useState(true);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  function sendFAQ(item) {
    const userMsg = { id: Date.now(), from: 'user', text: item.question };
    const botMsg = { id: Date.now() + 1, from: 'bot', text: item.answer };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setShowFAQ(false);
    setShowWhatsApp(true);
  }

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input.trim() };
    const botMsg = {
      id: Date.now() + 1,
      from: 'bot',
      text: 'Entendi sua dúvida! Infelizmente não tenho uma resposta específica para isso. Para te ajudar melhor, fale com a nossa equipe pelo WhatsApp. 💬',
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    setShowFAQ(false);
    setShowWhatsApp(true);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Suporte Viva</Text>
          <Text style={styles.headerSub}>🟢 Online agora</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ padding: SPACING.md, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.from === 'user' ? styles.bubbleUser : styles.bubbleBot]}
          >
            <Text style={[styles.bubbleText, msg.from === 'user' && styles.bubbleTextUser]}>
              {msg.text}
            </Text>
          </View>
        ))}

        {/* FAQ buttons */}
        {showFAQ && (
          <View style={styles.faqContainer}>
            <Text style={styles.faqLabel}>Escolha uma opção:</Text>
            {FAQ.map((item, i) => (
              <TouchableOpacity key={i} style={styles.faqBtn} onPress={() => sendFAQ(item)}>
                <Text style={styles.faqBtnText}>{item.question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* WhatsApp button */}
        {showWhatsApp && (
          <View style={styles.whatsappContainer}>
            <Text style={styles.whatsappLabel}>Não resolveu?</Text>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => Linking.openURL(WHATSAPP_URL)}
            >
              <Text style={styles.whatsappBtnText}>💬 Falar no WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua dúvida..."
          placeholderTextColor={COLORS.textLight}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>›</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 16,
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 28, color: 'white', fontWeight: '300' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  messages: { flex: 1 },
  bubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.lg,
    padding: 12,
    marginVertical: 2,
  },
  bubbleBot: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextUser: { color: 'white' },
  faqContainer: { marginTop: 8, gap: 8 },
  faqLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  faqBtn: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  faqBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  whatsappContainer: { alignItems: 'center', marginTop: 16, gap: 8 },
  whatsappLabel: { fontSize: 13, color: COLORS.textSecondary },
  whatsappBtn: {
    backgroundColor: '#25D366',
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  whatsappBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0E0EA',
    padding: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F0F4',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: 'white', fontSize: 24, fontWeight: '300', marginTop: -2 },
});
