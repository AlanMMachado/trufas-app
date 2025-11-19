import { AppProvider } from '@/contexts/AppContext';
import { initDatabase } from '@/database/db';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    // Inicializa o banco de dados
    initDatabase();
  }, []);
  
  return (
    <PaperProvider>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="vendas/NovaVendaScreen" options={{ headerShown: false }} />
            <Stack.Screen name="remessas/NovaRemessaScreen" options={{ headerShown: false }} />
            <Stack.Screen name="remessas/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </PaperProvider>
  );
}
