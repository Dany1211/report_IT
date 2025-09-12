import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Make sure to install @react-navigation/native
import { supabase } from '../../supabaseClient'; // Adjust this path to your supabase client

const { width } = Dimensions.get('window');

// Props now only requires the event handler
interface HeaderDashboardProps {
  onNotificationPress: () => void;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({ 
  onNotificationPress 
}) => {
  // State for user name, stats, and loading status
  const [userName, setUserName] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    totalReports: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  // useFocusEffect will run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          // 1. Fetch the current user and their profile name
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .single();
            
            if (profileError) throw profileError;
            setUserName(profile?.name || user.email?.split('@')[0] || 'User');
          }

          // 2. Fetch report stats concurrently for better performance
          const [totalResponse, pendingResponse, resolvedResponse] = await Promise.all([
            // Get total count of all reports
            supabase.from('reports').select('*', { count: 'exact', head: true }),
            // Get count of pending or in-progress issues
            supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['Pending', 'In Progress']),
            // Get count of resolved issues
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Resolved')
          ]);

          if (totalResponse.error) throw totalResponse.error;
          if (pendingResponse.error) throw pendingResponse.error;
          if (resolvedResponse.error) throw resolvedResponse.error;

          // 3. Update the stats state
          setStatsData({
            totalReports: totalResponse.count || 0,
            pendingIssues: pendingResponse.count || 0,
            resolvedIssues: resolvedResponse.count || 0,
          });

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          // You could set an error state here to show a message to the user
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();

      // Return a cleanup function if needed, though not necessary for this implementation
      return () => {};
    }, [])
  );

  return (
    <>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {userName || "..."}!</Text>
          <Text style={styles.subtitleText}>Help improve your city with one tap.</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Section */}
      <View style={styles.dashboardContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F39C12" />
          </View>
        ) : (
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
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    height: 70, // Matches approx height of stat cards
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 70, // Added for consistency
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
});

export default HeaderDashboard;