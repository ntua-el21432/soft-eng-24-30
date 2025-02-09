/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface PassesCostResponse {
  tollOpID: string;
  tagOpID: string;
  requestTimestamp: string;
  periodFrom: string;
  periodTo: string;
  nPasses: number;
  passesCost: number;
}

interface TollCompany {
  company_id: string;
  company_name: string;
}

export default function PassesCostCalculator() {
  const [tollOpID, setTollOpID] = useState("");
  const [tagOpID, setTagOpID] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [result, setResult] = useState<PassesCostResponse | null>(null);
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

  const fetchPassesCost = async () => {
    try {
      setError(null);
      setResult(null);

      if (!tollOpID || !tagOpID || !dateFrom || !dateTo) {
        setError("Please fill in all fields.");
        return;
      }

      if (dateFrom > dateTo) {
        setError("The 'From' date must be less than or equal to the 'To' date.");
        return;
      }

      const formattedDateFrom = format(dateFrom, "yyyyMMdd");
      const formattedDateTo = format(dateTo, "yyyyMMdd");

      const url = `http://localhost:9115/api/passesCost/${tollOpID}/${tagOpID}/${formattedDateFrom}/${formattedDateTo}`;
      const response = await axios.get<PassesCostResponse>(url);

      if (response.status === 204) {
        setError("No data found for the specified period.");
        return;
      }

      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching passes cost:", err.message);
      setError("Error fetching data. Please check the fields and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Passes Cost Calculator</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={tollOpID}
            onChange={(e) => setTollOpID(e.target.value)}
            className="p-3 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Toll Operator
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
          onClick={fetchPassesCost}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate Passes Cost
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded text-center">
            <p>
              Number of Passes: <strong>{result.nPasses}</strong>
            </p>
            <p>
              Total Passes Cost: <strong>{Number(result.passesCost).toFixed(2)} €</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
