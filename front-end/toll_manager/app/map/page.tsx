"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

interface Station {
  stationID: number;
  companyID: number;
  location: {
    lat: number;
    lng: number;
  };
}

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch toll stations from the API
    const fetchStations = async () => {
      try {
        const response = await fetch("http://localhost:9115/api/mapStations");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[39.0742, 21.8243]} // Center of Greece
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
          <Marker
            key={station.stationID}
            position={[station.location.lat, station.location.lng]}
          >
            <Popup>
              Station ID: {station.stationID} <br />
              Company ID: {station.companyID}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}