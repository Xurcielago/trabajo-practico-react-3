import { Text, View } from 'react-native';

import { Page, Panel } from '../../components/ui';
import { useAppState } from '../../lib/app-state';

export default function NoticesScreen() {
  const { notices } = useAppState();

  return (
    <Page title="Avisos" subtitle="La bandeja dentro de la app también está disponible si no usás notificaciones.">
      {notices.length === 0 ? (
        <Panel>
          <Text style={{ color: '#172923', fontWeight: '700' }}>Sin avisos por ahora</Text>
          <Text style={{ color: '#65736D' }}>Las novedades de tus reportes aparecerán acá.</Text>
        </Panel>
      ) : (
        <View style={{ gap: 12 }}>
          {notices.map((notice) => (
            <Panel key={notice.id}>
              <Text style={{ color: '#172923', fontSize: 16, fontWeight: '700' }}>{notice.title}</Text>
              <Text style={{ color: '#65736D', lineHeight: 21 }}>{notice.message}</Text>
              <Text style={{ color: '#65736D', fontSize: 12 }}>
                {new Date(notice.createdAt).toLocaleString()}
              </Text>
            </Panel>
          ))}
        </View>
      )}
    </Page>
  );
}
