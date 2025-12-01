// src/lib/dealsStore.js
import { useEffect, useState } from "react";

const STORAGE_KEY = "harbermotorrad:deals";
const BUS_EVENT = "harber:deals-updated";

/* ---------------------------
 * Helpers
 * --------------------------- */
export function getDeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// saveDeals(deals, { emit: boolean })
export function saveDeals(deals, opts = { emit: true }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  if (opts.emit && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BUS_EVENT, {
        detail: { updatedAt: Date.now() },
      })
    );
  }
}

/* ---------------------------
 * Hook: useDeals
 * --------------------------- */
export function useDeals() {
  const [deals, setDeals] = useState(() => getDeals());

  // Keep in sync across tabs/components via a custom event
  useEffect(() => {
    const handler = () => {
      setDeals(getDeals());
    };

    if (typeof window !== "undefined") {
      window.addEventListener(BUS_EVENT, handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(BUS_EVENT, handler);
      }
    };
  }, []);

  const addDeal = (deal) => {
    const current = getDeals();
    const next = [deal, ...current];
    saveDeals(next);
    setDeals(next);
  };

  const updateDeal = (id, patch) => {
    const current = getDeals();
    const next = current.map((d) =>
      String(d.id) === String(id) ? { ...d, ...patch } : d
    );
    saveDeals(next);
    setDeals(next);
  };

  const removeDeal = (id) => {
    const current = getDeals();
    const next = current.filter((d) => String(d.id) !== String(id));
    saveDeals(next);
    setDeals(next);
  };

  return {
    deals,
    addDeal,
    updateDeal,
    removeDeal,
  };
}
