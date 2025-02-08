"use client"; // Required for client-side interactivity

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import axios from "axios";
import { useEffect, useState } from "react";

// Define the structure of a toll station
interface TollStation {
  stationID: string;
  location: {
    lat: number;
    lng: number;
  };
  name?: string;
  operator?: string;
  address?: string;
  tollCostCar?: number;
  tollCostBike?: number;
  tollCostTruck?: number;
  tollCostBus?: number;
}

export default function MapPage() {
  const [tollStations, setTollStations] = useState<TollStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<TollStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<TollStation | null>(null);
  const [operators, setOperators] = useState<string[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch all toll stations on page load
  useEffect(() => {
    const fetchTollStations = async () => {
      try {
        const response = await axios.get("http://localhost:9115/api/tollStations");
        setTollStations(response.data);
        setFilteredStations(response.data);

        // Extract unique operators for the dropdown
        const uniqueOperators = Array.from(
          new Set(response.data.map((station: TollStation) => station.operator))
        );
        setOperators(uniqueOperators.filter(Boolean) as string[]);
      } catch (err) {
        setError("Failed to load toll stations. Please try again.");
      }
    };

    fetchTollStations();
  }, []);

  // Handle operator filter change
  const handleOperatorFilter = async (operatorID: string) => {
    setSelectedOperator(operatorID);
    try {
      const response = await axios.get(
        `http://localhost:9115/api/tollStations/${operatorID}`
      );
      setFilteredStations(response.data);
    } catch (err) {
      setError("Failed to filter toll stations. Please try again.");
    }
  };

  // Handle station selection
  const handleStationClick = async (stationID: string) => {
    try {
      const response = await axios.get(
        `http://localhost:9115/api/tollStations/${stationID}`
      );
      setSelectedStation(response.data);
    } catch (err) {
      setError("Failed to load station details. Please try again.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Toll Stations Map</h1>

      {/* Operator Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="operator" className="mr-2">
          Filter by Operator:
        </label>
        <select
          id="operator"
          value={selectedOperator}
          onChange={(e) => handleOperatorFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Operators</option>
          {operators.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Map Container */}
      <MapContainer
        center={[37.9838, 23.7275]} // Center on Athens, Greece
        zoom={10}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Display Filtered Stations as Pins */}
        {filteredStations.map((station) => (
          <Marker
            key={station.stationID}
            position={[station.location.lat, station.location.lng] as LatLngExpression}
            eventHandlers={{
              click: () => handleStationClick(station.stationID),
            }}
          >
            {/* Popup with Station Details */}
            {selectedStation?.stationID === station.stationID && (
              <Popup>
                <div>
                  <h2 className="font-bold">{selectedStation.name}</h2>
                  <p>Operator: {selectedStation.operator}</p>
                  <p>Address: {selectedStation.address}</p>
                  <p>Costs:</p>
                  <ul>
                    <li>Car: €{selectedStation.tollCostCar}</li>
                    <li>Bike: €{selectedStation.tollCostBike}</li>
                    <li>Truck: €{selectedStation.tollCostTruck}</li>
                    <li>Bus: €{selectedStation.tollCostBus}</li>
                  </ul>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}