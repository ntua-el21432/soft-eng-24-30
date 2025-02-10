/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface PassRecord {
  passIndex: number;
  passID: string;
  timestamp: string;
  tagID: string;
  tagProvider: string;
  passType: string;
  passCharge: number;
}

interface TollStationPassesResponse {
  stationID: string;
  stationOperator: string;
  requestTimestamp: string;
  periodFrom: string;
  periodTo: string;
  nPasses: number;
  passList: PassRecord[];
}

interface TollStation {
  station_id: string;
  station_name: string;
}

export default function TollStationPasses() {
  const [tollStationID, setTollStationID] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [result, setResult] = useState<TollStationPassesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<TollStation[]>([]);

  // Fetch toll stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const token = localStorage.getItem("authToken"); // ✅ Get auth token
        if (!token) {
          setError("Unauthorized: Please log in.");
          return;
        }
  
        const response = await axios.get("http://localhost:9115/api/stations", { // ✅ Corrected API path
          headers: {
            "X-OBSERVATORY-AUTH": token, // ✅ Attach token for authentication
          },
        });
  
        setStations(response.data);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError("Failed to fetch toll stations. Ensure the server is running and the token is valid.");
      }
    };
    fetchStations();
  }, []);
  

  const fetchPasses = async () => {
    try {
      setError(null);
      setResult(null);

      if (!tollStationID || !dateFrom || !dateTo) {
        setError("Please fill in all fields.");
        return;
      }

      if (dateFrom > dateTo) {
        setError("The 'From' date must be before or equal to the 'To' date.");
        return;
      }

      const formattedDateFrom = format(dateFrom, "yyyyMMdd");
      const formattedDateTo = format(dateTo, "yyyyMMdd");

      const url = `http://localhost:9115/api/tollStationPasses/${tollStationID}/${formattedDateFrom}/${formattedDateTo}`;
      const response = await axios.get<TollStationPassesResponse>(url);

      if (response.status === 204) {
        setError("No pass records found for this period.");
        return;
      }

      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching pass records:", err.message);
      setError("Error retrieving data. Please check your inputs and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-3xl bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Toll Station Passes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm mb-1">Select Toll Station</label>
            <select
              value={tollStationID}
              onChange={(e) => setTollStationID(e.target.value)}
              className="p-3 bg-gray-800 text-white rounded w-full"
            >
              <option value="" disabled>
                Select Toll Station
              </option>
              {stations.map((station) => (
                <option key={station.station_id} value={station.station_id}>
                  {station.station_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="dateFrom" className="text-sm mb-1">
              Select Date From (YYYYMMDD)
            </label>
            <DatePicker
              id="dateFrom"
              selected={dateFrom}
              onChange={(date: Date | null) => setDateFrom(date)}
              dateFormat="yyyyMMdd"
              placeholderText="YYYYMMDD"
              className="p-3 bg-gray-800 text-white rounded w-full"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="dateTo" className="text-sm mb-1">
              Select Date To (YYYYMMDD)
            </label>
            <DatePicker
              id="dateTo"
              selected={dateTo}
              onChange={(date: Date | null) => setDateTo(date)}
              dateFormat="yyyyMMdd"
              placeholderText="YYYYMMDD"
              className="p-3 bg-gray-800 text-white rounded w-full"
            />
          </div>
        </div>

        <button
          onClick={fetchPasses}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          View Toll Station Passes
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <p className="text-center">
              <strong>Station ID:</strong> {result.stationID} <br />
              <strong>Station Operator:</strong> {result.stationOperator} <br />
              <strong>Period:</strong> {result.periodFrom} - {result.periodTo} <br />
              <strong>Total Passes:</strong> {result.nPasses}
            </p>

            <table className="w-full mt-4 border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2 text-left">Pass ID</th>
                  <th className="p-2 text-left">Timestamp</th>
                  <th className="p-2 text-left">Tag ID</th>
                  <th className="p-2 text-left">Tag Provider</th>
                  <th className="p-2 text-left">Pass Type</th>
                  <th className="p-2 text-left">Charge (€)</th>
                </tr>
              </thead>
              <tbody>
                {result.passList.map((pass) => (
                  <tr key={pass.passID} className="border-b border-gray-700">
                    <td className="p-2">{pass.passID}</td>
                    <td className="p-2">{pass.timestamp}</td>
                    <td className="p-2">{pass.tagID}</td>
                    <td className="p-2">{pass.tagProvider}</td>
                    <td className="p-2">{pass.passType}</td>
                    <td className="p-2">{pass.passCharge ? Number(pass.passCharge).toFixed(2) : "N/A"}</td>
                  </tr>
                ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}