import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/providers/AuthProvider';
import { QueryProvider } from './src/providers/QueryProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
