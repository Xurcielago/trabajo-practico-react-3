import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { ActionButton, Field, InlineError, Page, Panel } from '../../components/ui';
import { usePermiso } from '../../hooks/usePermiso';
import { useAppState } from '../../lib/app-state';

export default function ScanClassroomScreen() {
  const [cameraPermission] = useCameraPermissions();
  const permission = usePermiso('camara');
  const { draft, updateDraft } = useAppState();
  const [manualCode, setManualCode] = useState(draft.classroom);
  const [cameraError, setCameraError] = useState('');
  const handled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
    }, []),
  );

  const continueToPermission = () =>
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
  const saveManualCode = () => {
    if (!manualCode.trim()) {
      setCameraError('Escribí el código del aula para continuar.');
      return;
    }
    updateDraft({ classroom: manualCode.trim() });
    router.back();
  };

  return (
    <Page title="Aula del reporte" subtitle="Escaneá el QR de la puerta o escribí el aula a mano.">
      {permission.estado === 'cargando' ? (
        <Panel><Text style={{ color: '#65736D' }}>Consultando el estado de la cámara…</Text></Panel>
      ) : permission.estado === 'concedido' && cameraPermission?.granted ? (
        <View style={{ height: 360, borderRadius: 18, overflow: 'hidden' }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (handled.current) return;
              handled.current = true;
              updateDraft({ classroom: data.trim() });
              router.back();
            }}
          />
        </View>
      ) : (
        <Panel>
          {permission.estado === 'bloqueado' ? (
            <>
              <Text style={{ color: '#172923', fontWeight: '700' }}>La cámara está bloqueada</Text>
              <Text style={{ color: '#65736D', lineHeight: 21 }}>
                Podés habilitarla en Ajustes o ingresar el código del aula a mano.
              </Text>
              <ActionButton label="Abrir Ajustes" onPress={() => void permission.abrirAjustes()} />
            </>
          ) : (
            <>
              <Text style={{ color: '#172923', fontWeight: '700' }}>Para escanear necesitamos la cámara</Text>
              <Text style={{ color: '#65736D', lineHeight: 21 }}>
                Se usa solamente para leer el QR del aula. También podés escribir el aula sin conceder el permiso.
              </Text>
              <ActionButton label="Continuar" onPress={continueToPermission} />
            </>
          )}
        </Panel>
      )}
      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      <Panel>
        <Text style={{ color: '#172923', fontWeight: '700' }}>Ingresar código a mano</Text>
        <Field label="Aula" value={manualCode} onChangeText={setManualCode} placeholder="Ej.: A-12" />
        {cameraError ? <InlineError>{cameraError}</InlineError> : null}
        <ActionButton label="Usar este código" secondary onPress={saveManualCode} />
      </Panel>
    </Page>
  );
}
