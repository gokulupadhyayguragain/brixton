import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const FriendsMap = ({ userId, token }) => {
  const [friends, setFriends] = useState([]);
  const [location, setLocation] = useState({ lat: 51.5074, lng: -0.1278 }); // London default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    updateLocation();
  }, []);

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          try {
            await axios.post(
              '/api/users/update-location',
              { latitude, longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading map...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>🗺️ Friends Map</h2>
      <MapContainer center={[location.lat, location.lng]} zoom={13} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {friends.map((friend) => (
          friend.latitude && friend.longitude && (
            <Marker key={friend.id} position={[friend.latitude, friend.longitude]}>
              <Popup>{friend.full_name}</Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      <p style={styles.info}>👥 {friends.length} friends on map</p>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    flex: 1
  },
  map: {
    height: '400px',
    marginTop: '15px',
    borderRadius: '8px'
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666'
  },
  info: {
    marginTop: '10px',
    color: '#666',
    fontSize: '14px'
  }
};

export default FriendsMap;
