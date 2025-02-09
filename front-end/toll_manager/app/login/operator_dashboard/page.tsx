"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

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
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [result, setResult] = useState<NetChargesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<TollCompany[]>([]);

  // Ανάκτηση των operators από το API
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

  const fetchNetCharges = async () => {
    try {
      // Καθαρίζουμε προηγούμενα μηνύματα/αποτελέσματα
      setError(null);
      setResult(null);

      if (!tollOpID1 || !tollOpID2 || !dateFrom || !dateTo) {
        setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
        return;
      }

      // Έλεγχος σειράς ημερομηνιών: δεν γίνεται αυτόματη αλλαγή (swap)
      if (dateFrom > dateTo) {
        setError("Η ημερομηνία 'From' πρέπει να είναι μικρότερη ή ίση με την ημερομηνία 'To'.");
        return;
      }

      // Μετατροπή των ημερομηνιών σε μορφή YYYYMMDD χρησιμοποιώντας date-fns
      const formattedDateFrom = format(dateFrom, "yyyyMMdd");
      const formattedDateTo = format(dateTo, "yyyyMMdd");

      const url = `http://localhost:9115/api/netCharges/${tollOpID1}/${tollOpID2}/${formattedDateFrom}/${formattedDateTo}`;
      const response = await axios.get<NetChargesResponse>(url);

      // Αν ο server επιστρέψει 204 (No Content)
      if (response.status === 204) {
        setError("Δεν βρέθηκαν συναλλαγές για το συγκεκριμένο διάστημα.");
        return;
      }

      setResult(response.data);
    } catch (err: any) {
      console.error("Error fetching net charges:", err.message);
      setError("Σφάλμα στην ανάκτηση των δεδομένων. Ελέγξτε τα πεδία και δοκιμάστε ξανά.");
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
          onClick={fetchNetCharges}
          className="w-full bg-blue-500 text-white py-3 mt-6 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate Net Charges
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <p>
              Net revenue between <strong>{result.tollOpID1}</strong> and{" "}
              <strong>{result.tollOpID2}</strong> during the period{" "}
              <strong>{result.periodFrom}</strong> until <strong>{result.periodTo}</strong> is:{" "}
              <strong>{result.netCharges} €</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
