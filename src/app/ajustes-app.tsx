import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, Text } from 'react-native';

import { ActionButton, InlineError, Page, Panel } from '../components/ui';
import { usePermiso } from '../hooks/usePermiso';
import { useAppState } from '../lib/app-state';

export default function AppSettingsScreen() {
  const { notificationsEnabled, setNotificationsEnabled } = useAppState();
  const permission = usePermiso('notificaciones');
  const [error, setError] = useState('');

  const toggleNotifications = () => {
    setError('');
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else if (permission.estado === 'concedido') {
      setNotificationsEnabled(true);
    } else {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
    }
  };

  return (
    <Page title="Ajustes de la app">
      <Panel>
        <Text style={{ color: '#172923', fontWeight: '700', fontSize: 16 }}>
          Avisarme cuando se resuelva mi reporte
        </Text>
        <Switch
          accessibilityLabel="Avisarme cuando se resuelva mi reporte"
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#CAD5CF', true: '#176B5B' }}
        />
        <Text style={{ color: '#65736D', lineHeight: 21 }}>
          El permiso de notificaciones se solicita únicamente al activar esta opción. Los avisos también quedan en la bandeja de la app.
        </Text>
        <Text style={{ color: '#65736D' }}>
          Estado del sistema: {permission.estado}{permission.detalle ? ` · ${permission.detalle}` : ''}
        </Text>
      </Panel>
      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      {error ? <InlineError>{error}</InlineError> : null}
      <ActionButton label="Volver a reportes" secondary onPress={() => router.replace('/')} />
    </Page>
  );
}
