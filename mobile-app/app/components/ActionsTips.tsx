import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ActionsTipsProps {
  onReportIssue: () => void;
}

const ActionsTips: React.FC<ActionsTipsProps> = ({ onReportIssue }) => {
  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Need Help?</Text>
        <Text style={styles.heroSubtitle}>We're here to resolve any issues quickly</Text>
      </View>

      {/* Main Action Button */}
      <View style={styles.mainActionContainer}>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={onReportIssue}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🚨</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonTitle}>Report an Issue</Text>
              <Text style={styles.buttonSubtitle}>Get help with any problems</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsBanner}>
        <Text style={styles.tipsText}>💡 Include multiple photos and clear descriptions for faster resolution</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  mainActionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#F39C12',
    borderRadius: 16,
    width: width - 40,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tipsBanner: {
    backgroundColor: '#FFE4B5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.2)',
  },
  tipsText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ActionsTips;