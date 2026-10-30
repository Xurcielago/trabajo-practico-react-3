import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActionButton, InlineError, Page, Panel } from '../../components/ui';
import { usePermiso } from '../../hooks/usePermiso';
import { useAppState } from '../../lib/app-state';
import { ReportLocation } from '../../lib/types';

const sectors = ['Patio', 'Estacionamiento', 'Pasillo'];

export default function ReportLocationScreen() {
  const permission = usePermiso('ubicacion');
  const { updateDraft } = useAppState();
  const [error, setError] = useState('');
  const [requestWhenReady, setRequestWhenReady] = useState(false);
  const [selectedSector, setSelectedSector] = useState('');

  const saveCurrentLocation = useCallback(async () => {
    setError('');
    try {
      if (permission.parcial) {
        updateDraft({ location: { approximate: true, sector: 'Ubicación aproximada' } });
      } else {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const location: ReportLocation = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        updateDraft({ location });
      }
      setRequestWhenReady(false);
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo obtener la ubicación.');
    }
  }, [permission.parcial, updateDraft]);

  useFocusEffect(
    useCallback(() => {
      if (requestWhenReady && permission.estado === 'concedido') {
        void saveCurrentLocation();
      }
    }, [permission.estado, requestWhenReady, saveCurrentLocation]),
  );

  const requestLocation = () => {
    setRequestWhenReady(true);
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'ubicacion' } });
  };

  const saveSector = (sector: string) => {
    updateDraft({ location: { sector } });
    router.back();
  };

  return (
    <Page title="Marcar ubicación" subtitle="Usamos solo ubicación en primer plano mientras cargás el reporte.">
      <Panel>
        {permission.estado === 'concedido' ? (
          <>
            <Text style={{ color: '#172923', fontWeight: '700' }}>
              {permission.parcial ? 'El sistema informa ubicación aproximada.' : 'Podés usar la ubicación actual.'}
            </Text>
            <ActionButton label="Usar ubicación actual" onPress={() => void saveCurrentLocation()} />
          </>
        ) : permission.estado === 'bloqueado' ? (
          <>
            <Text style={{ color: '#172923', fontWeight: '700' }}>La ubicación está bloqueada</Text>
            <Text style={{ color: '#65736D' }}>Abrí Ajustes o elegí el sector manualmente.</Text>
            <ActionButton label="Abrir Ajustes" onPress={() => void permission.abrirAjustes()} />
          </>
        ) : (
          <ActionButton label="Continuar para usar ubicación" onPress={requestLocation} />
        )}
        {permission.detalle ? <Text style={{ color: '#65736D' }}>{permission.detalle}</Text> : null}
      </Panel>
      <Panel>
        <Text style={{ color: '#172923', fontWeight: '700' }}>Elegir sector a mano</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {sectors.map((sector) => (
            <Pressable
              key={sector}
              onPress={() => {
                setSelectedSector(sector);
                saveSector(sector);
              }}
              style={{
                backgroundColor: selectedSector === sector ? '#176B5B' : '#E9F3EF',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: selectedSector === sector ? '#FFFFFF' : '#176B5B', fontWeight: '700' }}>
                {sector}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      {error ? <InlineError>{error}</InlineError> : null}
      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
    </Page>
  );
}
