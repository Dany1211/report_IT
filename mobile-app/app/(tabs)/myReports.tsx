import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from "../../supabaseClient";
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

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

const MyReportsScreen: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportImages, setReportImages] = useState<{ [reportId: string]: ImageWithUrl[] }>({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // Fetch user data once on component mount
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

  // Fetch reports when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchReports();
      }
    }, [user?.id])
  );

  const fetchReports = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          issue_type,
          description,
          location,
          status,
          priority,
          created_at,
          admin_remark,
          image_urls
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        Alert.alert('Error', 'Failed to fetch your reports');
        return;
      }

      setReports(reportsData || []);

      const fetchReportImages = async (reportIds: string[]) => {
        try {
          const { data: userImages, error: userImagesError } = await supabase
            .from("report_images")
            .select("*")
            .in("report_id", reportIds);
      
          const { data: adminImages, error: adminImagesError } = await supabase
            .from("admin_report_images")
            .select("*")
            .in("report_id", reportIds);
      
          if (userImagesError) {
            console.error("Error fetching user images:", userImagesError);
          }
      
          if (adminImagesError) {
            console.error("Error fetching admin images:", adminImagesError);
          }
      
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
        } catch (error) {
          console.error("Unexpected error fetching report images:", error);
        }
      };

      const ids = (reportsData || []).map(r => r.id);
      if (ids.length > 0) {
        await fetchReportImages(ids);
      }

    } catch (error) {
      console.error("Unexpected error fetching reports:", error);
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
      default: return '#F39C12';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, '_')) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#2ECC71';
      default: return '#F39C12';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options as any);
  };

  const renderReportCard = (report: Report) => {
    const images = reportImages[report.id] || [];
    const userImages = images.filter(img => img.uploaded_by === 'user');
    const adminImages = images.filter(img => img.uploaded_by === 'admin');

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

        {/* Image thumbnails */}
        {(userImages.length > 0 || adminImages.length > 0) && (
          <View style={styles.thumbnailContainer}>
            {userImages.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>Your Photos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {userImages.slice(0, 3).map((image) => (
                    <TouchableOpacity key={image.id} onPress={() => openImageViewer(image.url)}>
                      <Image source={{ uri: image.url }} style={styles.thumbnailImage} />
                    </TouchableOpacity>
                  ))}
                  {userImages.length > 3 && (
                    <View style={styles.moreImagesIndicator}>
                      <Text style={styles.moreImagesText}>+{userImages.length - 3}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            
            {adminImages.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>Admin Photos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {adminImages.slice(0, 3).map((image) => (
                    <TouchableOpacity key={image.id} onPress={() => openImageViewer(image.url)}>
                      <Image source={{ uri: image.url }} style={styles.thumbnailImage} />
                    </TouchableOpacity>
                  ))}
                  {adminImages.length > 3 && (
                    <View style={styles.moreImagesIndicator}>
                      <Text style={styles.moreImagesText}>+{adminImages.length - 3}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
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
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
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

              {/* User Images */}
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

              {/* Admin Images */}
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

              <Text style={styles.detailLocation}>📍 {selectedReport.location}</Text>
              <Text style={styles.detailTimestamp}>Reported on {formatDate(selectedReport.created_at)}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeDetailButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={styles.closeDetailButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderImageViewerModal = () => {
    return (
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
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF9F0', '#FFF1C6']} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F39C12" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
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

      {reports.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F39C12']} />
          }
        >
          <Text style={styles.emptyStateText}>📝</Text>
          <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
          <Text style={styles.emptyStateDescription}>
            You haven't submitted any reports yet. Start by reporting an issue from the home screen.
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
          {reports.map(renderReportCard)}
        </ScrollView>
      )}

      {renderDetailModal()}
      {renderImageViewerModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555555',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#555555',
  },
  reportsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 75,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 8,
  },
  imageSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  thumbnailImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
  },
  moreImagesIndicator: {
    width: 40,
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: 10,
    color: '#555555',
    fontWeight: 'bold',
  },
  cardLocation: {
    fontSize: 12,
    color: '#777777',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  detailStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailStatusBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailDescription: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailImagesSection: {
    marginBottom: 16,
  },
  detailImagesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  detailImagesContainer: {
    marginBottom: 8,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  adminRemarkSection: {
    backgroundColor: '#FFF9F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  adminRemarkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F39C12',
    marginBottom: 4,
  },
  adminRemarkText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  detailLocation: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 8,
  },
  detailTimestamp: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 20,
  },
  closeDetailButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeDetailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Image Viewer Modal
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
  },
  imageViewerCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MyReportsScreen;