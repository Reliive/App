import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  formatDisplayDate,
  formatDisplayTime,
  formatIsoDateString,
  formatIsoTimeString,
  updateDatePart,
  updateTimePart,
} from '@/utils/date';

interface EventDateTimePickerProps {
  selectedDate: Date;
  onDateChange: (updatedDate: Date) => void;
  error?: string;
}

/**
 * Platform-adaptive date and time picker input.
 * Renders HTML5 date/time inputs on web and native modal pickers on iOS/Android.
 */
export function EventDateTimePicker({
  selectedDate,
  onDateChange,
  error,
}: EventDateTimePickerProps) {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  /**
   * Handles native date picker selection.
   */
  const handleNativeDateChange = (
    _event: DateTimePickerEvent,
    newDate?: Date
  ) => {
    setIsDatePickerVisible(Platform.OS === 'ios');
    if (newDate) {
      onDateChange(newDate);
    }
  };

  /**
   * Handles native time picker selection.
   */
  const handleNativeTimeChange = (
    _event: DateTimePickerEvent,
    newTime?: Date
  ) => {
    setIsTimePickerVisible(Platform.OS === 'ios');
    if (newTime) {
      onDateChange(newTime);
    }
  };

  /**
   * Handles web native HTML date input changes.
   */
  const handleWebDateChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = changeEvent.target.value;
    if (inputValue) {
      onDateChange(updateDatePart(selectedDate, inputValue));
    }
  };

  /**
   * Handles web native HTML time input changes.
   */
  const handleWebTimeChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = changeEvent.target.value;
    if (inputValue) {
      onDateChange(updateTimePart(selectedDate, inputValue));
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.row}>
          <input
            type="date"
            value={formatIsoDateString(selectedDate)}
            min={formatIsoDateString(new Date())}
            onChange={handleWebDateChange}
            style={webInputStyle}
            aria-label="Event date"
          />
          <input
            type="time"
            value={formatIsoTimeString(selectedDate)}
            onChange={handleWebTimeChange}
            style={webInputStyle}
            aria-label="Event time"
          />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setIsDatePickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Select date, currently ${formatDisplayDate(selectedDate)}`}
            >
              <Text style={styles.buttonText}>{formatDisplayDate(selectedDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setIsTimePickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Select time, currently ${formatDisplayTime(selectedDate)}`}
            >
              <Text style={styles.buttonText}>{formatDisplayTime(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          {isDatePickerVisible && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleNativeDateChange}
              minimumDate={new Date()}
            />
          )}

          {isTimePickerVisible && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="default"
              onChange={handleNativeTimeChange}
            />
          )}
        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  flex: 1,
  border: '1px solid #D1D5DB',
  borderRadius: 8,
  padding: '11px 12px',
  backgroundColor: '#FFFFFF',
  fontSize: 15,
  color: '#111827',
  fontFamily: 'inherit',
  outline: 'none',
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 6,
  },
});
