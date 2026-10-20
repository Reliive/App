import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  sectionHeader: { fontSize: 13, fontWeight: '600', color: '#6B7280', letterSpacing: 1, marginBottom: 16 },
  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  templateCard: {
    width: '48%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
  },
  templateCardSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  templateIcon: { fontSize: 20, marginRight: 8 },
  templateLabel: { fontSize: 16, fontWeight: '500', color: '#374151' },
  templateLabelSelected: { color: '#4F46E5', fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  required: { color: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 13, marginTop: 6 },
  footer: {
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF',
  },
  nextButton: { width: '100%' },
});
