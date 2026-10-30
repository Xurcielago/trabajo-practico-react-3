import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ActionButton, InlineError, Page, Panel } from '../../components/ui';
import { Recurso, usePermiso } from '../../hooks/usePermiso';
import { useAppState } from '../../lib/app-state';

const resourceInfo: Record<Recurso, { benefit: string; setting: string }> = {
  camara: {
    benefit: 'Usamos tu cámara para leer el QR del aula o sacar una foto del desperfecto.',
    setting: 'Ajustes del dispositivo > Aplicaciones > Mantenimiento IPF > Permisos > Cámara.',
  },
  fotos: {
    benefit: 'El selector del sistema comparte únicamente la foto que elijas, sin permiso de galería.',
    setting: 'No se necesita habilitar acceso a la galería.',
  },
  ubicacion: {
    benefit: 'Usamos tu ubicación en primer plano para señalar dónde está el desperfecto.',
    setting: 'Ajustes del dispositivo > Aplicaciones > Mantenimiento IPF > Permisos > Ubicación.',
  },
  notificaciones: {
    benefit: 'Usamos notificaciones para avisarte cuando se resuelva tu reporte.',
    setting: 'Ajustes del dispositivo > Aplicaciones > Mantenimiento IPF > Notificaciones.',
  },
};

const parseResource = (value: string | string[] | undefined): Recurso | null => {
  const resource = Array.isArray(value) ? value[0] : value;
  return resource && resource in resourceInfo ? (resource as Recurso) : null;
};

export default function PermissionPrePromptScreen() {
  const { recurso: rawResource } = useLocalSearchParams<{ recurso?: string }>();
  const resource = parseResource(rawResource);
  const permission = usePermiso(resource ?? 'camara');
  const { setNotificationsEnabled } = useAppState();
  const [busy, setBusy] = useState(false);

  if (!resource) {
    return (
      <Page title="Recurso no válido">
        <ActionButton label="Volver" onPress={() => router.back()} />
      </Page>
    );
  }

  const info = resourceInfo[resource];
  const continueFlow = async () => {
    if (permission.estado === 'bloqueado') {
      await permission.abrirAjustes();
      return;
    }
    if (resource === 'fotos') {
      router.back();
      return;
    }
    if (permission.estado === 'concedido') {
      if (resource === 'notificaciones') setNotificationsEnabled(true);
      router.back();
      return;
    }

    setBusy(true);
    try {
      const result = await permission.pedir();
      if (resource === 'notificaciones') {
        setNotificationsEnabled(result.estado === 'concedido');
      }
      router.back();
    } catch {
      setBusy(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Antes de continuar" subtitle={info.benefit}>
      <Panel>
        {permission.estado === 'cargando' ? (
          <Text style={{ color: '#65736D' }}>Consultando el estado del permiso…</Text>
        ) : permission.estado === 'bloqueado' ? (
          <>
            <Text style={{ color: '#172923', fontWeight: '700' }}>Este permiso está bloqueado</Text>
            <Text style={{ color: '#65736D', lineHeight: 21 }}>
              Para habilitarlo, abrí {info.setting} Podés cambiar esta opción en cualquier momento desde Ajustes.
            </Text>
            <ActionButton label="Abrir Ajustes" onPress={() => void continueFlow()} loading={busy} />
          </>
        ) : (
          <>
            <Text style={{ color: '#65736D', lineHeight: 21 }}>
              Podés cambiar este permiso en Ajustes cuando quieras.
            </Text>
            <ActionButton label="Continuar" onPress={() => void continueFlow()} loading={busy} />
          </>
        )}
      </Panel>
      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
    </Page>
  );
}
