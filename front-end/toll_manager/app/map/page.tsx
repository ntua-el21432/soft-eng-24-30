/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

// Dynamically import MapContainer and related components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface Station {
  stationID: string;
  companyID: string;
  location: {
    lat: number;
    lng: number;
  };
  stationName: string;
  stationRoad: string;
  stationLocality: string;
  stationPriceCar: number;
  stationPriceTruck: number;
  stationPriceBus: number;
  stationPriceBike: number;
}

interface Operator {
  company_id: string;
  company_name: string;
}

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyID, setSelectedCompanyID] = useState<string>("");

  useEffect(() => {
    // Fetch operators from API
    const fetchOperators = async () => {
      try {
        const response = await fetch("http://localhost:9115/api/operators");
        if (!response.ok) {
          throw new Error("Failed to fetch operators");
        }
        const data = await response.json();
        setOperators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchOperators();
  }, []);

  useEffect(() => {
    // Fetch toll stations from API
    const fetchStations = async () => {
      setLoading(true);
      try {
        const url = selectedCompanyID
          ? `http://localhost:9115/api/mapStations/${selectedCompanyID}`
          : "http://localhost:9115/api/mapStations";

        const response = await fetch(url);
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
  }, [selectedCompanyID]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: "10px", backgroundColor: "#000000" }}>
        <label htmlFor="operator-select">Select Operator: </label>
        <select
          id="operator-select"
          value={selectedCompanyID}
          onChange={(e) => setSelectedCompanyID(e.target.value)}
          style={{ color: "black" }}
        >
          <option value="">All Operators</option>
          {operators.map((operator) => (
            <option key={operator.company_id} value={operator.company_id}>
              {operator.company_name}
            </option>
          ))}
        </select>
      </div>
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
              Company Name : {operators.find(op => op.company_id === station.companyID)?.company_name || "Unknown"} <br />
              Station Name: {station.stationName} <br />
              Station Road: {station.stationRoad} <br />
              Station Locality: {station.stationLocality} <br />
              Price Bike : {station.stationPriceBike} €<br />
              Price Car : {station.stationPriceCar} €<br />
              Price Truck : {station.stationPriceTruck} €<br />
              Price Bus : {station.stationPriceBus} €<br />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
