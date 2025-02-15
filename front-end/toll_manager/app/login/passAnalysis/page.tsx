/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface PassAnalysisResponse {
  stationOpID: string;
  tagOpID: string;
  requestTimestamp: string;
  periodFrom: string;
  periodTo: string;
  nPasses: number;
  passList: {
    passIndex: number;
    passID: string;
    stationID: string;
    timestamp: string;
    tagID: string;
    passCharge: number;
  }[];
}

interface TollCompany {
  company_id: string;
  company_name: string;
}

export default function PassAnalysisCalculator() {
  const [stationOpID, setStationOpID] = useState("");
  const [tagOpID, setTagOpID] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [result, setResult] = useState<PassAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<TollCompany[]>([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await axios.get("http://localhost:9115/api/operators");
        setOperators(response.data);
      } catch (err) {
        console.error("Error fetching operators:", err);
        setError("Error fetching operators.");
      }
    };
    fetchOperators();
  }, []);

  const fetchPassAnalysis = async () => {
    try {
      setError(null);
      setResult(null);

      if (!stationOpID || !tagOpID || !dateFrom || !dateTo) {
        setError("Please fill in all fields.");
        return;
      }

      if (dateFrom > dateTo) {
        setError("The 'From' date must be less than or equal to the 'To' date.");
        return;
      }

      const formattedDateFrom = format(dateFrom, "yyyyMMdd");
      const formattedDateTo = format(dateTo, "yyyyMMdd");

      const url = `http://localhost:9115/api/passAnalysis/${stationOpID}/${tagOpID}/${formattedDateFrom}/${formattedDateTo}`;
      const response = await axios.get<PassAnalysisResponse>(url);

      if (response.status === 204) {
        setError("No data found for the specified period.");
        return;
      }

      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching pass analysis:", err.message);
      setError("Error fetching data. Please check the fields and try again.");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return (
      <div className="flex flex-col items-center">
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Pass Analysis</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={stationOpID}
            onChange={(e) => setStationOpID(e.target.value)}
            className="p-3 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Station Operator
            </option>
            {operators.map((op) => (
              <option key={op.company_id} value={op.company_id}>
                {op.company_name}
              </option>
            ))}
          </select>

          <select
            value={tagOpID}
            onChange={(e) => setTagOpID(e.target.value)}
            className="p-3 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Tag Operator
            </option>
            {operators.map((op) => (
              <option key={op.company_id} value={op.company_id}>
                {op.company_name}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Select Date From</label>
            <DatePicker
              selected={dateFrom}
              onChange={(date: Date | null) => setDateFrom(date)}
              dateFormat="yyyyMMdd"
              placeholderText="YYYYMMDD"
              className="p-3 bg-gray-800 text-white rounded w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Select Date To</label>
            <DatePicker
              selected={dateTo}
              onChange={(date: Date | null) => setDateTo(date)}
              dateFormat="yyyyMMdd"
              placeholderText="YYYYMMDD"
              className="p-3 bg-gray-800 text-white rounded w-full"
            />
          </div>
        </div>

        <button
          onClick={fetchPassAnalysis}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate Pass Analysis
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded text-center">
            <p className="text-lg font-semibold">Number of Passes: <strong>{result.nPasses}</strong></p>
            <div className="mt-4">
              <table className="table-fixed w-full border border-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="w-[calc(2/12*1.1*100%)] px-2 py-2 border border-gray-600">Index</th>
                    <th className="w-2/12 px-2 py-2 border border-gray-600">Pass ID</th>
                    <th className="w-2/12 px-2 py-2 border border-gray-600">Station ID</th>
                    <th className="w-[calc(3.6/12*0.9*100%)] px-2 py-2 border border-gray-600">Timestamp</th>
                    <th className="w-3/12 px-2 py-2 border border-gray-600">Tag ID</th>
                    <th className="w-2/12 px-2 py-2 border border-gray-600">Charge (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.passList.map((pass) => (
                    <tr key={pass.passID} className="text-center">
                      <td className="px-2 py-2 border border-gray-600">{pass.passIndex}</td>
                      <td className="px-2 py-2 border border-gray-600 truncate">{pass.passID}</td>
                      <td className="px-2 py-2 border border-gray-600 truncate">{pass.stationID}</td>
                      <td className="px-2 py-2 border border-gray-600">{formatTimestamp(pass.timestamp)}</td>
                      <td className="px-2 py-2 border border-gray-600 truncate">{pass.tagID}</td>
                      <td className="px-2 py-2 border border-gray-600">{Number(pass.passCharge).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
