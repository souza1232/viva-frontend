import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPosts, createPost, replyPost } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

const THEMES = {
  corpo: { label: 'O Corpo', emoji: '🌿', color: '#6BAE75' },
  mente: { label: 'A Mente', emoji: '💭', color: '#7B6EA8' },
  vida_pratica: { label: 'Vida Prática', emoji: '🌟', color: '#E8A87C' },
  reinvencao: { label: 'Reinvenção', emoji: '🦋', color: COLORS.primary },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function PostCard({ post, onReply, currentUserId }) {
  const theme = THEMES[post.theme] || THEMES.corpo;
  const [showReplies, setShowReplies] = useState(false);

  return (
    <View style={[styles.postCard, SHADOW.sm]}>
      <View style={styles.postHeader}>
        <View style={[styles.themePill, { backgroundColor: theme.color + '22' }]}>
          <Text style={styles.themeEmoji}>{theme.emoji}</Text>
          <Text style={[styles.themeLabel, { color: theme.color }]}>{theme.label}</Text>
        </View>
        <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
      </View>

      <Text style={styles.posterName}>{post.user.name.split(' ')[0]}</Text>
      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postFooter}>
        <TouchableOpacity onPress={() => setShowReplies(!showReplies)} style={styles.repliesBtn}>
          <Text style={styles.repliesBtnText}>
            💬 {post._count?.replies || post.replies?.length || 0} respostas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onReply(post)} style={styles.replyBtn}>
          <Text style={styles.replyBtnText}>Responder</Text>
        </TouchableOpacity>
      </View>

      {showReplies && post.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {post.replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <Text style={styles.replyName}>{reply.user.name.split(' ')[0]}</Text>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <Text style={styles.replyTime}>{timeAgo(reply.createdAt)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CommunityScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    try {
      const { data } = await getPosts();
      setPosts(data.posts);
      setCurrentTheme(data.currentTheme);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a comunidade.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleSubmitPost() {
    if (!postContent.trim()) return;
    setSubmitting(true);
    try {
      if (replyTarget) {
        await replyPost(replyTarget.id, postContent.trim());
      } else {
        await createPost({ content: postContent.trim() });
      }
      setPostContent('');
      setShowNewPost(false);
      setReplyTarget(null);
      await loadPosts();
    } catch (err) {
      Alert.alert('Ops!', err.response?.data?.error || 'Erro ao publicar.');
    } finally {
      setSubmitting(false);
    }
  }

  const themeInfo = THEMES[currentTheme] || THEMES.corpo;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.header}>
        <Text style={styles.headerTitle}>👭 Comunidade</Text>
        <View style={[styles.weekTheme, { borderColor: themeInfo.color }]}>
          <Text style={styles.weekThemeEmoji}>{themeInfo.emoji}</Text>
          <Text style={[styles.weekThemeText, { color: themeInfo.color }]}>
            Esta semana: {themeInfo.label}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.id}
            onReply={(post) => {
              setReplyTarget(post);
              setShowNewPost(true);
            }}
          />
        )}
        contentContainerStyle={styles.list}
        onRefresh={() => { setRefreshing(true); loadPosts(); }}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyTitle}>Seja a primeira a compartilhar!</Text>
            <Text style={styles.emptyText}>Conta pra gente como está sendo esta semana.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setReplyTarget(null); setShowNewPost(true); }}>
        <Text style={styles.fabText}>+ Compartilhar</Text>
      </TouchableOpacity>

      <Modal visible={showNewPost} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {replyTarget ? `Responder: ${replyTarget.user.name.split(' ')[0]}` : 'Compartilhar com a comunidade'}
              </Text>
              <TouchableOpacity onPress={() => { setShowNewPost(false); setReplyTarget(null); setPostContent(''); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {replyTarget && (
              <View style={styles.replyPreview}>
                <Text style={styles.replyPreviewText} numberOfLines={2}>{replyTarget.content}</Text>
              </View>
            )}

            <TextInput
              style={styles.postInput}
              placeholder={replyTarget ? 'Sua resposta...' : 'Compartilhe como você está se sentindo...'}
              placeholderTextColor={COLORS.textLight}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              maxLength={2000}
              autoFocus
            />

            <Text style={styles.charCount}>{postContent.length}/2000</Text>

            <TouchableOpacity
              style={[styles.submitBtn, (!postContent.trim() || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmitPost}
              disabled={!postContent.trim() || submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Publicando...' : 'Publicar'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  weekTheme: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' },
  weekThemeEmoji: { fontSize: 16 },
  weekThemeText: { fontSize: 14, fontWeight: '700' },
  list: { padding: SPACING.md, paddingBottom: 100 },
  postCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  themePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  themeEmoji: { fontSize: 12 },
  themeLabel: { fontSize: 12, fontWeight: '700' },
  postTime: { fontSize: 12, color: COLORS.textLight },
  posterName: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.md },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  repliesBtn: { padding: 4 },
  repliesBtnText: { color: COLORS.textSecondary, fontSize: 13 },
  replyBtn: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6 },
  replyBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  repliesContainer: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, gap: 10 },
  replyCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm },
  replyName: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginBottom: 2 },
  replyContent: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  replyTime: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 90, right: SPACING.lg, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, ...SHADOW.md },
  fabText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
  closeBtn: { fontSize: 20, color: COLORS.textLight, padding: 4 },
  replyPreview: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  replyPreviewText: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  postInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: 15, color: COLORS.text, minHeight: 120, textAlignVertical: 'top', backgroundColor: COLORS.background },
  charCount: { fontSize: 12, color: COLORS.textLight, textAlign: 'right', marginTop: 4, marginBottom: SPACING.md },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
