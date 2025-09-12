import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  // +++ ADDED: Accept initial coordinates from the parent component +++
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}

const LocationPickerModal: React.FC<LocationPickerProps> = ({ 
    visible, 
    onClose, 
    onLocationSelect, 
    initialLatitude, 
    initialLongitude 
}) => {
  const webViewRef = useRef<WebView>(null);

  // Dynamically generate the map's HTML to inject the initial coordinates
  const getMapHtml = () => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            :root {
                --primary-color: #F39C12;
                --primary-text: #FFFFFF;
            }
            body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            
            /* Search container */
            .search-container {
                position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; display: flex;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden;
            }
            #search-input { flex-grow: 1; padding: 12px; border: none; font-size: 16px; outline: none; }
            #search-button { padding: 0 16px; border: none; background-color: var(--primary-color); color: var(--primary-text); cursor: pointer; font-size: 16px; }

            /* Current Location Button */
            .locate-button {
                position: absolute; bottom: 100px; right: 15px; z-index: 1000; background-color: white; border: 2px solid #ccc;
                border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;
                cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }

            /* Confirm Button */
            #confirm-button {
                position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 15px 30px;
                background-color: var(--primary-color); color: var(--primary-text); border: none; border-radius: 30px;
                font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                opacity: 0.5; pointer-events: none; transition: opacity 0.3s ease;
            }
            #confirm-button.enabled { opacity: 1; pointer-events: auto; }
            #loader {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;
                background-color: rgba(255, 255, 255, 0.8); padding: 20px; border-radius: 8px; display: none;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search for a location...">
            <button id="search-button">Search</button>
        </div>
        <div id="loader">Locating...</div>
        <div class="locate-button" onclick="goToCurrentLocation()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L12 5"/><path d="M12 19L12 22"/><path d="M5 12L2 12"/><path d="M22 12L19 12"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>
        </div>
        <button id="confirm-button">Confirm Location</button>

        <script>
            const map = L.map('map').setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            let marker = null;
            let selectedLocation = null;
            const confirmButton = document.getElementById('confirm-button');
            const loader = document.getElementById('loader');
            
            // +++ MODIFIED: Get initial coords passed from React Native +++
            const initialLat = ${initialLatitude || 'null'};
            const initialLng = ${initialLongitude || 'null'};

            function updateMarker(lat, lng, address) {
                if (marker) { marker.setLatLng([lat, lng]); } 
                else { marker = L.marker([lat, lng]).addTo(map); }
                marker.bindPopup(address).openPopup();
                selectedLocation = { lat, lng, address };
                confirmButton.classList.add('enabled');
            }
            
            function postLocationToReactNative() {
                if (selectedLocation) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(selectedLocation));
                }
            }

            function reverseGeocode(lat, lng) {
                 fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`)
                    .then(res => res.json())
                    .then(data => {
                        const address = data.display_name || 'Selected Location';
                        updateMarker(lat, lng, address);
                    })
                    .catch(error => console.error('Reverse geocode failed:', error));
            }

            function goToCurrentLocation() {
                loader.style.display = 'block';
                navigator.geolocation.getCurrentPosition(position => {
                    loader.style.display = 'none';
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 16);
                    reverseGeocode(latitude, longitude);
                }, error => {
                    loader.style.display = 'none';
                    let alertMessage = "Could not retrieve your location.";
                    if (error.code === 1) alertMessage = "Location permission was denied.";
                    else if (error.code === 2) alertMessage = "Location is unavailable. Please make sure your device's GPS is turned on.";
                    alert(alertMessage);
                }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
            }

            map.on('click', e => reverseGeocode(e.latlng.lat, e.latlng.lng));
            document.getElementById('search-button').addEventListener('click', () => {
                const query = document.getElementById('search-input').value;
                if (!query) return;
                fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${query}&countrycodes=in\`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const { lat, lon, display_name } = data[0];
                            map.setView([lat, lon], 16);
                            updateMarker(parseFloat(lat), parseFloat(lon), display_name);
                        } else { alert('Location not found'); }
                    });
            });
            confirmButton.addEventListener('click', postLocationToReactNative);

            // +++ MODIFIED: Use initial location if available, otherwise fallback +++
            window.addEventListener('load', () => {
                if (initialLat && initialLng) {
                    map.setView([initialLat, initialLng], 16);
                    reverseGeocode(initialLat, initialLng);
                } else {
                    goToCurrentLocation();
                }
            });
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.lat && data.lng && data.address) {
        onLocationSelect(data);
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
          source={{ html: getMapHtml() }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          geolocationEnabled={true} 
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 17,
    color: '#F39C12',
    fontWeight: '500'
  },
  webview: {
    flex: 1,
  },
});

export default LocationPickerModal;

