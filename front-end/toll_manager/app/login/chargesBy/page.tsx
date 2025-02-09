/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface ChargesByResponse {
  tollOpID: string;
  requestTimestamp: string;
  periodFrom: string;
  periodTo: string;
  vOpList: {
    visitingOpID: string;
    nPasses: number;
    passesCost: number;
  }[];
}

interface TollCompany {
  company_id: string;
  company_name: string;
}

export default function ChargesByCalculator() {
  const [tollOpID, setTollOpID] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [result, setResult] = useState<ChargesByResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<TollCompany[]>([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await axios.get("http://localhost:9115/api/operators");
        setOperators(response.data);
      } catch (err) {
        console.error("Error fetching operators:", err);
        setError("Σφάλμα στην ανάκτηση των operators.");
      }
    };
    fetchOperators();
  }, []);

  const fetchChargesBy = async () => {
    try {
      setError(null);
      setResult(null);

      if (!tollOpID || !dateFrom || !dateTo) {
        setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
        return;
      }

      if (dateFrom > dateTo) {
        setError("Η ημερομηνία 'From' πρέπει να είναι μικρότερη ή ίση με την ημερομηνία 'To'.");
        return;
      }

      const formattedDateFrom = format(dateFrom, "yyyyMMdd");
      const formattedDateTo = format(dateTo, "yyyyMMdd");

      const url = `http://localhost:9115/api/chargesBy/${tollOpID}/${formattedDateFrom}/${formattedDateTo}`;
      const response = await axios.get<ChargesByResponse>(url);

      if (response.status === 204) {
        setError("Δεν βρέθηκαν δεδομένα για το συγκεκριμένο διάστημα.");
        return;
      }

      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching charges by:", err.message);
      setError("Σφάλμα στην ανάκτηση των δεδομένων. Ελέγξτε τα πεδία και δοκιμάστε ξανά.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Charges By Calculator</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm mb-1">Select Toll Operator</label>
            <select
              value={tollOpID}
              onChange={(e) => setTollOpID(e.target.value)}
              className="p-3 bg-gray-800 text-white rounded w-full"
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
          </div>

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
          onClick={fetchChargesBy}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate Charges By
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded text-center">
            <p className="text-lg font-semibold">Toll Operator: <strong>{result.tollOpID}</strong></p>
            <div className="mt-4">
              <table className="table-fixed w-full border border-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="w-4/12 px-2 py-2 border border-gray-600">Visiting Operator ID</th>
                    <th className="w-4/12 px-2 py-2 border border-gray-600">Number of Passes</th>
                    <th className="w-4/12 px-2 py-2 border border-gray-600">Passes Cost (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.vOpList.map((entry) => (
                    <tr key={entry.visitingOpID} className="text-center">
                      <td className="px-2 py-2 border border-gray-600">{entry.visitingOpID}</td>
                      <td className="px-2 py-2 border border-gray-600">{entry.nPasses}</td>
                      <td className="px-2 py-2 border border-gray-600">{Number(entry.passesCost).toFixed(2)}</td>
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
