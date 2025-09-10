// LocationPickerModal.tsx
import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
}

// This is the HTML and JavaScript for the map inside the WebView
const mapHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Leaflet Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .search-container {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            width: 90%;
            display: flex;
        }
        #search-input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px 0 0 5px;
            font-size: 16px;
        }
        #search-button {
            padding: 10px;
            border: 1px solid #007bff;
            background-color: #007bff;
            color: white;
            border-radius: 0 5px 5px 0;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="search-container">
        <input type="text" id="search-input" placeholder="Search for a location...">
        <button id="search-button">Search</button>
    </div>

    <script>
        // Initialize map centered on India
        const map = L.map('map').setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        let marker = null;

        // Function to send data back to React Native
        function sendLocation(lat, lng, address) {
            const data = { lat, lng, address };
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }

        // Handle map clicks
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng).addTo(map);
            }
            // Reverse geocode to get address
            fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`)
                .then(res => res.json())
                .then(data => {
                    const address = data.display_name || 'Selected Location';
                    marker.bindPopup(address).openPopup();
                    sendLocation(lat, lng, address);
                });
        });

        // Handle search
        document.getElementById('search-button').addEventListener('click', function() {
            const query = document.getElementById('search-input').value;
            if (!query) return;

            fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${query}\`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const { lat, lon, display_name } = data[0];
                        const newLatLng = new L.LatLng(lat, lon);
                        map.setView(newLatLng, 15);
                        if (marker) {
                            marker.setLatLng(newLatLng);
                        } else {
                            marker = L.marker(newLatLng).addTo(map);
                        }
                        marker.bindPopup(display_name).openPopup();
                        sendLocation(parseFloat(lat), parseFloat(lon), display_name);
                    } else {
                        alert('Location not found');
                    }
                });
        });
    </script>
</body>
</html>
`;

const LocationPickerModal: React.FC<LocationPickerProps> = ({ visible, onClose, onLocationSelect }) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.lat && data.lng && data.address) {
        onLocationSelect(data);
        onClose(); // Close the modal once a location is selected
      }
    } catch (error) {
      console.error("Failed to parse message from WebView", error);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Select Location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
        
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  webview: {
    flex: 1,
  },
});

export default LocationPickerModal;