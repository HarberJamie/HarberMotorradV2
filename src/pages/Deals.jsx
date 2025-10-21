// src/pages/Deals.jsx
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "harbermotorrad:deals";

export default function Deals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setDeals(data.slice().reverse()); // newest first
    } catch {
      setDeals([]);
    }
  }, []);

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
      <h2 style={{ marginBottom: 12 }}>Deals</h2>

      {deals.length === 0 ? (
        <p>No deals yet. Add one via “Add New Deal”.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#1b2143" }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Created</th>
                <th style={{ padding: 8 }}>Deal Type</th>
                <th style={{ padding: 8 }}>Model</th>
                <th style={{ padding: 8 }}>Customer</th>
                <th style={{ padding: 8 }}>Agreed Price (£)</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{d.id?.slice(0, 8)}…</td>
                  <td style={{ padding: 8 }}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}</td>
                  <td style={{ padding: 8 }}>{d.dealType || "-"}</td>
                  <td style={{ padding: 8 }}>{d.saleBikeModel || "-"}</td>
                  <td style={{ padding: 8 }}>{d.customerName || "-"}</td>
                  <td style={{ padding: 8 }}>{d.agreedPrice ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
