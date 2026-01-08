// src/components/DealDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function DealDrawer({
  deal,
  columns = [],
  onClose,
  onStageChange,
  onUpdate, // (dealId, patch) => void
  formatMoneyGBP = (v) => String(v ?? "—"),
  formatDateTime = (v) => String(v ?? "—"),
}) {
  const [showDebug, setShowDebug] = useState(false);

  // Collapsible sections
  const [open, setOpen] = useState({
    overview: true,
    px: true,
    finance: true,
    ops: false,
    timeline: false,
    notes: true,
  });

  // Edit modes (per section)
  const [editing, setEditing] = useState({
    overview: false,
    finance: false,
    notes: false,
  });

  // Draft values (only used while editing)
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (!deal) return;
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [deal, onClose]);

  useEffect(() => {
    if (!deal) return;
    setShowDebug(false);
    setEditing({ overview: false, finance: false, notes: false });
    setDraft({});
    setOpen({
      overview: true,
      px: true,
      finance: true,
      ops: false,
      timeline: false,
      notes: true,
    });
  }, [deal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const vm = useMemo(() => {
    if (!deal) return null;

    const saleReg =
      str(deal.saleBikeRegistration) ||
      str(deal.saleRegistration) ||
      str(deal.registration) ||
      "—";

    const saleModel =
      str(deal.saleBikeModel) || str(deal.saleModel) || str(deal.model) || null;

    const customerName =
      str(deal.customerName) ||
      (deal.customer && typeof deal.customer === "object"
        ? str(deal.customer.name)
        : str(deal.customer)) ||
      null;

    const customerPhone =
      str(deal.customerPhone) ||
      (deal.customer && typeof deal.customer === "object"
        ? str(deal.customer.phone)
        : null) ||
      null;

    const customerEmail =
      str(deal.customerEmail) ||
      (deal.customer && typeof deal.customer === "object"
        ? str(deal.customer.email)
        : null) ||
      null;

    const agreedPrice = deal.agreedPrice ?? deal.salePrice ?? deal.price ?? null;

    const status = str(deal.status) || "—";
    const source = str(deal.source) || "—";

    const pxReg =
      str(deal.pxRegistration) || str(deal.partExchangeRegistration) || null;
    const pxBikeId = str(deal.pxBikeId) || null;

    const financeRequired = !!deal.financeRequired;
    const financeProvider =
      str(deal.financeProvider) || str(deal.financeCompany) || null;
    const financeStatus = str(deal.financeStatus) || null;

    const depositAmount =
      deal.depositAmount ?? deal.deposit ?? deal.additionalDeposit ?? null;
    const additionalDeposit =
      deal.additionalDeposit != null ? deal.additionalDeposit : null;

    const orderNumber = str(deal.orderNumber) || null;
    const payoutAt = deal.payoutAt || null;
    const handoverAt = deal.handoverAt || deal.deliveredAt || null;

    const stageValue = str(deal.stage) || "enquiry";
    const stageEnteredAt = deal.stageEnteredAt || null;

    const stageHistory = Array.isArray(deal.stageHistory) ? deal.stageHistory : [];

    const createdAt = deal.createdAt || null;
    const updatedAt = deal.updatedAt || null;

    return {
      saleReg,
      saleModel,
      customerName,
      customerPhone,
      customerEmail,
      agreedPrice,

      status,
      source,

      pxReg,
      pxBikeId,

      financeRequired,
      financeProvider,
      financeStatus,
      depositAmount,
      additionalDeposit,

      orderNumber,
      payoutAt,
      handoverAt,

      stageValue,
      stageEnteredAt,
      stageHistory,

      createdAt,
      updatedAt,
    };
  }, [deal]);

  if (!deal || !vm) return null;

  const contact =
    vm.customerPhone || vm.customerEmail
      ? [vm.customerPhone, vm.customerEmail].filter(Boolean).join(" • ")
      : null;

  // ---- Editing helpers ----
  function startEdit(section) {
    if (!deal?.id) return;

    // seed draft with current values we care about
    const seed = {
      customerName: deal.customerName || "",
      customerPhone: deal.customerPhone || "",
      customerEmail: deal.customerEmail || "",
      agreedPrice: deal.agreedPrice ?? "",
      orderNumber: deal.orderNumber || "",

      financeRequired: !!deal.financeRequired,
      financeStatus: deal.financeStatus || "",
      financeProvider: deal.financeProvider || "",
      depositAmount:
        deal.depositAmount ??
        deal.deposit ??
        (deal.additionalDeposit ?? "") ??
        "",
      additionalDeposit: deal.additionalDeposit ?? "",

      notes: deal.notes || "",
    };

    setDraft((prev) => ({ ...prev, ...seed }));
    setEditing((prev) => ({ ...prev, [section]: true }));
  }

  function cancelEdit(section) {
    setEditing((prev) => ({ ...prev, [section]: false }));
    // keep draft around for other sections; you can also clear it if you prefer
  }

  function saveEdit(section) {
    if (!deal?.id || typeof onUpdate !== "function") {
      setEditing((prev) => ({ ...prev, [section]: false }));
      return;
    }

    const patch = {};

    if (section === "overview") {
      patch.customerName = strOrEmpty(draft.customerName);
      patch.customerPhone = strOrEmpty(draft.customerPhone);
      patch.customerEmail = strOrEmpty(draft.customerEmail);
      patch.orderNumber = strOrEmpty(draft.orderNumber);

      patch.agreedPrice =
        draft.agreedPrice === "" ? null : toNumberOrNull(draft.agreedPrice);
    }

    if (section === "finance") {
      patch.financeRequired = !!draft.financeRequired;
      patch.financeStatus = strOrEmpty(draft.financeStatus);
      patch.financeProvider = strOrEmpty(draft.financeProvider);

      // Use depositAmount + additionalDeposit as explicit fields going forward
      patch.depositAmount =
        draft.depositAmount === "" ? null : toNumberOrNull(draft.depositAmount);
      patch.additionalDeposit =
        draft.additionalDeposit === ""
          ? null
          : toNumberOrNull(draft.additionalDeposit);
    }

    if (section === "notes") {
      patch.notes = strOrEmpty(draft.notes);
    }

    onUpdate(deal.id, patch);
    setEditing((prev) => ({ ...prev, [section]: false }));
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full sm:w-[820px] border-l border-white/10 bg-[#0B1020]/90 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-xl">
          <div className="px-5 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[22px] leading-7 font-semibold text-slate-100">
                {vm.saleReg}
              </div>
              <div className="mt-0.5 text-sm text-slate-300 truncate">
                {vm.saleModel || "Sale bike details pending"}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Pill label={`Status: ${vm.status}`} />
                <Pill label={`Source: ${vm.source}`} />
                {vm.pxReg ? <Pill label={`PX: ${vm.pxReg}`} /> : null}
                {vm.financeRequired ? (
                  <Pill label="Finance required" tone="warn" />
                ) : (
                  <Pill label="No finance" />
                )}
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {/* Stage strip */}
          <div className="px-5 pb-4">
            <div className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Stage
                  </div>
                  <div className="mt-0.5 text-sm text-slate-200">
                    {labelFromColumns(columns, vm.stageValue)}
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-400">
                    Entered: {formatDateTime(vm.stageEnteredAt)}
                  </div>
                </div>

                <select
                  className="w-full sm:w-[320px] rounded-xl bg-black/30 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sky-500/40"
                  value={vm.stageValue}
                  onChange={(e) => onStageChange?.(e.target.value)}
                >
                  {(columns || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="h-[calc(100%-170px)] overflow-y-auto px-5 py-5">
          <div className="space-y-3">
            {/* Deal overview (editable) */}
            <AccordionSection
              title="Deal overview"
              isOpen={open.overview}
              onToggle={() => setOpen((p) => ({ ...p, overview: !p.overview }))}
              right={
                editing.overview ? (
                  <InlineActions
                    onCancel={() => cancelEdit("overview")}
                    onSave={() => saveEdit("overview")}
                  />
                ) : (
                  <ActionLink onClick={() => startEdit("overview")}>
                    Edit
                  </ActionLink>
                )
              }
            >
              {!editing.overview ? (
                <KVGrid>
                  <KV label="Customer" value={vm.customerName || "Not captured yet"} />
                  <KV label="Contact" value={contact || "Not captured yet"} />
                  <KV
                    label="Agreed price"
                    value={
                      vm.agreedPrice == null
                        ? "Not set"
                        : formatMoneyGBP(vm.agreedPrice)
                    }
                  />
                  <KV label="Order number" value={vm.orderNumber || "Not set"} />
                  <KV label="Created" value={formatDateTime(vm.createdAt)} />
                  <KV label="Updated" value={formatDateTime(vm.updatedAt)} />
                </KVGrid>
              ) : (
                <FormGrid>
                  <Input
                    label="Customer name"
                    value={draft.customerName ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, customerName: v }))}
                    placeholder="e.g. John Smith"
                  />
                  <Input
                    label="Customer phone"
                    value={draft.customerPhone ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, customerPhone: v }))}
                    placeholder="e.g. 07..."
                  />
                  <Input
                    label="Customer email"
                    value={draft.customerEmail ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, customerEmail: v }))}
                    placeholder="e.g. john@email.com"
                  />
                  <Input
                    label="Order number"
                    value={draft.orderNumber ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, orderNumber: v }))}
                    placeholder="BMW / internal order ref"
                  />
                  <Input
                    label="Agreed price (£)"
                    type="number"
                    value={draft.agreedPrice ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, agreedPrice: v }))}
                    placeholder="e.g. 16995"
                  />
                </FormGrid>
              )}
            </AccordionSection>

            {/* PX (read-only for now) */}
            <AccordionSection
              title="Part exchange"
              isOpen={open.px}
              onToggle={() => setOpen((p) => ({ ...p, px: !p.px }))}
            >
              <KVGrid>
                <KV label="PX registration" value={vm.pxReg || "None"} />
                <KV label="PX bike id" value={vm.pxBikeId ? shortId(vm.pxBikeId) : "—"} mono />
              </KVGrid>
            </AccordionSection>

            {/* Finance (editable) */}
            <AccordionSection
              title="Finance"
              isOpen={open.finance}
              onToggle={() => setOpen((p) => ({ ...p, finance: !p.finance }))}
              badge={vm.financeRequired ? "Required" : null}
              badgeTone={vm.financeRequired ? "warn" : "neutral"}
              right={
                editing.finance ? (
                  <InlineActions
                    onCancel={() => cancelEdit("finance")}
                    onSave={() => saveEdit("finance")}
                  />
                ) : (
                  <ActionLink onClick={() => startEdit("finance")}>Edit</ActionLink>
                )
              }
            >
              {!editing.finance ? (
                <>
                  <KVGrid>
                    <KV label="Finance required" value={vm.financeRequired ? "Yes" : "No"} />
                    <KV label="Finance status" value={vm.financeStatus || "—"} />
                    <KV label="Finance provider" value={vm.financeProvider || "—"} />
                    <KV
                      label="Deposit"
                      value={
                        vm.depositAmount == null
                          ? "Not set"
                          : formatMoneyGBP(vm.depositAmount)
                      }
                    />
                  </KVGrid>

                  {vm.additionalDeposit != null && (
                    <div className="mt-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
                      <div className="text-sm text-slate-300">
                        Additional deposit recorded:{" "}
                        <span className="font-semibold text-slate-100">
                          {formatMoneyGBP(vm.additionalDeposit)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <FormGrid>
                  <ToggleRow
                    label="Finance required"
                    checked={!!draft.financeRequired}
                    onChange={(checked) =>
                      setDraft((p) => ({ ...p, financeRequired: checked }))
                    }
                  />
                  <Input
                    label="Finance status"
                    value={draft.financeStatus ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, financeStatus: v }))}
                    placeholder="e.g. Proposed / Approved / Declined"
                  />
                  <Input
                    label="Finance provider"
                    value={draft.financeProvider ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, financeProvider: v }))}
                    placeholder="e.g. BMW FS / Black Horse"
                  />
                  <Input
                    label="Deposit (£)"
                    type="number"
                    value={draft.depositAmount ?? ""}
                    onChange={(v) => setDraft((p) => ({ ...p, depositAmount: v }))}
                    placeholder="e.g. 500"
                  />
                  <Input
                    label="Additional deposit (£)"
                    type="number"
                    value={draft.additionalDeposit ?? ""}
                    onChange={(v) =>
                      setDraft((p) => ({ ...p, additionalDeposit: v }))
                    }
                    placeholder="e.g. 2000"
                  />
                </FormGrid>
              )}
            </AccordionSection>

            {/* Ops (read-only) */}
            <AccordionSection
              title="Ops"
              isOpen={open.ops}
              onToggle={() => setOpen((p) => ({ ...p, ops: !p.ops }))}
            >
              <KVGrid>
                <KV label="Payout date" value={formatDateTime(vm.payoutAt)} />
                <KV label="Handover date" value={formatDateTime(vm.handoverAt)} />
              </KVGrid>
            </AccordionSection>

            {/* Timeline (read-only) */}
            <AccordionSection
              title="Stage timeline"
              isOpen={open.timeline}
              onToggle={() => setOpen((p) => ({ ...p, timeline: !p.timeline }))}
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-300">Current stage</div>
                    <div className="text-sm font-semibold text-slate-100">
                      {labelFromColumns(columns, vm.stageValue)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-300">Entered</div>
                    <div className="text-sm text-slate-100">
                      {formatDateTime(vm.stageEnteredAt)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    History
                  </div>

                  {vm.stageHistory.length === 0 ? (
                    <div className="mt-2 text-sm text-slate-400 italic">
                      No stage changes recorded yet.
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {vm.stageHistory
                        .slice()
                        .reverse()
                        .map((h, idx) => (
                          <li
                            key={`${h.at}-${idx}`}
                            className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm text-slate-100">
                                {labelFromColumns(columns, h.from)}{" "}
                                <span className="text-slate-500">→</span>{" "}
                                {labelFromColumns(columns, h.to)}
                                {h.actor ? (
                                  <div className="mt-1 text-[12px] text-slate-400">
                                    {h.actor}
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-[12px] text-slate-400">
                                {formatDateTime(h.at)}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </AccordionSection>

            {/* Notes (editable) */}
            <AccordionSection
              title="Notes"
              isOpen={open.notes}
              onToggle={() => setOpen((p) => ({ ...p, notes: !p.notes }))}
              right={
                editing.notes ? (
                  <InlineActions
                    onCancel={() => cancelEdit("notes")}
                    onSave={() => saveEdit("notes")}
                  />
                ) : (
                  <ActionLink onClick={() => startEdit("notes")}>Edit</ActionLink>
                )
              }
            >
              {!editing.notes ? (
                <div className="text-sm text-slate-200 whitespace-pre-wrap">
                  {deal.notes ? (
                    deal.notes
                  ) : (
                    <span className="text-slate-400 italic">No notes yet.</span>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3">
                  <label className="text-[12px] text-slate-400">Notes</label>
                  <textarea
                    className="mt-2 w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sky-500/40"
                    rows={5}
                    value={draft.notes ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, notes: e.target.value }))
                    }
                    placeholder="Add notes about this deal..."
                  />
                </div>
              )}
            </AccordionSection>

            {/* Debug */}
            <div className="rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                  Debug
                </div>
                <button
                  type="button"
                  className="text-xs text-sky-300 hover:underline"
                  onClick={() => setShowDebug((s) => !s)}
                >
                  {showDebug ? "Hide" : "Show"}
                </button>
              </div>
              {showDebug ? (
                <pre className="mt-3 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] leading-5 text-slate-200 ring-1 ring-white/10">
{JSON.stringify(deal, null, 2)}
                </pre>
              ) : (
                <div className="mt-2 text-sm text-slate-400">
                  Hidden (keeps the drawer tidy).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function str(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function strOrEmpty(v) {
  if (v == null) return "";
  return String(v).trim();
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function shortId(id) {
  const s = String(id || "");
  if (!s) return "—";
  return s.length > 12 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s;
}

function labelFromColumns(columns, id) {
  const col = (columns || []).find((c) => c.id === id);
  return col ? col.label : id || "—";
}

/* -------------------------------------------------------------------------- */
/* UI Components                                                               */
/* -------------------------------------------------------------------------- */

function Pill({ label, tone = "neutral" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-400/10 ring-1 ring-amber-400/20 text-amber-200"
      : "bg-white/10 ring-1 ring-white/10 text-slate-200";

  return <span className={`rounded-full px-2 py-1 text-xs ${cls}`}>{label}</span>;
}

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
  badge = null,
  badgeTone = "neutral",
  right = null,
}) {
  const badgeCls =
    badgeTone === "warn"
      ? "bg-amber-400/10 ring-1 ring-amber-400/20 text-amber-200"
      : "bg-white/10 ring-1 ring-white/10 text-slate-200";

  return (
    <div className="rounded-2xl bg-black/40 ring-1 ring-white/10">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            {title}
          </div>
          {badge ? (
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${badgeCls}`}>
              {badge}
            </span>
          ) : null}
          <span className="ml-1 text-slate-400 text-sm">{isOpen ? "–" : "+"}</span>
        </button>

        {right}
      </div>

      {isOpen ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function KVGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function KV({ label, value, mono = false }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/10">
      <div className="text-[12px] text-slate-400">{label}</div>
      <div
        className={`mt-0.5 text-sm font-semibold text-slate-100 ${
          mono ? "font-mono text-[12px]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FormGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Input({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3">
      <label className="text-[12px] text-slate-400">{label}</label>
      <input
        type={type}
        className="mt-2 w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sky-500/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-3 flex items-center justify-between gap-3">
      <div className="text-sm text-slate-200">{label}</div>
      <button
        type="button"
        className={`w-[52px] h-[30px] rounded-full ring-1 transition ${
          checked
            ? "bg-sky-500/30 ring-sky-400/30"
            : "bg-black/30 ring-white/10"
        }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span
          className={`block h-[24px] w-[24px] rounded-full bg-white/70 translate-y-[3px] transition-transform ${
            checked ? "translate-x-[24px]" : "translate-x-[4px]"
          }`}
        />
      </button>
    </div>
  );
}

function ActionLink({ children, onClick }) {
  return (
    <button
      type="button"
      className="text-xs text-sky-300 hover:underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function InlineActions({ onCancel, onSave }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="text-xs text-slate-300 hover:text-slate-100"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-200 ring-1 ring-sky-400/20 hover:bg-sky-500/30"
        onClick={onSave}
      >
        Save
      </button>
    </div>
  );
}
