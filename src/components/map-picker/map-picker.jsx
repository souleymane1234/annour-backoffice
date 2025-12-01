import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Marker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { Box, Typography } from '@mui/material';

// Fix pour les icônes par défaut de Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Composant pour recentrer la carte quand les coordonnées changent
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Composant pour gérer les clics sur la carte
function LocationMarker({ position, onPositionChange }) {
  const [markerPosition, setMarkerPosition] = useState(position || null);

  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPosition);
      if (onPositionChange) {
        onPositionChange(newPosition[0], newPosition[1]);
      }
    },
  });

  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      const [lat, lng] = position;
      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        (markerPosition?.[0] !== lat || markerPosition?.[1] !== lng)
      ) {
        setMarkerPosition([lat, lng]);
      }
    } else if (!position && markerPosition) {
      setMarkerPosition(null);
    }
  }, [position]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export default function MapPicker({ latitude, longitude, onLocationChange, height = 400 }) {
  const [mapCenter, setMapCenter] = useState([14.7167, -17.4677]); // Dakar par défaut

  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setMapCenter([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  // Essayer de récupérer la position de l'utilisateur seulement une fois au chargement initial
  useEffect(() => {
    if (!latitude && !longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMapCenter([lat, lng]);
          if (onLocationChange) {
            onLocationChange(lat, lng);
          }
        },
        () => {
          // En cas d'erreur, garder Dakar par défaut (silencieux)
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationChange = (lat, lng) => {
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Cliquez sur la carte pour sélectionner l&apos;emplacement de la station
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: `${height}px`,
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
          },
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={mapCenter} zoom={13} />
          <LocationMarker
            position={
              latitude && longitude && !Number.isNaN(parseFloat(latitude)) && !Number.isNaN(parseFloat(longitude))
                ? [parseFloat(latitude), parseFloat(longitude)]
                : null
            }
            onPositionChange={handleLocationChange}
          />
        </MapContainer>
      </Box>
    </Box>
  );
}

