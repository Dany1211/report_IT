import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from "../../supabaseClient";

// Import components
import HeaderDashboard from '../components/HeaderDashboard';
import ActionsTips from '../components/ActionsTips';
import ReportModal from '../components/ReportModal';
import NotificationModal from '../components/NotificationModal'
import NearbyReports from '../components/Nearby';


interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const HomeScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Placeholder data
  const statsData = {
    totalReports: 142,
    pendingIssues: 28,
    resolvedIssues: 114,
  };

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

  const submitReport = async (reportData: any) => {
    console.log('Submitting report:', reportData);
    setModalVisible(false);
    Alert.alert('Success', 'Your report has been submitted successfully!');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error.message);
          } else {
            setUser({
              name: data?.name || "Unknown",
              email: data?.email || "No email",
            });
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <LinearGradient
      colors={['#FFF9F0', '#FFF1C6']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />

      <ScrollView showsVerticalScrollIndicator={false}>
      <HeaderDashboard
      //@ts-ignore
        userName={user?.name || "Loading..."}
        onNotificationPress={() => setNotificationModalVisible(true)}
        statsData={statsData}
      />

      <ActionsTips
        onReportIssue={() => setModalVisible(true)}
      />
      
      <NearbyReports />
      </ScrollView>

      <ReportModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      // @ts-ignore 
      onSubmit={submitReport}
      />

      <NotificationModal
      visible={notificationModalVisible}
      onClose={() => setNotificationModalVisible(false)}
      notifications={notifications}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;