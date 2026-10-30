import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { ActionButton, Field, Page, Panel } from '../../components/ui';
import { useAppState } from '../../lib/app-state';
import { Category } from '../../lib/types';

const categories: Category[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export default function NewReportScreen() {
  const { draft, updateDraft, createReport } = useAppState();
  const [error, setError] = useState('');

  const submit = () => {
    if (!draft.title.trim() || !draft.description.trim() || !draft.classroom.trim()) {
      setError('Completá el título, la descripción y el aula para crear el reporte.');
      return;
    }
    const report = createReport();
    setError('');
    router.replace({ pathname: '/reporte/[id]', params: { id: report.id } });
  };

  return (
    <Page title="Nuevo reporte" subtitle="Los permisos se solicitan únicamente cuando elegís una función.">
      <Field
        label="Título"
        value={draft.title}
        onChangeText={(title) => updateDraft({ title })}
        placeholder="Ej.: Luz quemada"
        maxLength={80}
      />
      <Field
        label="Descripción"
        value={draft.description}
        onChangeText={(description) => updateDraft({ description })}
        placeholder="Contanos qué ocurre y desde cuándo."
        multiline
        maxLength={500}
      />
      <Field
        label="Aula"
        value={draft.classroom}
        onChangeText={(classroom) => updateDraft({ classroom })}
        placeholder="Ej.: 12 o Laboratorio"
        maxLength={40}
      />
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#172923', fontWeight: '700' }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => updateDraft({ category })}
              style={{
                backgroundColor: draft.category === category ? '#176B5B' : '#FFFFFF',
                borderColor: '#C8DED4',
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 9,
              }}>
              <Text style={{ color: draft.category === category ? '#FFFFFF' : '#176B5B', fontWeight: '700' }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Panel>
        <Text style={{ color: '#172923', fontWeight: '700' }}>Información opcional</Text>
        <ActionButton label="Escanear QR del aula" secondary onPress={() => router.push('/reporte/escanear')} />
        <ActionButton label={draft.photoUri ? 'Cambiar foto' : 'Adjuntar foto'} secondary onPress={() => router.push('/reporte/foto')} />
        <ActionButton label={draft.location ? 'Cambiar ubicación' : 'Marcar ubicación'} secondary onPress={() => router.push('/reporte/ubicacion')} />
        {draft.location?.approximate ? (
          <Text style={{ color: '#65736D' }}>Ubicación aproximada</Text>
        ) : draft.location?.sector ? (
          <Text style={{ color: '#65736D' }}>{draft.location.sector}</Text>
        ) : null}
      </Panel>
      {error ? <Text accessibilityRole="alert" style={{ color: '#A33131' }}>{error}</Text> : null}
      <ActionButton label="Crear reporte" onPress={submit} />
    </Page>
  );
}
