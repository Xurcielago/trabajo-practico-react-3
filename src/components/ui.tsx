import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  ink: '#172923',
  muted: '#65736D',
  green: '#176B5B',
  pale: '#E9F3EF',
  line: '#DCE6E1',
  white: '#FFFFFF',
  danger: '#A33131',
};

export function Page({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ActionButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={secondary ? colors.green : colors.white} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Panel({ children }: PropsWithChildren) {
  return <View style={styles.panel}>{children}</View>;
}

export function Field({ label, ...inputProps }: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#8A9891"
        style={[styles.input, inputProps.multiline && styles.multiline]}
        {...inputProps}
      />
    </View>
  );
}

export function InlineError({ children }: PropsWithChildren) {
  if (!children) return null;
  return <Text accessibilityRole="alert" style={styles.error}>{children}</Text>;
}

export const uiColors = colors;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8F6' },
  page: { padding: 22, gap: 16, flexGrow: 1 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -8 },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonSecondary: { backgroundColor: colors.pale, borderWidth: 1, borderColor: '#C8DED4' },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  buttonTextSecondary: { color: colors.green },
  panel: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    gap: 10,
  },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: colors.ink,
    fontSize: 15,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
