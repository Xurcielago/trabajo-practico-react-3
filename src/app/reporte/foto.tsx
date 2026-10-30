import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { ActionButton, InlineError, Page, Panel } from '../../components/ui';
import { usePermiso } from '../../hooks/usePermiso';
import { useAppState } from '../../lib/app-state';

export default function ReportPhotoScreen() {
  const permission = usePermiso('camara');
  const { draft, updateDraft } = useAppState();
  const camera = useRef<CameraView>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (permission.estado === 'concedido' && showCamera) setCameraReady(false);
    }, [permission.estado, showCamera]),
  );

  useEffect(() => {
    if (showCamera && permission.estado === 'bloqueado') {
      setShowCamera(false);
      setError('La cámara está bloqueada. Podés elegir una foto del selector del sistema.');
    }
  }, [permission.estado, showCamera]);

  const chooseFromSystem = async () => {
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        updateDraft({ photoUri: result.assets[0].uri });
        router.back();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo abrir el selector de fotos.');
    }
  };

  const takePhoto = async () => {
    setError('');
    try {
      const result = await camera.current?.takePictureAsync({ quality: 0.8 });
      if (result?.uri) {
        updateDraft({ photoUri: result.uri });
        setShowCamera(false);
        router.back();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo sacar la foto.');
    }
  };

  const openCamera = () => {
    if (permission.estado === 'concedido') {
      setShowCamera(true);
    } else {
      setShowCamera(true);
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
    }
  };

  return (
    <Page title="Adjuntar foto" subtitle="Elegí cómo querés mostrar el desperfecto.">
      {showCamera && permission.estado === 'concedido' ? (
        <View style={{ height: 420, borderRadius: 18, overflow: 'hidden', gap: 12 }}>
          <CameraView
            ref={camera}
            style={{ flex: 1 }}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />
          <ActionButton label="Sacar foto" onPress={() => void takePhoto()} disabled={!cameraReady} />
          <ActionButton label="Cancelar cámara" onPress={() => setShowCamera(false)} secondary />
        </View>
      ) : (
        <Panel>
          <ActionButton label="Sacar foto" onPress={openCamera} />
          <ActionButton label="Elegir de la galería" onPress={() => void chooseFromSystem()} secondary />
          <Text style={{ color: '#65736D', lineHeight: 20 }}>
            El selector del sistema solo comparte la foto que elijas; la app no solicita acceso a toda la galería.
          </Text>
        </Panel>
      )}
      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      {error ? <InlineError>{error}</InlineError> : null}
      {draft.photoUri ? (
        <Panel>
          <Text style={{ color: '#172923', fontWeight: '700' }}>Foto adjunta</Text>
          <Image source={{ uri: draft.photoUri }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
        </Panel>
      ) : null}
    </Page>
  );
}
