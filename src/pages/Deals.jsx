// src/pages/Deals.jsx
import React, { useEffect, useMemo, useState } from "react";
import DealDrawer from "@/components/DealDrawer.jsx";

/* -------------------------------------------------------------------------- */
/* Config                                                                      */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "harbermotorrad:deals";
const VIEW_KEY = "harbermotorrad:deals:viewMode";

/**
 * Canonical operational deal stages (Pipeline)
 */
const COLUMNS = [
  { id: "enquiry", label: "Enquiry" },
  { id: "part-exchange", label: "Part Exchange" },
  { id: "deposit", label: "Deposit" },
  { id: "sales-order", label: "Sales Order" },
  { id: "finance-proposal", label: "Finance Proposal" },
  { id: "accessories", label: "Accessories" },
  { id: "workshop", label: "Workshop" },
  { id: "detailing", label: "Detailing" },
  { id: "payout", label: "Payout" },
  { id: "handover", label: "Handover" },
];

/* -------------------------------------------------------------------------- */
/* Storage helpers                                                             */
/* -------------------------------------------------------------------------- */

function readDealsOldestFirst() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeDealsOldestFirst(dealsOldestFirst) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dealsOldestFirst));
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function normalizeStage(value) {
  const v = String(value || "").trim().toLowerCase();
  const valid = new Set(COLUMNS.map((c) => c.id));
  return valid.has(v) ? v : "enquiry";
}

/**
 * Backward-compatible inference for older deals
 * Explicit deal.stage always wins.
 */
function inferStageFromDeal(deal) {
  if (deal?.stage) return normalizeStage(deal.stage);

  if (deal?.handoverAt || deal?.deliveredAt) return "handover";
  if (deal?.payoutAt) return "payout";
  if (deal?.detailingComplete) return "detailing";
  if (deal?.workshopBooked || deal?.prepRequired) return "workshop";
  if (Array.isArray(deal?.accessories) && deal.accessories.length > 0)
    return "accessories";
  if (deal?.financeRequired || deal?.financeProvider) return "finance-proposal";
  if (deal?.orderNumber) return "sales-order";
  if (deal?.depositPaid || deal?.depositAmount || deal?.additionalDeposit)
    return "deposit";
  if (deal?.partExchange || deal?.pxBikeId || deal?.pxRegistration)
    return "part-exchange";

  return "enquiry";
}

function getInitialViewMode() {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "list" || saved === "kanban" ? saved : "kanban";
  } catch {
    return "kanban";
  }
}

function viewLabel(mode) {
  return mode === "kanban" ? "Pipeline" : "List";
}

