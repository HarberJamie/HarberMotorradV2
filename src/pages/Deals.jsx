// src/pages/Deals.jsx
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "harbermotorrad:deals";

export default function Deals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // newest first
      setDeals(data.slice().reverse());
    } catch {
      setDeals([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Deals</h1>

      {deals.length === 0 ? (
        <p className="text-sm text-gray-600">No deals yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Created</th>
                <th className="p-3">Deal Type</th>
                <th className="p-3">Model</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Agreed Price (£)</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 font-mono">{d.id.slice(0, 8)}…</td>
                  <td className="p-3">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="p-3">{d.dealType || "-"}</td>
                  <td className="p-3">{d.saleBikeModel || "-"}</td>
                  <td className="p-3">{d.customerName || "-"}</td>
                  <td className="p-3">{d.agreedPrice ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
