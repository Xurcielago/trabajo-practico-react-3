import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Text } from 'react-native';

import { ActionButton, InlineError, Page, Panel } from '../../components/ui';
import { usePermiso } from '../../hooks/usePermiso';
import { useAppState } from '../../lib/app-state';
import { scheduleResolutionNotification } from '../../lib/notifications';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, updateReportStatus, addNotice, notificationsEnabled } = useAppState();
  const permission = usePermiso('notificaciones');
  const [error, setError] = useState('');
  const report = reports.find((item) => item.id === id);

  if (!report) {
    return (
      <Page title="Reporte no encontrado">
        <Text style={{ color: '#65736D', lineHeight: 22 }}>
          No existe un reporte con ese identificador. Puede que ya no esté disponible en esta sesión.
        </Text>
        <ActionButton label="Volver a Reportes" onPress={() => router.replace('/')} />
      </Page>
    );
  }

  const simulateResolution = async () => {
    setError('');
    updateReportStatus(report.id, 'resuelto');
    addNotice('Reporte resuelto', `Se resolvió el desperfecto “${report.title}”.`);
    if (notificationsEnabled && permission.estado === 'concedido') {
      try {
        await scheduleResolutionNotification(report.title);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo programar la notificación.');
      }
    }
  };

  return (
    <Page title={report.title} subtitle={`Estado: ${report.status}`}>
      <Panel>
        <Text style={{ color: '#176B5B', fontWeight: '700', textTransform: 'capitalize' }}>{report.category}</Text>
        <Text style={{ color: '#172923', lineHeight: 22 }}>{report.description}</Text>
        <Text style={{ color: '#65736D' }}>Aula: {report.classroom}</Text>
        {report.location?.approximate ? (
          <Text style={{ color: '#65736D' }}>Ubicación aproximada</Text>
        ) : report.location?.latitude !== undefined && report.location.longitude !== undefined ? (
          <Text style={{ color: '#65736D' }}>
            Ubicación: {report.location.latitude.toFixed(5)}, {report.location.longitude.toFixed(5)}
          </Text>
        ) : report.location?.sector ? (
          <Text style={{ color: '#65736D' }}>Sector: {report.location.sector}</Text>
        ) : (
          <Text style={{ color: '#65736D' }}>Sin ubicación agregada.</Text>
        )}
        {report.photoUri ? (
          <Image source={{ uri: report.photoUri }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
        ) : (
          <Text style={{ color: '#65736D' }}>Sin foto adjunta.</Text>
        )}
      </Panel>
      {report.status !== 'resuelto' ? (
        <ActionButton label="Simular resolución" onPress={() => void simulateResolution()} />
      ) : null}
      <Text style={{ color: '#65736D', lineHeight: 20 }}>
        La notificación de prueba se programa para dentro de 10 segundos cuando está habilitada. El aviso también queda en la bandeja de la app.
      </Text>
      {error ? <InlineError>{error}</InlineError> : null}
    </Page>
  );
}
