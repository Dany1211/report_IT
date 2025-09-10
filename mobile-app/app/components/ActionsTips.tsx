import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ActionsTipsProps {
  onReportIssue: () => void;
}

const ActionsTips: React.FC<ActionsTipsProps> = ({ onReportIssue }) => {
  return (
    <>
      {/* Quick Actions Section */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={onReportIssue}
          >
            <Text style={styles.actionButtonText}>Report an Issue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tip Banner Section */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>💡 Include multiple photos for faster resolution</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  actionButtonsRow: {
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#F39C12',
    borderRadius: 12,
    padding: 16,
    width: width - 40,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFE4B5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
});

export default ActionsTips;