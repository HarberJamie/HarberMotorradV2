// src/pages/Bikes/BikesPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useBikes } from "@/lib/bikesStore.js";
// import { useBikeEvents } from "@/lib/bikeEventsStore.js"; // ⬅️ removed for now
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";
import Modal from "@/components/Modal.jsx";
import AddBike from "./AddBike.jsx";

export default function BikesPage() {
  const { bikes } = useBikes();
  const [params, setParams] = useSearchParams();

  // ----------------------- selection via URL param ------------------------ //
  const [selectedId, setSelectedId] = useState(
    () => params.get("id") || null
  );

  // Keep selectedId in sync if the URL param changes elsewhere
  useEffect(() => {
    const urlId = params.get("id");
    setSelectedId(urlId || null);
  }, [params]);

  // -------------------------- Add Bike modal ----------------------------- //
  const [addOpen, setAddOpen] = useState(false);

  // ---------------------- keep selection valid --------------------------- //
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
    () =>
      Array.isArray(bikes)
        ? bikes.find((b) => b.id === selectedId) || null
        : null,
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

  const handleSelect = useCallback(
    (id) => setSelection(id),
    [setSelection]
  );

  // While Add Bike modal is open, ignore search param changes from the UI
  const handleSearchChange = useCallback(
    (nextParamsObj) => {
      if (addOpen) return;

      const next = new URLSearchParams(params);
      Object.entries(nextParamsObj).forEach(([k, v]) => {
        if (v === null || v === "" || typeof v === "undefined") {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      setParams(next, { replace: true });
    },
    [params, setParams, addOpen]
  );

  // ---------------------------- filters ---------------------------------- //
  const filters = useMemo(() => {
    const get = (k) => {
      const v = params.get(k);
      return v === null || v === "" ? null : v;
    };

    return {
      registration: get("registration"),
      vin: get("vin"),
      keyword: get("keyword"),
      make: get("make"),
      model: get("model"),
      mileageMin: get("mileageMin"),
      mileageMax: get("mileageMax"),
      status: get("status"),
      modelYear: get("modelYear"),
      priceMin: get("priceMin"),
      priceMax: get("priceMax"),
      vatQualifying: get("vatQualifying"),
      // serviceHistory: get("serviceHistory"), // reserved for future use
    };
  }, [params]);

  // --------------------------- modal title ------------------------------- //
  const modalTitle = selectedBike
    ? selectedBike.registration
      ? `${selectedBike.registration} — ${
          selectedBike.make || ""
        } ${selectedBike.model || ""}`.trim()
      : `${selectedBike.make || ""} ${
          selectedBike.model || ""
        }`.trim()
    : "";

  // ----------------------------------------------------------------------- //
  //                                  JSX
  // ----------------------------------------------------------------------- //
  return (
    <div className="flex w-full flex-col gap-4">
      {/* Search bar / top controls */}
      <div className="w-full">
        <SearchBar onChange={handleSearchChange} />
      </div>

      {/* Info bar when nothing is selected */}
      {!selectedBike && (
        <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-indigo-100 shadow-lg shadow-black/40">
          <span>Select a bike from the list — or </span>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="font-semibold text-sky-400 underline underline-offset-2 hover:text-sky-300"
            aria-label="Add Bike"
            title="Add a new bike"
          >
            add a new bike
          </button>
          .
        </div>
      )}

      {/* Results list */}
      <div className="w-full">
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
        {selectedBike && (
          // History tab inside SelectedBike will currently
          // use bike.events (if present) or show "No history recorded".
          <SelectedBike bike={selectedBike} />
        )}
      </Modal>

      {/* Add Bike modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a New Bike"
        widthClass="w-[min(900px,92vw)]"
        closeOnBackdrop={true}
        closeOnEsc={true}
      >
        <AddBike onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}
