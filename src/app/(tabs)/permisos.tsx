import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Page, Panel } from '../../components/ui';
import { PermissionState, Recurso, usePermiso } from '../../hooks/usePermiso';

const resources: { key: Recurso; label: string }[] = [
  { key: 'camara', label: 'Cámara' },
  { key: 'fotos', label: 'Fotos (selector del sistema)' },
  { key: 'ubicacion', label: 'Ubicación' },
  { key: 'notificaciones', label: 'Notificaciones' },
];

function stateLabel(state: PermissionState) {
  return {
    cargando: 'Cargando',
    concedido: 'Concedido',
    preguntable: 'Preguntable',
    bloqueado: 'Bloqueado',
  }[state];
}

function PermissionRow({ resource, label }: { resource: Recurso; label: string }) {
  const permission = usePermiso(resource);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso: resource } })}
      style={styles.row}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.resource}>{label}</Text>
        <Text style={styles.detail}>
          {permission.error ?? permission.detalle ?? `Plataforma: ${Platform.OS}`}
        </Text>
      </View>
      <Text style={styles.state}>{stateLabel(permission.estado)}</Text>
    </Pressable>
  );
}

export default function PermissionsScreen() {
  return (
    <Page title="Permisos" subtitle={`Estado informado por el sistema · plataforma ${Platform.OS}.`}>
      <Panel>
        {resources.map((resource) => (
          <PermissionRow key={resource.key} resource={resource.key} label={resource.label} />
        ))}
      </Panel>
      <ActionButton label="Ajustes de la app" secondary onPress={() => router.push('/ajustes-app')} />
    </Page>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resource: { color: '#172923', fontWeight: '700', fontSize: 15 },
  detail: { color: '#65736D', fontSize: 12 },
  state: { color: '#176B5B', fontWeight: '700', fontSize: 12 },
});
