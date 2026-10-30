import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { ensureReportNotificationChannel } from '../lib/notifications';

export type Recurso = 'camara' | 'fotos' | 'ubicacion' | 'notificaciones';
export type PermissionState = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

type PermissionSnapshot = {
  estado: PermissionState;
  parcial: boolean;
  detalle?: string;
  canAskAgain: boolean;
};

const loadingSnapshot: PermissionSnapshot = {
  estado: 'cargando',
  parcial: false,
  canAskAgain: true,
};

function toPermissionState(granted: boolean, canAskAgain: boolean): PermissionState {
  if (granted) return 'concedido';
  return canAskAgain ? 'preguntable' : 'bloqueado';
}

async function readPermission(recurso: Recurso): Promise<PermissionSnapshot> {
  if (recurso === 'camara') {
    const permission = await Camera.getCameraPermissionsAsync();
    return {
      estado: toPermissionState(permission.granted, permission.canAskAgain),
      parcial: false,
      canAskAgain: permission.canAskAgain,
    };
  }

  if (recurso === 'fotos') {
    const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    const parcial = permission.accessPrivileges === 'limited';
    return {
      estado: 'concedido',
      parcial,
      detalle: parcial
        ? 'accessPrivileges=limited · acceso solo a fotos elegidas.'
        : 'Selector del sistema · no se solicita permiso de galería.',
      canAskAgain: true,
    };
  }

  if (recurso === 'ubicacion') {
    const permission = await Location.getForegroundPermissionsAsync();
    const parcial =
      Platform.OS === 'ios'
        ? permission.ios?.accuracy === 'reduced'
        : Platform.OS === 'android'
          ? permission.android?.accuracy === 'coarse'
          : false;
    return {
      estado: toPermissionState(permission.granted, permission.canAskAgain),
      parcial,
      detalle: parcial
        ? `accuracy=${Platform.OS === 'ios' ? 'reduced' : 'coarse'} · Ubicación aproximada.`
        : permission.granted
          ? `accuracy=${Platform.OS === 'ios' ? permission.ios?.accuracy : permission.android?.accuracy ?? 'fine'}.`
          : undefined,
      canAskAgain: permission.canAskAgain,
    };
  }

  const permission = await Notifications.getPermissionsAsync();
  const provisional =
    Platform.OS === 'ios' &&
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  return {
    estado: toPermissionState(permission.granted || provisional, permission.canAskAgain),
    parcial: provisional,
    detalle: provisional ? 'Notificaciones provisionales.' : undefined,
    canAskAgain: permission.canAskAgain,
  };
}

export function usePermiso(recurso: Recurso) {
  const [snapshot, setSnapshot] = useState<PermissionSnapshot>(loadingSnapshot);
  const [error, setError] = useState<string | null>(null);

  const actualizar = useCallback(async () => {
    setError(null);
    try {
      setSnapshot(await readPermission(recurso));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo consultar el permiso.';
      setError(message);
    }
  }, [recurso]);

  useEffect(() => {
    void actualizar();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void actualizar();
    });
    return () => subscription.remove();
  }, [actualizar]);

  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar]),
  );

  const pedir = useCallback(async () => {
    setError(null);
    try {
      if (recurso === 'camara') {
        await Camera.requestCameraPermissionsAsync();
      } else if (recurso === 'ubicacion') {
        await Location.requestForegroundPermissionsAsync();
      } else if (recurso === 'notificaciones') {
        await ensureReportNotificationChannel();
        await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true, allowProvisional: true },
        });
      } else {
        await readPermission('fotos');
      }
      const next = await readPermission(recurso);
      setSnapshot(next);
      return next;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo solicitar el permiso.';
      setError(message);
      throw cause;
    }
  }, [recurso]);

  const abrirAjustes = useCallback(async () => {
    setError(null);
    try {
      await Linking.openSettings();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudieron abrir los Ajustes.';
      setError(message);
      throw cause;
    }
  }, []);

  return {
    estado: snapshot.estado,
    parcial: snapshot.parcial,
    detalle: snapshot.detalle,
    canAskAgain: snapshot.canAskAgain,
    error,
    pedir,
    abrirAjustes,
    actualizar,
  };
}
