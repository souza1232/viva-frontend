import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api, { getMealPlan } from '../services/api';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';
import useSubscription from '../hooks/useSubscription';

const MEAL_ICONS = { cafe: '☀️', almoco: '🥗', jantar: '🌙', lanche: '🍎' };
const MEAL_LABELS = { cafe: 'Café da Manhã', almoco: 'Almoço', jantar: 'Jantar', lanche: 'Lanche' };
const WEEKS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

function getTodayDayNumber() {
  return new Date().getDate();
}

function getCurrentMealType() {
  const hour = new Date().getHours();
  if (hour < 10) return 'cafe';
  if (hour < 14) return 'almoco';
  if (hour < 17) return 'lanche';
  return 'jantar';
}

function getMealTimeLabel(type) {
  const labels = {
    cafe: 'Café da Manhã • até 10h',
    almoco: 'Almoço • 10h–14h',
    lanche: 'Lanche • 14h–17h',
    jantar: 'Jantar • a partir das 17h',
  };
  return labels[type];
}

function MealCard({ type, meal, expanded, onToggle, isCurrent, isPast }) {
  return (
    <TouchableOpacity
      style={[styles.mealCard, isCurrent && styles.mealCardCurrent, isPast && styles.mealCardPast]}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View style={styles.mealCardHeader}>
        <Text style={styles.mealCardIcon}>{MEAL_ICONS[type]}</Text>
        <View style={styles.mealCardInfo}>
          <Text style={[styles.mealCardType, isPast && styles.textPast]}>{MEAL_LABELS[type]}{isCurrent ? ' — Agora' : ''}</Text>
          <Text style={[styles.mealCardName, isPast && styles.textPast]} numberOfLines={expanded ? 0 : 1}>{meal.name}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {expanded && (
        <View style={styles.mealCardDetails}>
          <Text style={styles.detailLabel}>Ingredientes:</Text>
          {meal.ingredients?.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>• {ing}</Text>
          ))}
          <Text style={[styles.detailLabel, { marginTop: 10 }]}>Como preparar:</Text>
          <Text style={styles.prep}>{meal.prep}</Text>
          <View style={styles.benefitBadge}>
            <Text style={styles.benefitText}>💚 {meal.benefit}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function NutrientBar({ label, level }) {
  const colors = { alto: '#6BAE75', médio: '#E8A87C', baixo: '#D05555' };
  const widths = { alto: '90%', médio: '55%', baixo: '25%' };
  const color = colors[level] || COLORS.textLight;
  return (
    <View style={styles.nutrientRow}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <View style={styles.nutrientBarBg}>
        <View style={[styles.nutrientBarFill, { width: widths[level] || '0%', backgroundColor: color }]} />
      </View>
      <Text style={[styles.nutrientLevel, { color }]}>{level || '?'}</Text>
    </View>
  );
}

function AnalysisResult({ result, onClose }) {
  return (
    <Modal visible={!!result} animationType="slide" transparent={false}>
      <View style={styles.resultContainer}>
        <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.resultHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeResultBtn}>
            <Text style={styles.closeResultText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.resultTitle}>🌸 Análise da Viva</Text>
          <Text style={styles.resultMealType}>{result?.mealType}</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.caloriesRow}>
            <View style={styles.caloriesCard}>
              <Text style={styles.caloriesNumber}>{result?.calories ?? '~'}</Text>
              <Text style={styles.caloriesLabel}>calorias</Text>
            </View>
            <View style={[styles.menoCard, { backgroundColor: result?.isGoodForMeno ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={styles.menoEmoji}>{result?.isGoodForMeno ? '✅' : '⚠️'}</Text>
              <Text style={[styles.menoText, { color: result?.isGoodForMeno ? '#6BAE75' : '#E8A87C' }]}>
                {result?.isGoodForMeno ? 'Ótimo para\na menopausa' : 'Atenção para\na menopausa'}
              </Text>
            </View>
          </View>
          <View style={styles.vivaCard}>
            <Text style={styles.vivaCardTitle}>🌸 O que a Viva diz</Text>
            <Text style={styles.vivaCardText}>{result?.fullAnalysis}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ O que eu identifiquei</Text>
            <Text style={styles.mealDesc}>{result?.mealDescription}</Text>
          </View>
          {result?.nutrients && Object.keys(result.nutrients).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Nutrientes</Text>
              {result.nutrients.proteina && <NutrientBar label="Proteína" level={result.nutrients.proteina} />}
              {result.nutrients.calcio && <NutrientBar label="Cálcio" level={result.nutrients.calcio} />}
              {result.nutrients.fibras && <NutrientBar label="Fibras" level={result.nutrients.fibras} />}
              {result.nutrients.acucar && <NutrientBar label="Açúcar" level={result.nutrients.acucar} />}
            </View>
          )}
          {result?.benefits?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💚 Benefícios para você</Text>
              {result.benefits.map((b, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listDotGreen}>✓</Text>
                  <Text style={styles.listText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
          {result?.warnings?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Pontos de atenção</Text>
              {result.warnings.map((w, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listDotOrange}>!</Text>
                  <Text style={styles.listText}>{w}</Text>
                </View>
              ))}
            </View>
          )}
          {result?.suggestions?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Sugestões da Viva</Text>
              {result.suggestions.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listDotPurple}>→</Text>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function MealHistoryItem({ meal }) {
  const hour = new Date(meal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyEmoji}>{meal.isGoodForMeno ? '✅' : '⚠️'}</Text>
        <View>
          <Text style={styles.historyMeal} numberOfLines={1}>{meal.mealDescription}</Text>
          <Text style={styles.historyMeta}>{meal.mealType} · {hour}</Text>
        </View>
      </View>
      {meal.calories && (
        <View style={styles.historyCalories}>
          <Text style={styles.historyCaloriesNum}>{meal.calories}</Text>
          <Text style={styles.historyCaloriesLabel}>kcal</Text>
        </View>
      )}
    </View>
  );
}

export default function FoodScreen({ navigation }) {
  const { isPremium, loading: subLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState('plan');

  // Plano
  const [mealPlan, setMealPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(getTodayDayNumber());
  const [expandedMeal, setExpandedMeal] = useState(getCurrentMealType());

  // Análise
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadPlan();
    loadHistory();
  }, []);

  async function loadPlan(refresh = false) {
    try {
      if (refresh) setRefreshingPlan(true);
      else setLoadingPlan(true);
      const { data } = await getMealPlan(refresh);
      setMealPlan(data);
    } catch {
      Alert.alert('Ops!', 'Não foi possível carregar o cardápio. Verifique sua conexão.');
    } finally {
      setLoadingPlan(false);
      setRefreshingPlan(false);
    }
  }

  async function loadHistory() {
    try {
      const [histRes, todayRes] = await Promise.all([
        api.get('/ai/food/history', { params: { limit: 10 } }),
        api.get('/ai/food/today'),
      ]);
      setHistory(histRes.data.meals);
      setTodaySummary(todayRes.data);
    } catch {
      // silencia
    } finally {
      setLoadingHistory(false);
    }
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, base64: true, allowsEditing: true, aspect: [4, 3],
    });
    if (!res.canceled && res.assets[0]) await analyzeImage(res.assets[0]);
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, base64: true, allowsEditing: true, aspect: [4, 3],
    });
    if (!res.canceled && res.assets[0]) await analyzeImage(res.assets[0]);
  }

  async function analyzeImage(asset) {
    if (!asset.base64) { Alert.alert('Erro', 'Não foi possível processar a imagem.'); return; }
    setSelectedImage(asset.uri);
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/food', { imageBase64: asset.base64, mediaType: asset.mimeType || 'image/jpeg' });
      setResult(data);
      await loadHistory();
    } catch (err) {
      Alert.alert('Ops!', err.response?.data?.error || 'Erro ao analisar a foto.');
      setSelectedImage(null);
    } finally {
      setAnalyzing(false);
    }
  }

  const todayDayNumber = getTodayDayNumber();
  const currentMealType = getCurrentMealType();
  const currentDay = mealPlan?.days?.find(d => d.dayNumber === selectedDayNumber);
  const isToday = selectedDayNumber === todayDayNumber;

  if (!subLoading && !isPremium) {
    return (
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🥗</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A0A2E', textAlign: 'center', marginBottom: 10 }}>
          Cardápio personalizado
        </Text>
        <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 23, marginBottom: 28 }}>
          Receitas e plano semanal adaptados à menopausa, com análise de fotos das suas refeições.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#C96A8A', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40 }}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>🔒 Desbloquear com Viva Pro</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FDF6F8', '#F5E6EF']} style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Nutrição</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
            onPress={() => setActiveTab('plan')}
          >
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>Meu Plano</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analyze' && styles.tabActive]}
            onPress={() => setActiveTab('analyze')}
          >
            <Text style={[styles.tabText, activeTab === 'analyze' && styles.tabTextActive]}>Analisar Foto</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {activeTab === 'plan' ? (
        loadingPlan ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>A Viva está preparando{'\n'}seu cardápio de 30 dias... 🌸</Text>
            <Text style={styles.loadingSubText}>Isso pode levar alguns segundos</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Data */}
            <View style={styles.todayHeader}>
              <Text style={styles.todayHeaderDate}>
                {isToday ? 'Hoje, ' : ''}{new Date(new Date().getFullYear(), new Date().getMonth(), selectedDayNumber).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              {isToday && (
                <View style={styles.currentMealBadge}>
                  <Text style={styles.currentMealBadgeText}>
                    🕐 Agora: {MEAL_LABELS[currentMealType]}
                  </Text>
                </View>
              )}
            </View>

            {/* Refeições do dia */}
            {currentDay ? (
              ['cafe', 'almoco', 'lanche', 'jantar'].map(type => {
                const isPast = isToday && (
                  (type === 'cafe' && currentMealType !== 'cafe') ||
                  (type === 'almoco' && ['lanche', 'jantar'].includes(currentMealType)) ||
                  (type === 'lanche' && currentMealType === 'jantar')
                );
                const isCurrent = isToday && type === currentMealType;
                return currentDay.meals?.[type] ? (
                  <MealCard
                    key={type}
                    type={type}
                    meal={currentDay.meals[type]}
                    expanded={expandedMeal === type}
                    onToggle={() => setExpandedMeal(expandedMeal === type ? null : type)}
                    isCurrent={isCurrent}
                    isPast={isPast}
                  />
                ) : null;
              })
            ) : (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>Carregando cardápio...</Text>
              </View>
            )}

            {/* Navegador de outros dias */}
            <Text style={styles.otherDaysTitle}>Outros dias do mês</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
              {mealPlan?.days?.map((d, i) => {
                const isDayToday = d.dayNumber === todayDayNumber;
                const isSelected = selectedDayNumber === d.dayNumber;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.dayBtn, isSelected && styles.dayBtnActive, isDayToday && !isSelected && styles.dayBtnToday]}
                    onPress={() => { setSelectedDayNumber(d.dayNumber); setExpandedMeal(getCurrentMealType()); }}
                  >
                    <Text style={[styles.dayBtnText, isSelected && styles.dayBtnTextActive]}>
                      {d.dayName?.substring(0, 3)}
                    </Text>
                    <Text style={[styles.dayBtnNum, isSelected && styles.dayBtnTextActive]}>{d.dayNumber}</Text>
                    {isDayToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => loadPlan(true)}
              disabled={refreshingPlan}
            >
              {refreshingPlan
                ? <ActivityIndicator color={COLORS.primary} size="small" />
                : <Text style={styles.refreshBtnText}>🔄 Gerar novo cardápio</Text>
              }
            </TouchableOpacity>

            <View style={{ height: 80 }} />
          </ScrollView>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {todaySummary?.count > 0 && (
            <View style={[styles.todayCard, SHADOW.sm]}>
              <Text style={styles.todayTitle}>Hoje</Text>
              <View style={styles.todayStats}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatNum}>{todaySummary.count}</Text>
                  <Text style={styles.todayStatLabel}>refeições</Text>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStat}>
                  <Text style={styles.todayStatNum}>{todaySummary.totalCalories}</Text>
                  <Text style={styles.todayStatLabel}>calorias</Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.analysisArea, SHADOW.md]}>
            {analyzing ? (
              <View style={styles.analyzingState}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.analyzingText}>A Viva está analisando sua refeição...</Text>
                <Text style={styles.analyzingSubText}>Isso leva alguns segundos 🌸</Text>
              </View>
            ) : selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyTitle}>Fotografe sua refeição</Text>
                <Text style={styles.emptyText}>A Viva identifica o que você está comendo e diz se é bom para a sua fase</Text>
              </View>
            )}
            {!analyzing && (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.cameraBtn} onPress={pickFromCamera}>
                  <Text style={styles.cameraBtnEmoji}>📷</Text>
                  <Text style={styles.cameraBtnText}>Câmera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                  <Text style={styles.galleryBtnEmoji}>🖼️</Text>
                  <Text style={styles.galleryBtnText}>Galeria</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Dica da Viva</Text>
            <Text style={styles.tipText}>Na menopausa, priorize cálcio, proteína e fitoestrogênios. Evite açúcar e ultraprocessados que pioram fogachos.</Text>
          </View>

          {!loadingHistory && history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>Refeições recentes</Text>
              {history.map(meal => <MealHistoryItem key={meal.id} meal={meal} />)}
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {result && <AnalysisResult result={result} onClose={() => { setResult(null); setSelectedImage(null); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },

  tabs: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: RADIUS.full, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.full },
  tabActive: { backgroundColor: COLORS.white },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },

  scroll: { padding: SPACING.md },

  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, padding: SPACING.xl },
  loadingText: { fontSize: 16, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 24 },
  loadingSubText: { fontSize: 13, color: COLORS.textSecondary },

  todayHeader: { marginBottom: SPACING.md },
  todayHeaderDate: { fontSize: 20, fontWeight: '800', color: COLORS.text, textTransform: 'capitalize' },
  currentMealBadge: { marginTop: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  currentMealBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  mealCardCurrent: { borderWidth: 2, borderColor: COLORS.primary },
  mealCardPast: { opacity: 0.5 },
  textPast: { color: COLORS.textLight },

  otherDaysTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  noDataCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  noDataText: { fontSize: 14, color: COLORS.textSecondary },

  dayScroll: { marginBottom: SPACING.md },
  dayScrollContent: { gap: 8, paddingHorizontal: 2 },
  dayBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, alignItems: 'center', minWidth: 46, ...SHADOW.sm },
  dayBtnActive: { backgroundColor: COLORS.primary },
  dayBtnToday: { borderWidth: 2, borderColor: COLORS.primary },
  dayBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  dayBtnNum: { fontSize: 15, fontWeight: '800', color: COLORS.textSecondary, marginTop: 1 },
  dayBtnTextActive: { color: COLORS.white },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
  todayDotActive: { backgroundColor: COLORS.white },

  dayTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },

  mealCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 10, ...SHADOW.sm },
  mealCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealCardIcon: { fontSize: 26 },
  mealCardInfo: { flex: 1 },
  mealCardType: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  mealCardName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  chevron: { fontSize: 12, color: COLORS.textLight },

  mealCardDetails: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  detailLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  ingredient: { fontSize: 14, color: COLORS.text, lineHeight: 22, paddingLeft: 4 },
  prep: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  benefitBadge: { backgroundColor: '#E8F5E9', borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: 10 },
  benefitText: { fontSize: 13, color: '#388E3C', fontWeight: '600', lineHeight: 20 },

  refreshBtn: { marginTop: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.full, paddingVertical: 12, alignItems: 'center' },
  refreshBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  todayCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  todayStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  todayStat: { alignItems: 'center' },
  todayStatNum: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  todayStatLabel: { fontSize: 12, color: COLORS.textSecondary },
  todayDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  analysisArea: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, minHeight: 220, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.lg },
  emptyEmoji: { fontSize: 52, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  analyzingState: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.md },
  analyzingText: { fontSize: 16, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  analyzingSubText: { fontSize: 14, color: COLORS.textSecondary },
  previewImage: { width: '100%', height: 200, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  photoButtons: { flexDirection: 'row', gap: 12, marginTop: SPACING.md },
  cameraBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  cameraBtnEmoji: { fontSize: 18 },
  cameraBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  galleryBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  galleryBtnEmoji: { fontSize: 18 },
  galleryBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },

  tipCard: { backgroundColor: '#FFF8E7', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#B8860B', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#7A6000', lineHeight: 20 },

  historySection: { marginTop: SPACING.sm },
  historySectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  historyCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOW.sm },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  historyEmoji: { fontSize: 22 },
  historyMeal: { fontSize: 14, fontWeight: '600', color: COLORS.text, maxWidth: 200 },
  historyMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  historyCalories: { alignItems: 'center' },
  historyCaloriesNum: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  historyCaloriesLabel: { fontSize: 10, color: COLORS.textSecondary },

  resultContainer: { flex: 1, backgroundColor: COLORS.background },
  resultHeader: { paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  closeResultBtn: { alignSelf: 'flex-start', marginBottom: SPACING.sm },
  closeResultText: { fontSize: 20, color: COLORS.textLight },
  resultTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  resultMealType: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  resultScroll: { padding: SPACING.md },
  caloriesRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.md },
  caloriesCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  caloriesNumber: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  caloriesLabel: { fontSize: 14, color: COLORS.textSecondary },
  menoCard: { flex: 1.2, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', gap: 4 },
  menoEmoji: { fontSize: 28 },
  menoText: { fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  vivaCard: { backgroundColor: '#FFF0F5', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  vivaCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  vivaCardText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  mealDesc: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  nutrientLabel: { width: 70, fontSize: 13, color: COLORS.textSecondary },
  nutrientBarBg: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  nutrientBarFill: { height: '100%', borderRadius: 4 },
  nutrientLevel: { width: 50, fontSize: 12, fontWeight: '600', textAlign: 'right', textTransform: 'capitalize' },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  listDotGreen: { fontSize: 14, color: '#6BAE75', fontWeight: '700', marginTop: 2 },
  listDotOrange: { fontSize: 14, color: '#E8A87C', fontWeight: '700', marginTop: 2 },
  listDotPurple: { fontSize: 14, color: COLORS.secondary, fontWeight: '700', marginTop: 2 },
  listText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 21 },
});
