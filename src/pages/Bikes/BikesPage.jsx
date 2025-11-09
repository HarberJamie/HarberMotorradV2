// src/pages/Bikes/BikesPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBikes } from "@/lib/bikesStore.js";
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";
import Modal from "@/components/Modal.jsx";
import BikeDetailsForm from "./BikeDetailsForm.jsx";

export default function BikesPage() {
  const { bikes } = useBikes();
  const [params, setParams] = useSearchParams();

  // Selected bike (by id in URL)
  const [selectedId, setSelectedId] = useState(() => params.get("id") || null);

  // Keep selectedId in sync if the URL param changes elsewhere (e.g., back/forward nav)
  useEffect(() => {
    const urlId = params.get("id");
    setSelectedId(urlId || null);
  }, [params]);

  // Add Bike modal + prefill support
  const [addOpen, setAddOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  // Helper to open Add Bike with optional defaults (e.g., from PX/reg lookup)
  const openAddBike = useCallback((data = null) => {
    setPrefillData(data);
    setAddOpen(true);
  }, []);

  // Keep selection valid when bikes list changes
  useEffect(() => {
    if (!Array.isArray(bikes) || bikes.length === 0) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (selectedId && !bikes.some((b) => b.id === selectedId)) {
      clearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikes]);

  const selectedBike = useMemo(
    () => (Array.isArray(bikes) ? bikes.find((b) => b.id === selectedId) : null),
    [bikes, selectedId]
  );

  const isSelectedBikeModalOpen = !!selectedBike;

  const setSelection = useCallback(
    (id) => {
      setSelectedId(id);
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set("id", id);
          else next.delete("id");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("id");
        return next;
      },
      { replace: true }
    );
  }, [setParams]);

  const handleSelect = useCallback((id) => setSelection(id), [setSelection]);

  // ⛔️ While the Add Bike modal is open, ignore search param changes
  const handleSearchChange = useCallback(
    (nextParamsObj) => {
      if (addOpen) return;

      const next = new URLSearchParams(params);
      Object.entries(nextParamsObj).forEach(([k, v]) => {
        if (v === null || v === "" || typeof v === "undefined") next.delete(k);
        else next.set(k, String(v));
      });
      setParams(next, { replace: true });
    },
    [params, setParams, addOpen]
  );

  // Build filters object from the URL params for ResultsList
  const filters = useMemo(() => {
    const get = (k) => {
      const v = params.get(k);
      return v === null || v === "" ? null : v;
    };

    return {
      registration: get("registration"),
      vin: get("vin"),
      keyword: get("keyword"),        // 👈 NEW: wire keyword through
      make: get("make"),
      model: get("model"),
      mileageMin: get("mileageMin"),
      mileageMax: get("mileageMax"),
      status: get("status"),
      modelYear: get("modelYear"),
      priceMin: get("priceMin"),
      priceMax: get("priceMax"),
      vatQualifying: get("vatQualifying"),
      // serviceHistory: get("serviceHistory"), // intentionally not used right now
    };
  }, [params]);

  const modalTitle = selectedBike
    ? (selectedBike.registration
        ? `${selectedBike.registration} — ${selectedBike.make || ""} ${selectedBike.model || ""}`.trim()
        : `${selectedBike.make || ""} ${selectedBike.model || ""}`.trim())
    : "";

  return (
    <div
      className="bikes-page"
      style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}
    >
      {/* Search bar */}
      <div className="bikes-page__search" style={{ width: "100%" }}>
        <SearchBar onChange={handleSearchChange} />
      </div>

      {/* Info message bar (full width, shown only when nothing selected) */}
      {!selectedBike && (
        <div
          className="bikes-page__info"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "12px 16px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            color: "#cfd3ff",
          }}
        >
          <span>Select a bike from the list — or </span>
          <button
            type="button"
            onClick={() => openAddBike()}
            className="underline"
            style={{
              color: "#6aa9ff",
              textUnderlineOffset: "3px",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontWeight: 600,
            }}
            aria-label="Add Bike"
            title="Add a new bike"
          >
            Add Bike
          </button>
          .
        </div>
      )}

      {/* Full-width ResultsList */}
      <div className="bikes-page__results" style={{ width: "100%" }}>
        <ResultsList
          selectedId={selectedId}
          onSelect={handleSelect}
          filters={filters}
        />
      </div>

      {/* Selected Bike modal */}
      <Modal
        open={isSelectedBikeModalOpen}
        onClose={clearSelection}
        title={modalTitle}
        widthClass="w-[min(1100px,96vw)]"
        closeOnBackdrop={true}
        closeOnEsc={true}
      >
        {selectedBike && <SelectedBike bike={selectedBike} />}
      </Modal>

      {/* Add Bike modal showing the full "Details" form */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setPrefillData(null);
        }}
        title="Add a New Bike"
        widthClass="w-[min(900px,92vw)]"
        closeOnBackdrop={true}
        closeOnEsc={true}
      >
        <BikeDetailsForm
          initial={prefillData || {}}
          onCancel={() => {
            setAddOpen(false);
            setPrefillData(null);
          }}
          onSaved={(bike) => {
            setAddOpen(false);
            setPrefillData(null);
            // Immediately select the newly-added bike to open the SelectedBike modal:
            setSelection(bike.id);
          }}
        />
      </Modal>
    </div>
  );
}
