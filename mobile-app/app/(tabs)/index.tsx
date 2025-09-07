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
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from "@react-native-picker/picker";


const { width } = Dimensions.get('window');

interface Report {
  id: string;
  issueType: string;
  description: string;
  photoUris: string[];
  status: 'pending' | 'in_progress' | 'resolved';
  urgency: 'low' | 'medium' | 'high';
  progress: number;
  location: string;
  timestamp: string;
}



interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const ISSUE_TYPES = [
  { label: "Potholes", value: "Potholes" },
  { label: "Streetlights", value: "Streetlights" },
  { label: "Overflowing Trash Bins", value: "Overflowing Trash Bins" },
  { label: "Graffiti", value: "Graffiti" },
  { label: "Broken Sidewalks", value: "Broken Sidewalks" },
  { label: "Illegal Dumping", value: "Illegal Dumping" },
  { label: "Noise Complaints", value: "Noise Complaints" },
  { label: "Water Leakage", value: "Water Leakage" },
  { label: "Blocked Drains", value: "Blocked Drains" },
  { label: "Abandoned Vehicles", value: "Abandoned Vehicles" },
  { label: "Fallen Trees", value: "Fallen Trees" },
  { label: "Traffic Signals", value: "Traffic Signals" },
  { label: "Road Damage", value: "Road Damage" },
  { label: "Missing Signage", value: "Missing Signage" },
  { label: "Vandalism", value: "Vandalism" },
  { label: "Public Restroom Issues", value: "Public Restroom Issues" },
  { label: "Animal Control", value: "Animal Control" },
  { label: "Hazardous Waste", value: "Hazardous Waste" },
  { label: "Construction Debris", value: "Construction Debris" },
  { label: "Other", value: "Other" },
];

const HomeScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isAutoLocation, setIsAutoLocation] = useState(true);
  
  // New State for Loading Animation
  const [isLocating, setIsLocating] = useState(false); 

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
      description: 'Large pothole on Main Street causing traffic issues and potential vehicle damage',
      photoUris: [
        'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=P1',
        'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=P2',
      ],
      status: 'pending',
      urgency: 'high',
      progress: 0,
      location: 'Main Street, Downtown',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      issueType: 'Street Light',
      description: 'Broken street light near park entrance affecting pedestrian safety',
      photoUris: [
        'https://via.placeholder.com/60x60/32CD32/FFFFFF?text=L1',
      ],
      status: 'resolved',
      urgency: 'medium',
      progress: 100,
      location: 'Park Avenue',
      timestamp: '2024-01-14T15:45:00Z',
    },
    {
      id: '3',
      issueType: 'Garbage',
      description: 'Overflowing trash bin in residential area',
      photoUris: [
        'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=G1',
        'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=G2',
        'https://via.placeholder.com/60x60/FFB347/FFFFFF?text=G3',
      ],
      status: 'in_progress',
      urgency: 'low',
      progress: 50,
      location: 'Residential Area',
      timestamp: '2024-01-13T09:20:00Z',
    },
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Report Status Updated',
      description: 'Your pothole report has been marked as in progress',
      timestamp: '2024-01-15T14:30:00Z',
    },
    {
      id: '2',
      title: 'New Report in Your Area',
      description: 'A new street light issue has been reported near you',
      timestamp: '2024-01-15T12:15:00Z',
    },
    {
      id: '3',
      title: 'Report Resolved',
      description: 'The garbage collection issue has been resolved',
      timestamp: '2024-01-14T16:45:00Z',
    },
  ];

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets?.map(asset => asset.uri) || [];
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };


  const autoDetectLocation = async () => {
    setIsLocating(true); // Start loading animation
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      const [addressInfo] = await Location.reverseGeocodeAsync({ latitude, longitude });

      const detectedAddress = `${addressInfo.name ? addressInfo.name + ', ' : ''}${
        addressInfo.street ? addressInfo.street + ', ' : ''
      }${addressInfo.city ? addressInfo.city + ', ' : ''}${
        addressInfo.region ? addressInfo.region + ', ' : ''
      }${addressInfo.postalCode ? addressInfo.postalCode + ', ' : ''}${
        addressInfo.country ? addressInfo.country : ''
      }`;

      setLocation(detectedAddress);
      setIsAutoLocation(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not detect location');
    } finally {
      setIsLocating(false); // Stop loading animation
    }
  };

  const generateAIDescription = async () => {
    const aiDescriptions = [
      'Infrastructure maintenance required due to wear and tear',
      'Public safety concern affecting pedestrian and vehicle traffic',
      'Environmental issue requiring immediate municipal attention',
      'Utility malfunction impacting community services',
    ];

    const randomDescription = aiDescriptions[Math.floor(Math.random() * aiDescriptions.length)];
    setDescription(randomDescription);
    Alert.alert('AI Generated', 'Description has been automatically generated');
  };

  const submitReport = async () => {
    if (!issueType.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const reportData = {
      issueType: issueType.trim(),
      description: description.trim(),
      urgency,
      photoUris: selectedImages,
      location: location || 'Location not provided',
      timestamp: new Date().toISOString(),
    };

    console.log('Submitting report:', reportData);

    resetForm();
    setModalVisible(false);

    Alert.alert('Success', 'Your report has been submitted successfully!');
  };

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setUrgency('medium');
    setSelectedImages([]);
    setLocation('');
    setIsAutoLocation(true);
  };

  const openReportDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#E74C3C'; // Intense Red
      case 'medium': return '#F39C12'; // Warm Orange
      case 'low': return '#2ECC71'; // Calming Green
      default: return '#F39C12';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Pending';
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return '#F39C12';
    if (progress === 50) return '#F39C12';
    if (progress === 100) return '#2ECC71';
    return '#F39C12';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <LinearGradient
      colors={['#FFF9F0', '#FFF1C6']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section with Notification */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome, Citizen!</Text>
            <Text style={styles.subtitleText}>Help improve your city with one tap.</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setNotificationModalVisible(true)}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{statsData.totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#F39C12' }]}>{statsData.pendingIssues}</Text>
              <Text style={styles.statLabel}>Pending Issues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#2ECC71' }]}>{statsData.resolvedIssues}</Text>
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
          </View>
        </View>

        {/* Tip Banner Section */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>💡 Include multiple photos for faster resolution</Text>
        </View>

        {/* Nearby Reports Section */}
        <View style={styles.nearbyReportsContainer}>
          <Text style={styles.sectionTitle}>Nearby Reports</Text>
          {nearbyReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => openReportDetail(report)}
            >
              <View style={styles.reportContent}>
                <View style={styles.reportPhotos}>
                  {report.photoUris.slice(0, 2).map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.reportImage} />
                  ))}
                  {report.photoUris.length > 2 && (
                    <View style={styles.morePhotosIndicator}>
                      <Text style={styles.morePhotosText}>+{report.photoUris.length - 2}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.reportDetails}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.issueTypeText}>{report.issueType}</Text>
                    <View style={styles.badgesRow}>
                      <View style={[
                        styles.urgencyBadge,
                        { backgroundColor: getUrgencyColor(report.urgency) }
                      ]}>
                        <Text style={styles.urgencyText}>
                          {report.urgency.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: report.status === 'resolved' ? '#2ECC71' : report.status === 'in_progress' ? '#F39C12' : '#F39C12' }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(report.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[
                        styles.progressBarFill,
                        {
                          width: `${report.progress}%`,
                          backgroundColor: getProgressBarColor(report.progress)
                        }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>{report.progress}%</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
        <KeyboardAvoidingView
          style={styles.bottomModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.bottomModalContainer}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Report New Issue</Text>

<Text style={styles.inputLabel}>Title *</Text>

<View style={styles.dropdownContainer}>
  <Picker
    selectedValue={issueType}
    onValueChange={(itemValue) => setIssueType(itemValue)}
    style={styles.dropdown}
  >
    <Picker.Item label="Select an issue type..." value="" />
    <Picker.Item label="Potholes" value="Potholes" />
    <Picker.Item label="Streetlights" value="Streetlights" />
    <Picker.Item label="Overflowing Trash Bins" value="Overflowing Trash Bins" />
    <Picker.Item label="Graffiti" value="Graffiti" />
    <Picker.Item label="Broken Sidewalks" value="Broken Sidewalks" />
    <Picker.Item label="Illegal Dumping" value="Illegal Dumping" />
    <Picker.Item label="Noise Complaints" value="Noise Complaints" />
    <Picker.Item label="Water Leakage" value="Water Leakage" />
    <Picker.Item label="Blocked Drains" value="Blocked Drains" />
    <Picker.Item label="Abandoned Vehicles" value="Abandoned Vehicles" />
    <Picker.Item label="Fallen Trees" value="Fallen Trees" />
    <Picker.Item label="Traffic Signals" value="Traffic Signals" />
    <Picker.Item label="Road Damage" value="Road Damage" />
    <Picker.Item label="Missing Signage" value="Missing Signage" />
    <Picker.Item label="Vandalism" value="Vandalism" />
    <Picker.Item label="Public Restroom Issues" value="Public Restroom Issues" />
    <Picker.Item label="Animal Control" value="Animal Control" />
    <Picker.Item label="Hazardous Waste" value="Hazardous Waste" />
    <Picker.Item label="Construction Debris" value="Construction Debris" />
    <Picker.Item label="Other" value="Other" />
  </Picker>
</View>

<Text style={styles.inputLabel}>Description *</Text>
<View style={styles.descriptionRow}>
  <TextInput
    style={[styles.input, styles.textArea, { flex: 1 }]}
    placeholder="Describe the issue in detail..."
    multiline={true}
    numberOfLines={4}
    value={description}
    onChangeText={setDescription}
  />
  <TouchableOpacity
    style={styles.aiButton}
    onPress={generateAIDescription}
  >
    <Text style={styles.aiButtonText}>AI</Text>
  </TouchableOpacity>
</View>


              {/* <Text style={styles.inputLabel}>Urgency Level</Text>
              <View style={styles.urgencySelector}>
                <TouchableOpacity
                  style={[styles.urgencyOption, urgency === 'low' && { backgroundColor: '#2ECC71' }]}
                  onPress={() => setUrgency('low')}
                >
                  <Text style={[styles.urgencyOptionText, urgency === 'low' && { color: '#FFFFFF' }]}>Low</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.urgencyOption, urgency === 'medium' && { backgroundColor: '#F39C12' }]}
                  onPress={() => setUrgency('medium')}
                >
                  <Text style={[styles.urgencyOptionText, urgency === 'medium' && { color: '#FFFFFF' }]}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.urgencyOption, urgency === 'high' && { backgroundColor: '#E74C3C' }]}
                  onPress={() => setUrgency('high')}
                >
                  <Text style={[styles.urgencyOptionText, urgency === 'high' && { color: '#FFFFFF' }]}>High</Text>
                </TouchableOpacity>
              </View> */}

              <Text style={styles.inputLabel}>Photos (Optional)</Text>
              <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>

              {selectedImages.length > 0 && (
                <ScrollView horizontal style={styles.imagePreviewContainer}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.locationRow}>
                {isLocating ? (
                  <Text style={styles.loadingText}>Locating...</Text>
                ) : (
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter location manually or auto-detect"
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      setIsAutoLocation(false);
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={autoDetectLocation}
                  disabled={isLocating}
                >
                  <Text style={styles.locationButtonText}>📍</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            {selectedReport && (
              <>
                <Text style={styles.modalTitle}>{selectedReport.issueType}</Text>

                <ScrollView horizontal style={styles.detailPhotosContainer}>
                  {selectedReport.photoUris.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.detailImage} />
                  ))}
                </ScrollView>

                <Text style={styles.detailDescription}>{selectedReport.description}</Text>

                <View style={styles.detailBadgesRow}>
                  <View style={[
                    styles.urgencyBadge,
                    { backgroundColor: getUrgencyColor(selectedReport.urgency) }
                  ]}>
                    <Text style={styles.urgencyText}>
                      {selectedReport.urgency.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedReport.status === 'resolved' ? '#2ECC71' : selectedReport.status === 'in_progress' ? '#F39C12' : '#F39C12' }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(selectedReport.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress:</Text>
                  <View style={styles.progressBarBackground}>
                    <View style={[
                      styles.progressBarFill,
                      {
                        width: `${selectedReport.progress}%`,
                        backgroundColor: getProgressBarColor(selectedReport.progress)
                      }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>{selectedReport.progress}%</Text>
                </View>

                <Text style={styles.detailLocation}>📍 {selectedReport.location}</Text>
                <Text style={styles.detailTimestamp}>Reported: {formatTimestamp(selectedReport.timestamp)}</Text>

                <TouchableOpacity
                  style={styles.closeDetailButton}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.closeDetailButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContainer}>
            <Text style={styles.modalTitle}>Notifications</Text>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationDescription}>{item.description}</Text>
                  <Text style={styles.notificationTimestamp}>{formatTimestamp(item.timestamp)}</Text>
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.closeNotificationButton}
              onPress={() => setNotificationModalVisible(false)}
            >
              <Text style={styles.closeNotificationButtonText}>Close</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  notificationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    fontSize: 20,
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
    marginBottom: 25,
  },
  tipText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  nearbyReportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
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
  reportPhotos: {
    flexDirection: 'row',
    marginRight: 12,
  },
  reportImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 4,
  },
  morePhotosIndicator: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportDetails: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#555555',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#555555',
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
    maxHeight: '90%',
  },
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
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
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  urgencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  urgencyOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  urgencyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    marginTop: 16,
  },
  photoButtonText: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 16,
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
    backgroundColor: '#F39C12',
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
  detailModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  detailPhotosContainer: {
    marginVertical: 12,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailLocation: {
    fontSize: 14,
    color: '#555555',
    marginTop: 12,
  },
  detailTimestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  closeDetailButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeDetailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '70%',
  },
  notificationItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999999',
  },
  closeNotificationButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeNotificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#555555',
    fontStyle: 'italic',
    padding: 12,
    flex: 1,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    height: 50,
    backgroundColor: "#F9F9F9",
    overflow: "hidden",
    marginTop: 8,

  },
  dropdown: {
    height: 50,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#333",

    
  },
});

export default HomeScreen;