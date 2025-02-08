"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface NetChargesResponse {
  tollOpID1: string;
  tollOpID2: string;
  requestTimestamp: string;
  periodFrom: string;
  periodTo: string;
  passesCostOpID2: number;
  passesCostOpID1: number;
  netCharges: number;
}

interface TollCompany {
  company_id: string;
  company_name: string;
}

export default function NetChargesCalculator() {
  const [tollOpID1, setTollOpID1] = useState("");
  const [tollOpID2, setTollOpID2] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [result, setResult] = useState<NetChargesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<TollCompany[]>([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await axios.get("http://localhost:9115/api/operators");
        setOperators(response.data);
      } catch (err) {
        console.error("Error fetching operators:", err);
      }
    };
    fetchOperators();
  }, []);

  const fetchNetCharges = async () => {
    try {
      setError(null);
      setResult(null);

      // Μετατροπή ημερομηνιών
      const formattedDateFrom = dateFrom.replace(/-/g, "");
      const formattedDateTo = dateTo.replace(/-/g, "");

      const response = await axios.get<NetChargesResponse>(
        `http://localhost:9115/api/netCharges/${tollOpID1}/${tollOpID2}/${formattedDateFrom}/${formattedDateTo}`
      );

      console.log("API Response:", response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching net charges:", err.message);
      setError("Error fetching data. Please check inputs and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Net Charges Calculator</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={tollOpID1}
            onChange={(e) => setTollOpID1(e.target.value)}
            className="p-3 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Operator 1
            </option>
            {operators.map((op) => (
              <option key={op.company_id} value={op.company_id}>
                {op.company_name}
              </option>
            ))}
          </select>

          <select
            value={tollOpID2}
            onChange={(e) => setTollOpID2(e.target.value)}
            className="p-3 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Operator 2
            </option>
            {operators.map((op) => (
              <option key={op.company_id} value={op.company_id}>
                {op.company_name}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label htmlFor="dateFrom" className="text-sm mb-1">
              Select Date From
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="p-3 bg-gray-800 text-white rounded"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="dateTo" className="text-sm mb-1">
              Select Date To
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="p-3 bg-gray-800 text-white rounded"
            />
          </div>
        </div>

        <button
          onClick={fetchNetCharges}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate Net Charges
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <p>
              Net revenue with <strong>{tollOpID1}</strong> during the period{" "}
              <strong>{result.periodFrom}</strong> until <strong>{result.periodTo}</strong> is:{" "}
              <strong>{result.netCharges} €</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
