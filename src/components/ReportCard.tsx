import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Report } from '../lib/types';
import { uiColors } from './ui';

export function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Text style={styles.category}>{report.category}</Text>
        <Text style={[styles.status, report.status === 'resuelto' && styles.resolved]}>
          {report.status}
        </Text>
      </View>
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.detail}>
        Aula {report.classroom} · {new Date(report.createdAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6E1',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 9,
  },
  pressed: { opacity: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: uiColors.green, fontWeight: '700', textTransform: 'capitalize' },
  status: {
    color: '#8A5C15',
    backgroundColor: '#FFF2D8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  resolved: { color: '#176B5B', backgroundColor: '#E4F2EC' },
  title: { color: uiColors.ink, fontSize: 17, fontWeight: '700' },
  detail: { color: uiColors.muted, fontSize: 13 },
});
