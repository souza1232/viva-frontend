import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import useAuthStore from '../store/useAuthStore';
import { COLORS } from '../theme';
import { Platform } from 'react-native';

// Telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LandingScreen from '../screens/LandingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import FoodScreen from '../screens/FoodScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import SymptomTrackerScreen from '../screens/SymptomTrackerScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Chat: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            Food: focused ? 'nutrition' : 'nutrition-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          height: 65,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Viva' }} />
      <Tab.Screen name="Food" component={FoodScreen} options={{ tabBarLabel: 'Nutrição' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !user?.onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} />
            <Stack.Screen name="SymptomTracker" component={SymptomTrackerScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
