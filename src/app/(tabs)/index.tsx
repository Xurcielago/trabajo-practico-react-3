import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ReportCard } from '../../components/ReportCard';
import { ActionButton, Page, Panel } from '../../components/ui';
import { useAppState } from '../../lib/app-state';

export default function ReportsScreen() {
  const { reports } = useAppState();

  return (
    <Page title="Mantenimiento IPF" subtitle="Tus reportes y el avance de cada desperfecto.">
      <ActionButton label="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />
      {reports.length === 0 ? (
        <Panel>
          <Text style={{ color: '#172923', fontSize: 17, fontWeight: '700' }}>Todavía no hay reportes</Text>
          <Text style={{ color: '#65736D', lineHeight: 21 }}>
            Cuando informes un desperfecto, vas a poder seguir su estado desde acá.
          </Text>
        </Panel>
      ) : (
        <View style={{ gap: 12 }}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: report.id } })}
            />
          ))}
        </View>
      )}
    </Page>
  );
}
