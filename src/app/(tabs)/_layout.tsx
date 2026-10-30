import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#F5F8F6' },
        headerTintColor: '#176B5B',
        tabBarActiveTintColor: '#176B5B',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Reportes', tabBarLabel: 'Reportes' }} />
      <Tabs.Screen name="avisos" options={{ title: 'Avisos', tabBarLabel: 'Avisos' }} />
      <Tabs.Screen name="permisos" options={{ title: 'Permisos', tabBarLabel: 'Permisos' }} />
    </Tabs>
  );
}
