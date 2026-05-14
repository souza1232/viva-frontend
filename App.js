import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications } from './src/utils/notifications';

function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setupNotifications();
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.webContainer}>
          <StatusBar style="dark" />
          <AppNavigator />
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#f0e6ea',
    alignItems: 'center',
  },
  webContainer: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    backgroundColor: '#FDF6F8',
    overflow: 'hidden',
  },
});

registerRootComponent(App);
