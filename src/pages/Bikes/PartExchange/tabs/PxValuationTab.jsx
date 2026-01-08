// src/pages/Bikes/PartExchange/tabs/PxValuationTab.jsx
import React from "react";
import PxFieldNumber from "@/components/PxFieldNumber.jsx";
import { getPxEstimatedCostTotals } from "../usePxPartExchange.js";

export default function PxValuationTab({
  bike,
  valuations = [],
  latestValuation,
  canCreateValuation,
  addValuation,
  updateValuationField,
  approveValuation,
  onOpenDeal,
}) {
  if (!bike) {
    return (
      <p className="text-sm text-slate-400">
        No bike selected for Valuation.
      </p>
    );
  }

  const allVals = valuations.length
    ? valuations
    : Array.isArray(bike.valuations)
    ? bike.valuations
    : [];

  const latest =
    latestValuation || (allVals.length > 0 ? allVals[0] : null) || null;

  // QoR flags for computed canCreateValuation fallback
  const hasHpiClear =
    bike.hpiReport && ["Clear", "Warning"].includes(bike.hpiReport.status);
  const hasAtLeastOnePhoto =
    Array.isArray(bike.photos) && bike.photos.length > 0;
  const financeAnswered =
    bike.finance && typeof bike.finance.hasFinance === "boolean";

  const computedCanCreateValuation =
    typeof canCreateValuation === "boolean"
      ? canCreateValuation
      : hasHpiClear && hasAtLeastOnePhoto && financeAnswered;

  const handleAddValuation =
    addValuation ||
    (() => console.warn("addValuation not provided to PxValuationTab"));

  const handleUpdateValuationField =
    updateValuationField ||
    (() => console.warn("updateValuationField not provided to PxValuationTab"));

  const handleApproveValuation =
    approveValuation ||
    (() => console.warn("approveValuation not provided to PxValuationTab"));

  const { grandTotal: pxPrepTotal } = getPxEstimatedCostTotals(bike);

  const effectiveOnOpenDeal =
    onOpenDeal ||
    (() => console.warn("onOpenDeal not provided to PxValuationTab"));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-100">Valuation(s)</h2>
        <button
          type="button"
          disabled={!computedCanCreateValuation}
          onClick={handleAddValuation}
          className={`text-xs px-3 py-2 rounded-lg font-semibold ${
            computedCanCreateValuation
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          Create new valuation
        </button>
      </div>

      {!computedCanCreateValuation && (
        <p className="text-[11px] text-amber-400 mb-1">
          Complete QoR checks (HPI, at least one photo, and finance question)
          before creating a valuation.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr,1.3fr]">
        {/* Valuations list / editor */}
        <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
          {allVals.length === 0 ? (
            <p className="text-sm text-slate-400">
              No valuations yet. Use &quot;Create new valuation&quot; once QoR
              checks are complete.
            </p>
          ) : (
            <div className="space-y-4">
              {allVals.map((v, idx) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-300">
                      Valuation v{allVals.length - idx}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleString()
                        : "Draft"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <PxFieldNumber
                      label="Expected retail (£)"
                      value={v.marketRetailPrice}
                      onChange={(val) =>
                        handleUpdateValuationField(
                          v.id,
                          "marketRetailPrice",
                          val
                        )
                      }
                    />
                    <PxFieldNumber
                      label="Buy-in valuation (£)"
                      value={v.amount}
                      onChange={(val) =>
                        handleUpdateValuationField(v.id, "amount", val)
                      }
                    />
                    <PxFieldNumber
                      label="Tech prep est. (£)"
                      value={v.estTechPrep}
                      onChange={(val) =>
                        handleUpdateValuationField(v.id, "estTechPrep", val)
                      }
                    />
                    <PxFieldNumber
                      label="Cosmetic prep est. (£)"
                      value={v.estCosmeticPrep}
                      onChange={(val) =>
                        handleUpdateValuationField(
                          v.id,
                          "estCosmeticPrep",
                          val
                        )
                      }
                    />
                    <PxFieldNumber
                      label="Warranty provision (£)"
                      value={v.estWarranty}
                      onChange={(val) =>
                        handleUpdateValuationField(v.id, "estWarranty", val)
                      }
                    />
                    <PxFieldNumber
                      label="Distribution / marketing (£)"
                      value={v.distributionCost}
                      onChange={(val) =>
                        handleUpdateValuationField(
                          v.id,
                          "distributionCost",
                          val
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Channel
                      </label>
                      <select
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                        value={v.channel || "Retail"}
                        onChange={(e) =>
                          handleUpdateValuationField(
                            v.id,
                            "channel",
                            e.target.value
                          )
                        }
                      >
                        <option value="Retail">Retail</option>
                        <option value="Trader">Trader</option>
                        <option value="Auction">Auction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Tax / VAT flag
                      </label>
                      <select
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                        value={v.taxFlag || "Margin"}
                        onChange={(e) =>
                          handleUpdateValuationField(
                            v.id,
                            "taxFlag",
                            e.target.value
                          )
                        }
                      >
                        <option value="Margin">Margin</option>
                        <option value="VATQualifying">VAT Qualifying</option>
                        <option value="NonVat">Non-VAT</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                      value={v.notes || ""}
                      onChange={(e) =>
                        handleUpdateValuationField(
                          v.id,
                          "notes",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-slate-500">
                      Approved:{" "}
                      {v.approvedAt
                        ? `${new Date(
                            v.approvedAt
                          ).toLocaleDateString()} by ${
                            v.approvedBy || "Manager"
                          }`
                        : "No"}
                    </p>
                    <button
                      type="button"
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      onClick={() => handleApproveValuation(v.id)}
                    >
                      Approve &amp; set as buy-in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Deal snapshot */}
        <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Deal Snapshot
          </h2>

          {latest ? (
            <>
              <p className="text-sm text-slate-300 mb-2">
                This summarises how this buy-in fits into the overall deal
                (linked sale bike + finance + products).
              </p>

              <dl className="space-y-2 text-sm text-slate-200 mb-4">
                <div className="flex justify-between">
                  <dt className="text-slate-400">
                    Buy in Price (approved)
                  </dt>
                  <dd>
                    £
                    {bike.acquisition?.buyInPrice ??
                      latest.amount ??
                      "0"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Expected retail</dt>
                  <dd>£{latest.marketRetailPrice || "0"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">
                    Tech / Cosmetic / Warranty / Distribution
                  </dt>
                  <dd>
                    £
                    {[
                      latest.estTechPrep,
                      latest.estCosmeticPrep,
                      latest.estWarranty,
                      latest.distributionCost,
                    ]
                      .map((x) => Number(x || 0))
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">
                    PX prep &amp; service (Condition &amp; Service tabs)
                  </dt>
                  <dd>£{pxPrepTotal.toLocaleString()}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="w-full text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold mb-2"
                onClick={effectiveOnOpenDeal}
              >
                Link / open deal (Negotiation)
              </button>

              <p className="text-[11px] text-slate-500">
                v1: this just calls <code>onOpenDeal()</code>. Later we’ll
                auto-create a Deal in <code>Negotiation</code> status linked to
                this buy-in and sale bike, with full chain P&amp;L, including PX
                prep and service costs.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Once a valuation exists, we&apos;ll show margin preview and link
              to the Deal here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
