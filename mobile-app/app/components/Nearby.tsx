"use client"

// MODIFIED: Imported useMemo
import type React from "react"
import { useState, useCallback, useMemo } from "react"
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
} from "react-native"
import { supabase } from "../../supabaseClient"
import { useFocusEffect } from "@react-navigation/native"
import * as Location from "expo-location"

const { width, height } = Dimensions.get("window")
interface Report {
  id: string
  issue_type: string
  description: string
  location: string
  status: string
  priority: string
  created_at: string
  admin_remark?: string
  image_urls: string[]
  latitude: number
  longitude: number
  distance?: number
  affected_count: number
  false_count: number
}

interface ReportImage {
  id: string
  report_id: string
  image_url: string
  uploaded_by: "user" | "admin"
  created_at: string
}

type ImageWithUrl = {
  id: string
  url: string
  uploaded_by: "user" | "admin"
}

const NearbyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportImages, setReportImages] = useState<{ [reportId: string]: ImageWithUrl[] }>({})
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userAffectedVotes, setUserAffectedVotes] = useState<Set<string>>(new Set())
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocationError("Location permission is required to show nearby reports")
        return null
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const location = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }

      setUserLocation(location)
      setLocationError(null)
      return location
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationError("Could not get your location")
      return null
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchNearbyReports()
    }, []),
  )

  const fetchNearbyReports = async () => {
    try {
      setLoading(true)
      setLocationError(null)

      const location = await getUserLocation()
      if (!location) {
        setLoading(false)
        return
      }

      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select(`
          id,
          issue_type,
          description,
          location,
          status,
          priority,
          created_at,
          admin_remark,
          image_urls,
          latitude,
          longitude,
          affected_count,
          false_count
        `)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false })

      if (reportsError) {
        console.error("Error fetching reports:", reportsError)
        Alert.alert("Error", "Failed to fetch nearby reports")
        return
      }

      const nearbyReports = (reportsData || [])
        .map((report) => ({
          ...report,
          distance: calculateDistance(location.latitude, location.longitude, report.latitude, report.longitude),
        }))
        .filter((report) => report.distance <= 5)
        .sort((a, b) => a.distance - b.distance)

      setReports(nearbyReports)

      const fetchReportImages = async (reportIds: string[]) => {
        if (reportIds.length === 0) return

        try {
          const { data: userImages, error: userImagesError } = await supabase
            .from("report_images")
            .select("*")
            .in("report_id", reportIds)

          const { data: adminImages, error: adminImagesError } = await supabase
            .from("admin_report_images")
            .select("*")
            .in("report_id", reportIds)

          if (userImagesError) {
            console.error("Error fetching user images:", userImagesError)
          }

          if (adminImagesError) {
            console.error("Error fetching admin images:", adminImagesError)
          }

          const allImages: ReportImage[] = [
            ...(userImages || []).map((img) => ({ ...img, uploaded_by: "user" as const })),
            ...(adminImages || []).map((img) => ({ ...img, uploaded_by: "admin" as const })),
          ]

          const imagesByReport: { [reportId: string]: ImageWithUrl[] } = {}

          for (const image of allImages) {
            if (!imagesByReport[image.report_id]) {
              imagesByReport[image.report_id] = []
            }

            imagesByReport[image.report_id].push({
              id: image.id,
              url: image.image_url,
              uploaded_by: image.uploaded_by,
            })
          }

          setReportImages(imagesByReport)
        } catch (error) {
          console.error("Unexpected error fetching report images:", error)
        }
      }

      const ids = nearbyReports.map((r) => r.id)
      await fetchReportImages(ids)
    } catch (error) {
      console.error("Unexpected error fetching nearby reports:", error)
      setLocationError("Failed to load nearby reports")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchNearbyReports()
  }

  const openReportDetail = (report: Report) => {
    setSelectedReport(report)
    setDetailModalVisible(true)
  }

  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageViewerVisible(true)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, "_")) {
      case "pending":
        return "#E74C3C"
      case "in_progress":
        return "#F39C12"
      case "resolved":
        return "#2ECC71"
      default:
        return "#F39C12"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, "_")) {
      case "pending":
        return "Pending"
      case "in_progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      default:
        return "Pending"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#E74C3C"
      case "medium":
        return "#F39C12"
      case "low":
        return "#2ECC71"
      default:
        return "#F39C12"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return date.toLocaleDateString("en-US", options as any)
  }

  const handleAffectedVote = async (reportId: string) => {
    try {
      const isCurrentlyVoted = userAffectedVotes.has(reportId)
      const rpcFunction = isCurrentlyVoted ? "decrement_affected" : "increment_affected"

      const { error } = await supabase.rpc(rpcFunction, { report_id: reportId })

      if (error) {
        console.error("Error updating affected count:", error)
        Alert.alert("Error", "Failed to update vote")
        return
      }

      const newVotes = new Set(userAffectedVotes)
      if (isCurrentlyVoted) {
        newVotes.delete(reportId)
      } else {
        newVotes.add(reportId)
      }
      setUserAffectedVotes(newVotes)

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? {
              ...report,
              affected_count: isCurrentlyVoted ? (report.affected_count || 0) - 1 : (report.affected_count || 0) + 1,
            }
            : report,
        ),
      )

      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) =>
          prev
            ? {
              ...prev,
              affected_count: isCurrentlyVoted ? (prev.affected_count || 0) - 1 : (prev.affected_count || 0) + 1,
            }
            : null,
        )
      }
    } catch (error) {
      console.error("Unexpected error voting:", error)
      Alert.alert("Error", "Failed to update vote")
    }
  }

  const handleFalseReport = async (reportId: string) => {
    try {
      const { error } = await supabase.rpc("increment_false", { report_id: reportId })

      if (error) {
        console.error("Error marking as false report:", error)
        Alert.alert("Error", "Failed to mark as false report")
        return
      }

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, false_count: (report.false_count || 0) + 1 } : report,
        ),
      )

      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) =>
          prev
            ? {
              ...prev,
              false_count: (prev.false_count || 0) + 1,
            }
            : null,
        )
      }

      setShowOptionsMenu(false)
      Alert.alert("Success", "Report marked as false")
    } catch (error) {
      console.error("Unexpected error marking false report:", error)
      Alert.alert("Error", "Failed to mark as false report")
    }
  }

  const renderReportCard = (report: Report) => {
    const images = reportImages[report.id] || []
    const userImages = images.filter((img) => img.uploaded_by === "user")
    const adminImages = images.filter((img) => img.uploaded_by === "admin")
    const isAffectedVoted = userAffectedVotes.has(report.id)

    return (
      <TouchableOpacity key={report.id} style={styles.reportCard} onPress={() => openReportDetail(report)}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{report.issue_type}</Text>
          <View style={styles.modalHeaderActions}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                {getStatusText(report.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{formatDate(report.created_at)}</Text>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{report.distance}km away</Text>
          </View>
        </View>

        <View style={styles.affectedCountDisplay}>
          <Text style={styles.affectedIcon}>👥</Text>
          <Text style={styles.affectedCountText}>{report.affected_count || 0} affected</Text>
        </View>

        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {report.location}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderDetailModal = () => {
    if (!selectedReport) return null

    const images = reportImages[selectedReport.id] || []
    const userImages = images.filter((img) => img.uploaded_by === "user")
    const adminImages = images.filter((img) => img.uploaded_by === "admin")
    const isAffectedVoted = userAffectedVotes.has(selectedReport.id)

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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedReport.issue_type}</Text>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity
                    style={styles.optionsMenuButton}
                    onPress={() => setShowOptionsMenu(!showOptionsMenu)}
                  >
                    <Text style={styles.optionsMenuButtonText}>⋮</Text>
                  </TouchableOpacity>
                  {showOptionsMenu && (
                    <View style={styles.optionsDropdown}>
                      <TouchableOpacity
                        style={[
                          styles.optionsMenuItem,
                          isAffectedVoted && styles.optionsMenuItemDisabled,
                        ]}
                        onPress={() => !isAffectedVoted && handleFalseReport(selectedReport.id)}
                        disabled={isAffectedVoted}
                      >
                        <Text
                          style={[
                            styles.optionsMenuItemText,
                            isAffectedVoted && { color: "#999999" },
                          ]}
                        >
                          {isAffectedVoted
                            ? "Cannot mark as false when affected"
                            : "Mark as False Report"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.detailStatusRow}>
                <View style={[styles.statusBadge, styles.detailStatusBadge]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedReport.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                    {getStatusText(selectedReport.status)}
                  </Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{selectedReport.distance}km away</Text>
                </View>
              </View>

              <Text style={styles.detailDescription}>{selectedReport.description}</Text>

              <View style={styles.modalVotingSection}>
                <TouchableOpacity
                  style={[styles.modalAffectedButton, isAffectedVoted && styles.modalAffectedButtonActive]}
                  onPress={() => handleAffectedVote(selectedReport.id)}
                >
                  <Text
                    style={[styles.modalAffectedButtonText, isAffectedVoted && styles.modalAffectedButtonTextActive]}
                  >
                    {isAffectedVoted ? "✓ Affected" : "Mark as Affected"}
                  </Text>
                  <Text style={[styles.modalAffectedCount, isAffectedVoted && styles.modalAffectedCountActive]}>
                    {selectedReport.affected_count || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {userImages.length > 0 && (
                <View style={styles.detailImagesSection}>
                  <Text style={styles.detailImagesSectionTitle}>Photos</Text>
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

              <Text style={styles.detailLocation}>📍 {selectedReport.location}</Text>
              <Text style={styles.detailTimestamp}>Reported on {formatDate(selectedReport.created_at)}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.closeDetailButton} onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.closeDetailButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  const renderImageViewerModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerCloseButton} onPress={() => setImageViewerVisible(false)}>
            <Text style={styles.imageViewerCloseButtonText}>✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F39C12" />
          <Text style={styles.loadingText}>Finding nearby reports...</Text>
        </View>
      </View>
    )
  }

  if (locationError) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Nearby Reports</Text>
              <Text style={styles.headerSubtitle}>Issues reported in your area</Text>
            </View>
            <TouchableOpacity style={styles.headerRefreshButton} onPress={onRefresh}>
              <Text style={styles.headerRefreshButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F39C12"]}
              tintColor="#F39C12"
              title="Pull to refresh"
              titleColor="#F39C12"
            />
          }
        >
          <Text style={styles.emptyStateText}>📍</Text>
          <Text style={styles.emptyStateTitle}>Location Required</Text>
          <Text style={styles.emptyStateDescription}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNearbyReports}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Nearby Reports</Text>
            <Text style={styles.headerSubtitle}>Issues reported within 5km of your location</Text>
          </View>
          <TouchableOpacity style={styles.headerRefreshButton} onPress={onRefresh}>
            <Text style={styles.headerRefreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {reports.length === 0 ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F39C12"]}
              tintColor="#F39C12"
              title="Pull to refresh"
              titleColor="#F39C12"
            />
          }
        >
          <Text style={styles.emptyStateText}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No Nearby Reports</Text>
          <Text style={styles.emptyStateDescription}>
            There are no reports within 5km of your current location. Check back later or report an issue yourself.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.reportsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F39C12"]}
              tintColor="#F39C12"
              title="Pull to refresh"
              titleColor="#F39C12"
            />
          }
        >
          {reports.map(renderReportCard)}
        </ScrollView>
      )}

      {renderDetailModal()}
      {renderImageViewerModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingBottom: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555555",
  },
  optionsMenuItemDisabled: {
    backgroundColor: '#F0F0F0',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#555555",
  },
  reportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reportCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
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
    fontWeight: "600",
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 12,
    color: "#999999",
  },
  distanceBadge: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  thumbnailContainer: {
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 8,
  },
  imageSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
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
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    fontSize: 10,
    color: "#555555",
    fontWeight: "bold",
  },
  cardLocation: {
    fontSize: 12,
    color: "#777777",
    fontStyle: "italic",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#F39C12",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  detailStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  detailStatusBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailDescription: {
    fontSize: 16,
    color: "#555555",
    lineHeight: 24,
    marginBottom: 16,
  },
  detailImagesSection: {
    marginBottom: 16,
  },
  detailImagesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
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
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  adminRemarkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F39C12",
    marginBottom: 4,
  },
  adminRemarkText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  detailLocation: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 8,
  },
  detailTimestamp: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 20,
  },
  closeDetailButton: {
    backgroundColor: "#F39C12",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  closeDetailButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  imageViewerCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 20,
  },
  imageViewerCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRefreshButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  headerRefreshButtonText: {
    fontSize: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    position: "relative",
  },
  modalHeaderActions: {
    position: "relative",
  },
  optionsMenuButton: {
    padding: 8,
    borderRadius: 4,
  },
  optionsMenuButtonText: {
    fontSize: 20,
    color: "#666666",
    fontWeight: "bold",
  },
  optionsDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 180,
    zIndex: 1000,
  },
  optionsMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionsMenuItemText: {
    fontSize: 14,
    color: "#E53E3E",
    fontWeight: "500",
  },
  modalVotingSection: {
    marginBottom: 20,
  },
  modalAffectedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalAffectedButtonActive: {
    backgroundColor: "#E8F5E8",
    borderColor: "#2ECC71",
  },
  modalAffectedButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  modalAffectedButtonTextActive: {
    color: "#2ECC71",
    fontWeight: "600",
  },
  modalAffectedCount: {
    fontSize: 16,
    color: "#999999",
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 32,
    textAlign: "center",
  },
  modalAffectedCountActive: {
    color: "#2ECC71",
    backgroundColor: "#F0F8F0",
  },
  affectedCountDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  affectedIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  affectedCountText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
})

export default NearbyReports