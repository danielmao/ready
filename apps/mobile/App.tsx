import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from './src/app/providers/QueryProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryProvider>
  );
}
