"use client"; // Required for Next.js if using React-Leaflet

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define toll station type
interface TollStation {
  station_id: string;
  station_name: string;
  locality: string;
  latitude: number;
  longitude: number;
}

// Dynamically import react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Custom icon for toll stations
const tollIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapPage: React.FC = () => {
  const [tollStations, setTollStations] = useState<TollStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTollStations = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/tollstations");
        if (!response.ok) {
          throw new Error("Failed to fetch toll stations");
        }
        const data: TollStation[] = await response.json();
        setTollStations(data);
      } catch (error) {
        console.error("Error fetching toll stations:", error);
        setError("Failed to load toll stations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTollStations();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="h-screen w-screen">
      <h1 className="text-center text-2xl font-bold mt-4">Toll Stations in Greece</h1>

      <MapContainer
        center={[39.0742, 21.8243]}
        zoom={7}
        style={{ height: "90vh", width: "100%" }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Map each toll station */}
        {tollStations.map((station) => (
          <Marker
            key={station.station_id}
            position={[station.latitude, station.longitude]}
            icon={tollIcon}
          >
            <Popup>
              <strong>{station.station_name}</strong>
              <br />
              Located in: {station.locality}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;