import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Renders a platform-independent confirmation dialog for destructive and
 * user-submitted actions, including Expo Web where native alerts are absent.
 * The cancel action is omitted for informational messages using the default
 * OK label.
 */
export function ActionDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel
}: ActionDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {confirmLabel !== 'OK' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
              >
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmButton, destructive && styles.destructiveButton]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  destructiveButton: {
    backgroundColor: '#DC2626',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
