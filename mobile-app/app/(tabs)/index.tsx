import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface Report {
  id: string;
  issueType: string;
  description: string;
  photoUri?: string;
  status: 'pending' | 'resolved';
}

const HomeScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Placeholder data
  const statsData = {
    totalReports: 142,
    pendingIssues: 28,
    resolvedIssues: 114,
  };

  const nearbyReports: Report[] = [
    {
      id: '1',
      issueType: 'Pothole',
      description: 'Large pothole on Main Street causing traffic issues',
      photoUri: 'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=P',
      status: 'pending',
    },
    {
      id: '2',
      issueType: 'Street Light',
      description: 'Broken street light near park entrance',
      photoUri: 'https://via.placeholder.com/60x60/32CD32/FFFFFF?text=L',
      status: 'resolved',
    },
    {
      id: '3',
      issueType: 'Garbage',
      description: 'Overflowing trash bin in residential area',
      photoUri: 'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=G',
      status: 'pending',
    },
    {
      id: '4',
      issueType: 'Water Leak',
      description: 'Water pipe leak causing flooding on sidewalk',
      photoUri: 'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=W',
      status: 'pending',
    },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const submitReport = async () => {
    if (!issueType.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Placeholder for backend submission (Supabase integration ready)
    const reportData = {
      issueType: issueType.trim(),
      description: description.trim(),
      photoUri: selectedImage,
      timestamp: new Date().toISOString(),
      location: null, // Add GPS coordinates here
    };

    console.log('Submitting report:', reportData);
    
    // Reset form and close modal
    setIssueType('');
    setDescription('');
    setSelectedImage(null);
    setModalVisible(false);
    
    Alert.alert('Success', 'Your report has been submitted successfully!');
  };

  const handleMyReports = () => {
    // Placeholder navigation function
    console.log('Navigate to My Reports screen');
  };

  const fetchNearbyReports = async () => {
    // Placeholder function for fetching nearby reports from backend
    console.log('Fetching nearby reports...');
  };

  return (
    <LinearGradient
      colors={['#FFF9F0', '#FFF1C6']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Citizen!</Text>
          <Text style={styles.subtitleText}>Help improve your city with one tap.</Text>
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{statsData.totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#FFB347' }]}>{statsData.pendingIssues}</Text>
              <Text style={styles.statLabel}>Pending Issues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#32CD32' }]}>{statsData.resolvedIssues}</Text>
              <Text style={styles.statLabel}>Resolved Issues</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Report an Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={handleMyReports}
            >
              <Text style={styles.actionButtonText}>My Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip Banner Section */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>💡 Include a photo for faster resolution</Text>
        </View>

        {/* Nearby Reports Section */}
        <View style={styles.nearbyReportsContainer}>
          <Text style={styles.sectionTitle}>Nearby Reports</Text>
          {nearbyReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportContent}>
                <Image source={{ uri: report.photoUri }} style={styles.reportImage} />
                <View style={styles.reportDetails}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.issueTypeText}>{report.issueType}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: report.status === 'resolved' ? '#32CD32' : '#FFB347' }
                    ]}>
                      <Text style={styles.statusText}>
                        {report.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* New Issue Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report New Issue</Text>
            
            <Text style={styles.inputLabel}>Issue Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Pothole, Street Light, Garbage"
              value={issueType}
              onChangeText={setIssueType}
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue in detail..."
              multiline={true}
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>Photo (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>
                {selectedImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setIssueType('');
                  setDescription('');
                  setSelectedImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#555555',
  },
  dashboardContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryActionButton: {
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryActionButton: {
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
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
    marginBottom: 25,
  },
  tipText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  nearbyReportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportContent: {
    flexDirection: 'row',
    padding: 16,
  },
  reportImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
  },
  photoButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    width: (width - 90) / 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 12,
    width: (width - 90) / 2,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;