function formatMoneyGBP(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `£${n.toLocaleString()}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function stageLabel(stageId) {
  const found = COLUMNS.find((c) => c.id === stageId);
  return found ? found.label : stageId || "—";
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                   */
/* -------------------------------------------------------------------------- */

export default function Deals() {
  const [dealsNewestFirst, setDealsNewestFirst] = useState([]);
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Load deals once (stored oldest-first; show newest-first in UI)
  useEffect(() => {
    const storedOldestFirst = readDealsOldestFirst();
    setDealsNewestFirst(storedOldestFirst.slice().reverse());
  }, []);

  // Persist view mode
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  // Ensure each deal has stage + baseline stage tracking
  const dealsWithStage = useMemo(() => {
    return (dealsNewestFirst || []).map((d) => {
      const createdAt = d.createdAt || new Date().toISOString();

      const stage =
        d?.stage && String(d.stage).trim() !== ""
          ? normalizeStage(d.stage)
          : inferStageFromDeal(d);

      const stageSegments =
        Array.isArray(d.stageSegments) && d.stageSegments.length > 0
          ? d.stageSegments
          : [{ stage, enteredAt: createdAt, exitedAt: null }];

      return {
        ...d,
        createdAt,
        stage,
        stageEnteredAt: d.stageEnteredAt || createdAt,
        stageHistory: Array.isArray(d.stageHistory) ? d.stageHistory : [],
        stageSegments,
      };
    });
  }, [dealsNewestFirst]);

  // Column map for Pipeline view
  const byStage = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    for (const d of dealsWithStage) {
      map[normalizeStage(d.stage)].push(d);
    }
    return map;
  }, [dealsWithStage]);

  // Selected deal
  const selectedDeal = useMemo(() => {
    if (!selectedDealId) return null;
    return (
      dealsWithStage.find((d) => String(d.id) === String(selectedDealId)) || null
    );
  }, [selectedDealId, dealsWithStage]);

  /* ------------------------------ Persistence ----------------------------- */

  function persistNewestFirst(nextNewestFirst) {
    // Persist as oldest-first for compatibility with historical storage
    writeDealsOldestFirst(nextNewestFirst.slice().reverse());
  }

  /* ------------------------------ Mutations -------------------------------- */

  function updateDeal(dealId, patch) {
    const now = new Date().toISOString();

    setDealsNewestFirst((prevNewestFirst) => {
      const next = (prevNewestFirst || []).map((d) => {
        if (String(d.id) !== String(dealId)) return d;
        return { ...d, ...patch, updatedAt: now };
      });

      persistNewestFirst(next);
      return next;
    });
  }

  function changeStage(deal, nextStage) {
    if (!deal?.id) return;

    const from = normalizeStage(deal.stage);
    const to = normalizeStage(nextStage);
    if (from === to) return;

    const now = new Date().toISOString();
    const actor = "Jamie"; // later: from auth/session

    const prevSegments = Array.isArray(deal.stageSegments)
      ? deal.stageSegments
      : [];

    // Close last open segment
    const closedSegments = prevSegments.map((s, idx) => {
      const isLast = idx === prevSegments.length - 1;
      if (!isLast) return s;
      if (s && s.exitedAt == null) return { ...s, exitedAt: now };
      return s;
    });

    const nextSegments = [
      ...closedSegments,
      { stage: to, enteredAt: now, exitedAt: null },
    ];

    const prevHistory = Array.isArray(deal.stageHistory) ? deal.stageHistory : [];
    const nextHistory = [...prevHistory, { from, to, at: now, actor }];

    updateDeal(deal.id, {
      stage: to,
      stageEnteredAt: now,
      stageSegments: nextSegments,
      stageHistory: nextHistory,
    });
  }

  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Deals</h2>
          <p className="text-sm text-slate-300">
            View: <span className="font-medium">{viewLabel(viewMode)}</span>{" "}
            <span className="mx-2">•</span>
            Total{" "}
            <span className="font-semibold text-slate-100">
              {dealsWithStage.length}
            </span>
          </p>
        </div>

        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Content */}
      {dealsWithStage.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-6 text-sm text-slate-200 shadow-lg shadow-black/40">
          No deals yet. Add one via “Add New Deal”.
        </div>
      ) : viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              deals={byStage[col.id]}
              onOpen={(d) => setSelectedDealId(d.id)}
            />
          ))}
        </div>
      ) : (
        <DealsListTable
          deals={dealsWithStage}
          onOpen={(d) => setSelectedDealId(d.id)}
        />
      )}

      {/* Drawer */}
      <DealDrawer
        deal={selectedDeal}
        columns={COLUMNS}
        onClose={() => setSelectedDealId(null)}
        onStageChange={(next) => selectedDeal && changeStage(selectedDeal, next)}
        onUpdate={(dealId, patch) => updateDeal(dealId, patch)}
        formatMoneyGBP={formatMoneyGBP}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* View Toggle (Animated segmented control)                                   */
/* -------------------------------------------------------------------------- */

function ViewToggle({ value, onChange }) {
  const isPipeline = value === "kanban";

  return (
    <div className="relative inline-flex rounded-full border border-white/10 bg-black/40 p-1.5">
      {/* Sliding pill (fixed to button width) */}
      <span
        className={`absolute inset-y-1.5 left-1.5 w-[120px] rounded-full bg-white/20 border border-white/20 shadow shadow-white/10 transition-transform duration-200 ease-out ${
          isPipeline ? "translate-x-0" : "translate-x-[120px]"
        }`}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={`relative z-10 w-[120px] px-5 py-2.5 rounded-full text-sm font-medium transition ${
          isPipeline ? "text-slate-50" : "text-slate-200 hover:text-slate-50"
        }`}
      >
        Pipeline
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={`relative z-10 w-[120px] px-5 py-2.5 rounded-full text-sm font-medium transition ${
          !isPipeline ? "text-slate-50" : "text-slate-200 hover:text-slate-50"
        }`}
      >
        List
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List Table                                                                  */
/* -------------------------------------------------------------------------- */

function DealsListTable({ deals, onOpen }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg shadow-black/40">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">Created</th>
              <th className="px-3 py-2 text-left font-semibold">Stage</th>
              <th className="px-3 py-2 text-left font-semibold">Model</th>
              <th className="px-3 py-2 text-left font-semibold">Customer</th>
              <th className="px-3 py-2 text-left font-semibold">Price</th>
              <th className="px-3 py-2 text-left font-semibold"></th>
            </tr>
          </thead>

          <tbody>
            {deals.map((d) => {
              const model =
                d.saleBikeModel || d.model || d.saleBikeRegistration || "—";
              const customer =
                d.customerName ||
                (typeof d.customer === "string" ? d.customer : "") ||
                "—";

              const price =
                d.agreedPrice != null
                  ? formatMoneyGBP(d.agreedPrice)
                  : d.depositAmount != null
                  ? formatMoneyGBP(d.depositAmount)
                  : d.additionalDeposit != null
                  ? formatMoneyGBP(d.additionalDeposit)
                  : "—";

              return (
                <tr
                  key={d.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-3 py-2 font-mono text-slate-200">
                    {d.id ? `${String(d.id).slice(0, 8)}…` : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-100">
                    {formatDateTime(d.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                      {stageLabel(d.stage)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-100">{model}</td>
                  <td className="px-3 py-2 text-slate-100">{customer}</td>
                  <td className="px-3 py-2 text-slate-100">{price}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-sky-300 hover:underline"
                      onClick={() => onOpen(d)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Kanban                                                                      */
/* -------------------------------------------------------------------------- */

function KanbanColumn({ column, deals, onOpen }) {
  const items = Array.isArray(deals) ? deals : [];

  return (
    <div className="min-w-[300px] max-w-[340px] flex-shrink-0">
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 shadow-lg shadow-black/40">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            {column.label}
          </h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
            {items.length}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((deal) => (
            <DealCard key={deal.id} deal={deal} onOpen={onOpen} />
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-3 text-xs text-slate-300 italic">
              No deals
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, onOpen }) {
  const title = deal.customerName || deal.customer || "Unnamed customer";
  const subtitle =
    deal.saleBikeModel || deal.model || deal.saleBikeRegistration || "—";

  const price =
    deal.agreedPrice != null
      ? formatMoneyGBP(deal.agreedPrice)
      : deal.depositAmount != null
      ? formatMoneyGBP(deal.depositAmount)
      : deal.additionalDeposit != null
      ? formatMoneyGBP(deal.additionalDeposit)
      : "—";

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3 hover:bg-white/5 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-50">
            {title}
          </div>
          <div className="truncate text-xs text-slate-300">{subtitle}</div>

          <div className="mt-2 inline-flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-200">
              {stageLabel(deal.stage)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-50">{price}</div>
          <button
            type="button"
            className="mt-1 text-xs text-sky-300 hover:underline"
            onClick={() => onOpen(deal)}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
