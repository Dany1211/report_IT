// app/(tabs)/myReports.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from "../../supabaseClient";
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- INTERFACES ---
interface Report {
  id: string;
  issue_type: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  created_at: string;
  admin_remark?: string;
  image_urls: string[];
  user_feedback?: string; 
}

interface ReportImage {
  id: string;
  report_id: string;
  image_url: string;
  uploaded_by: 'user' | 'admin';
  created_at: string;
}

type ImageWithUrl = {
  id: string;
  url: string;
  uploaded_by: "user" | "admin";
};

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'resolved' | 'rejected';
type FeedbackSelection = 'Satisfied' | 'Not Satisfied' | null;

// --- COMPONENT ---
const MyReportsScreen: React.FC = () => {
  // --- STATE AND REFS ---
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportImages, setReportImages] = useState<{ [reportId: string]: ImageWithUrl[] }>({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [customFeedback, setCustomFeedback] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSelection>(null);

  const filterScrollViewRef = useRef<ScrollView>(null);
  const filterLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});

  // --- HOOKS AND DATA FETCHING ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", authUser.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError.message);
          } else {
            setUser({
              id: authUser.id,
              name: profile?.name || "Unknown",
              email: profile?.email || authUser.email || "No email",
            });
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchReports();
      }
    }, [user?.id])
  );
  
  useEffect(() => {
    const layout = filterLayouts.current[activeFilter];
    if (layout) {
      filterScrollViewRef.current?.scrollTo({ x: layout.x, animated: true });
    }
  }, [activeFilter]);
  
  const fetchReports = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id, issue_type, description, location, status, priority, 
          created_at, admin_remark, image_urls, user_feedback
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      const reportIds = (reportsData || []).map(r => r.id);
      if (reportIds.length > 0) {
        const { data: userImages } = await supabase
            .from("report_images")
            .select("*")
            .in("report_id", reportIds);
        
        const { data: adminImages } = await supabase
            .from("admin_report_images")
            .select("*")
            .in("report_id", reportIds);
        
        const allImages: ReportImage[] = [
          ...(userImages || []).map((img) => ({ ...img, uploaded_by: "user" as const })),
          ...(adminImages || []).map((img) => ({ ...img, uploaded_by: "admin" as const })),
        ];
        
        const imagesByReport: { [reportId: string]: ImageWithUrl[] } = {};
        for (const image of allImages) {
          if (!imagesByReport[image.report_id]) {
            imagesByReport[image.report_id] = [];
          }
          imagesByReport[image.report_id].push({
            id: image.id,
            url: image.image_url,
            uploaded_by: image.uploaded_by,
          });
        }
        setReportImages(imagesByReport);
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      Alert.alert('Error', 'Failed to fetch your reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  const openReportDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };
  
  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, '_')) {
      case 'pending': return '#E74C3C';
      case 'in_progress': return '#F39C12';
      case 'resolved': return '#2ECC71';
      case 'rejected': return '#808080';
      default: return '#F39C12';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, '_')) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      case 'all': return 'All';
      default: return 'Pending';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') {
      return reports;
    }
    return reports.filter(report => 
      report.status.toLowerCase().replace(/\s+/g, '_') === activeFilter
    );
  }, [reports, activeFilter]);
  
  const handleFeedbackSubmit = async () => {
    if (!selectedReport || !selectedFeedback) return;
    const reportId = selectedReport.id;

    const feedbackToSubmit = customFeedback.trim()
      ? `${selectedFeedback}: ${customFeedback.trim()}`
      : selectedFeedback;

    try {
        const { error } = await supabase
            .from('reports')
            .update({ user_feedback: feedbackToSubmit })
            .eq('id', reportId);
        if (error) throw error;
        
        const updatedReports = reports.map(report => 
            report.id === reportId ? { ...report, user_feedback: feedbackToSubmit } : report
        );
        setReports(updatedReports);
        setSelectedReport(prev => prev ? { ...prev, user_feedback: feedbackToSubmit } : null);
        
        setCustomFeedback('');
        setSelectedFeedback(null);

        Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error: any) {
        console.error("Error submitting feedback:", error);
        Alert.alert('Error', 'Could not submit your feedback. Please try again.');
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setCustomFeedback('');
    setSelectedFeedback(null);
  };

  const renderFilterButtons = () => {
    const filters: { label: string; value: StatusFilter }[] = [
      { label: 'All', value: 'all' },
      { label: 'Pending', value: 'pending' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Rejected', value: 'rejected' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView
          ref={filterScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.value}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                filterLayouts.current[filter.value] = { x: layout.x, width: layout.width };
              }}
              style={[
                styles.filterButton,
                activeFilter === filter.value && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter.value && styles.activeFilterButtonText,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderReportCard = (report: Report) => {
    const images = reportImages[report.id] || [];
    const userImages = images.filter(img => img.uploaded_by === 'user');

    return (
      <TouchableOpacity
        key={report.id}
        style={styles.reportCard}
        onPress={() => openReportDetail(report)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{report.issue_type}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {getStatusText(report.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {report.description}
        </Text>

        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{formatDate(report.created_at)}</Text>
        </View>
        
        {userImages.length > 0 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userImages.slice(0, 4).map((image) => (
                <TouchableOpacity key={image.id} onPress={() => openImageViewer(image.url)}>
                  <Image source={{ uri: image.url }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
              {userImages.length > 4 && (
                <View style={styles.moreImagesIndicator}>
                  <Text style={styles.moreImagesText}>+{userImages.length - 4}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {report.location}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedReport) return null;
    const images = reportImages[selectedReport.id] || [];
    const userImages = images.filter(img => img.uploaded_by === 'user');
    const adminImages = images.filter(img => img.uploaded_by === 'admin');

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeDetailModal}>
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{selectedReport.issue_type}</Text>
              <View style={styles.detailStatusRow}>
                <View style={[styles.statusBadge, styles.detailStatusBadge]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedReport.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                    {getStatusText(selectedReport.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.detailDescription}>{selectedReport.description}</Text>
              
              {userImages.length > 0 && (
                <View style={styles.detailImagesSection}>
                  <Text style={styles.detailImagesSectionTitle}>Your Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailImagesContainer}>
                    {userImages.map((image) => (
                      <TouchableOpacity key={image.id} onPress={() => openImageViewer(image.url)}>
                        <Image source={{ uri: image.url }} style={styles.detailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {adminImages.length > 0 && (
                <View style={styles.detailImagesSection}>
                  <Text style={styles.detailImagesSectionTitle}>Admin Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailImagesContainer}>
                    {adminImages.map((image) => (
                      <TouchableOpacity key={image.id} onPress={() => openImageViewer(image.url)}>
                        <Image source={{ uri: image.url }} style={styles.detailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {selectedReport.admin_remark && (
                <View style={styles.adminRemarkSection}>
                  <Text style={styles.adminRemarkTitle}>Admin Remarks</Text>
                  <Text style={styles.adminRemarkText}>{selectedReport.admin_remark}</Text>
                </View>
              )}

              {selectedReport.status?.trim().toLowerCase() === 'resolved' && (
                <View style={styles.feedbackContainer}>
                  {!selectedReport.user_feedback ? (
                    <>
                      <Text style={styles.feedbackTitle}>Is the issue resolved to your satisfaction?</Text>
                      <View style={styles.feedbackButtonRow}>
                        <TouchableOpacity 
                          style={[
                            styles.feedbackButton, 
                            styles.satisfiedButton,
                            selectedFeedback === 'Satisfied' && styles.selectedFeedbackButton
                          ]}
                          onPress={() => setSelectedFeedback('Satisfied')}
                        >
                          <Text style={styles.feedbackButtonText}>👍 Satisfied</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[
                            styles.feedbackButton, 
                            styles.notSatisfiedButton,
                            selectedFeedback === 'Not Satisfied' && styles.selectedFeedbackButton
                          ]}
                          onPress={() => setSelectedFeedback('Not Satisfied')}
                        >
                          <Text style={styles.feedbackButtonText}>👎 Not Satisfied</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TextInput
                        style={styles.feedbackInput}
                        placeholder="Add optional comments..."
                        placeholderTextColor="#999"
                        multiline
                        value={customFeedback}
                        onChangeText={setCustomFeedback}
                      />
                      
                      <TouchableOpacity
                        style={[styles.submitFeedbackButton, !selectedFeedback && styles.disabledButton]}
                        onPress={handleFeedbackSubmit}
                        disabled={!selectedFeedback}
                      >
                        <Text style={styles.submitFeedbackButtonText}>Confirm Submit</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.feedbackTitle}>Your Feedback:</Text>
                      <Text style={styles.submittedFeedbackText}>
                        Thank you! You reported: "{selectedReport.user_feedback}"
                      </Text>
                    </>
                  )}
                </View>
              )}

              <Text style={styles.detailLocation}>📍 {selectedReport.location}</Text>
              <Text style={styles.detailTimestamp}>Reported on {formatDate(selectedReport.created_at)}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderImageViewerModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={imageViewerVisible}
      onRequestClose={() => setImageViewerVisible(false)}
    >
      <View style={styles.imageViewerOverlay}>
        <TouchableOpacity
          style={styles.imageViewerCloseButton}
          onPress={() => setImageViewerVisible(false)}
        >
          <Text style={styles.imageViewerCloseButtonText}>✕</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
  
  if (loading) {
    return (
      <LinearGradient colors={['#FFF9F0', '#FFF1C6']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F39C12" />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient colors={['#FFF9F0', '#FFF1C6']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <Text style={styles.headerSubtitle}>Track your submitted issues</Text>
      </View>
      
      {renderFilterButtons()}

      {filteredReports.length === 0 ? (
        // MODIFIED: Added style={{ flex: 1 }} to the ScrollView
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F39C12']} />
          }
        >
          <Text style={styles.emptyStateText}>📭</Text>
          <Text style={styles.emptyStateTitle}>No Reports Found</Text>
          <Text style={styles.emptyStateDescription}>
            {activeFilter === 'all'
              ? "You haven't submitted any reports yet."
              : `You have no reports with the status "${getStatusText(activeFilter)}".`}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.reportsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F39C12']} />
          }
        >
          {filteredReports.map(renderReportCard)}
        </ScrollView>
      )}

      {renderDetailModal()}
      {renderImageViewerModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#555555' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#555555' },
  filterContainer: { paddingLeft: 15, paddingVertical: 10 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  activeFilterButton: { backgroundColor: '#F39C12', borderColor: '#F39C12' },
  filterButtonText: { color: '#555555', fontWeight: '600', fontSize: 14 },
  activeFilterButtonText: { color: '#FFFFFF' },
  reportsContainer: { flex: 1, paddingHorizontal: 20, marginBottom: 75 },
  reportCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333333', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDescription: { fontSize: 14, color: '#555555', lineHeight: 20, marginBottom: 12 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardDate: { fontSize: 12, color: '#999999' },
  thumbnailContainer: { marginTop: 4, marginBottom: 12 },
  thumbnailImage: { width: 50, height: 50, borderRadius: 6, marginRight: 8 },
  moreImagesIndicator: { width: 50, height: 50, backgroundColor: '#E0E0E0', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  moreImagesText: { fontSize: 14, color: '#555555', fontWeight: 'bold' },
  cardLocation: { fontSize: 12, color: '#777777', fontStyle: 'italic' },
  
  // MODIFIED: Replaced flex: 1 with flexGrow: 1
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyStateText: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  emptyStateDescription: { fontSize: 14, color: '#555555', textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  detailModalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: width - 40, maxHeight: '85%' },
  modalCloseButton: { position: 'absolute', top: 15, right: 15, backgroundColor: '#F0F0F0', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333333', marginBottom: 16, paddingRight: 30 },
  detailStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailStatusBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6 },
  detailDescription: { fontSize: 16, color: '#555555', lineHeight: 24, marginBottom: 16 },
  detailImagesSection: { marginBottom: 16 },
  detailImagesSectionTitle: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 8 },
  detailImagesContainer: { marginBottom: 8 },
  detailImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
  adminRemarkSection: { backgroundColor: '#FFF9F0', borderRadius: 8, padding: 12, marginBottom: 16 },
  adminRemarkTitle: { fontSize: 14, fontWeight: '600', color: '#F39C12', marginBottom: 4 },
  adminRemarkText: { fontSize: 14, color: '#555555', lineHeight: 20 },
  feedbackContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#F0F0F0' },
  feedbackTitle: { fontSize: 16, fontWeight: '600', color: '#333333', textAlign: 'center', marginBottom: 12 },
  feedbackButtonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  feedbackButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  satisfiedButton: { backgroundColor: '#2ECC71' },
  notSatisfiedButton: { backgroundColor: '#E74C3C' },
  selectedFeedbackButton: { borderColor: '#333', transform: [{ scale: 1.05 }] },
  feedbackButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  feedbackInput: { backgroundColor: '#F9F9F9', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  submitFeedbackButton: { backgroundColor: '#F39C12', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  submitFeedbackButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#CCCCCC' },
  submittedFeedbackText: { fontSize: 14, color: '#555555', textAlign: 'center', fontStyle: 'italic', padding: 10, backgroundColor: '#F9F9F9', borderRadius: 8 },
  detailLocation: { fontSize: 14, color: '#777777', marginBottom: 8, marginTop: 16 },
  detailTimestamp: { fontSize: 12, color: '#999999', marginBottom: 20 },
  imageViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: width, height: '100%' },
  imageViewerCloseButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },
  imageViewerCloseButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
});

export default MyReportsScreen;