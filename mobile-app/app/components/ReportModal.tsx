import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../../supabaseClient';

const { width } = Dimensions.get('window');

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ visible, onClose, onSubmit }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isAutoLocation, setIsAutoLocation] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Image Picker (UI Only) */
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permission is required');
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
      const newImages = result.assets?.map(a => a.uri) || [];
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  /** Auto Location */
  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });

      const detectedAddress = `${addr.name ? addr.name + ', ' : ''}${addr.street ? addr.street + ', ' : ''}${addr.city ? addr.city + ', ' : ''}${addr.region ? addr.region + ', ' : ''}${addr.postalCode ? addr.postalCode + ', ' : ''}${addr.country || ''}`;
      setLocation(detectedAddress);
      setIsAutoLocation(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not detect location');
    } finally {
      setIsLocating(false);
    }
  };

  /** AI Description Generator */
  const generateAIDescription = () => {
    const options = [
      'Infrastructure maintenance required due to wear and tear',
      'Public safety concern affecting pedestrian and vehicle traffic',
      'Environmental issue requiring immediate municipal attention',
      'Utility malfunction impacting community services',
    ];
    setDescription(options[Math.floor(Math.random() * options.length)]);
    Alert.alert('AI Generated', 'Description has been automatically generated');
  };

  /** Submit Report */
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user is logged in");

      // 2. Fetch name from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      const reporterName = profile?.name || user.email?.split('@')[0] || 'Anonymous';

      // 3. Insert report with local time
// Generate local time in ISO format (YYYY-MM-DDTHH:MM:SS)
const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
// local time in ISO
      const { error: insertError } = await supabase.from('reports').insert([
        {
          issue_type: issueType.trim(),
          description: description.trim(),
          location,
          priority: urgency,
          reporter_name: reporterName,
          reporter_email: user.email,
          user_id: user.id,
          created_at: createdAt,
        },
      ]);
      if (insertError) throw insertError;

      Alert.alert("Success", "Report submitted successfully!");
      resetForm();
      if (onSubmit) onSubmit();
    } catch (err: any) {
      Alert.alert("Submit Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setUrgency('medium');
    setSelectedImages([]);
    setLocation('');
    setIsAutoLocation(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.bottomModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.bottomModalContainer}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Report New Issue</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <View style={styles.dropdownContainer}>
              <Picker selectedValue={issueType} onValueChange={setIssueType} style={styles.dropdown}>
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
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.aiButton} onPress={generateAIDescription}>
                <Text style={styles.aiButtonText}>AI</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Photos (UI Only)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
              <Text style={styles.photoButtonText}>Add Photos</Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
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
              <TouchableOpacity style={styles.locationButton} onPress={autoDetectLocation} disabled={isLocating}>
                <Text style={styles.locationButtonText}>📍</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  bottomModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomModalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxHeight: '90%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  descriptionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiButton: { backgroundColor: '#F39C12', borderRadius: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  aiButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  photoButton: { borderWidth: 1, borderColor: '#F39C12', borderRadius: 8, padding: 12, alignItems: 'center', backgroundColor: '#FFF9F0', marginTop: 16 },
  photoButtonText: { color: '#F39C12', fontSize: 16, fontWeight: '600' },
  imagePreviewContainer: { marginTop: 12 },
  imagePreviewWrapper: { position: 'relative', marginRight: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: '#E74C3C', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  removeImageText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationButton: { backgroundColor: '#F39C12', borderRadius: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  locationButtonText: { fontSize: 16 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#E0E0E0', borderRadius: 8, padding: 12, width: (width - 90) / 2, alignItems: 'center' },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
  submitButton: { backgroundColor: '#F39C12', borderRadius: 8, padding: 12, width: (width - 90) / 2, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#555', fontStyle: 'italic', padding: 12, flex: 1 },
  dropdownContainer: { borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, height: 50, backgroundColor: "#F9F9F9", overflow: "hidden", marginTop: 8 },
  dropdown: { height: 50, paddingHorizontal: 10, fontSize: 15, color: "#333" },
});

export default ReportModal;
