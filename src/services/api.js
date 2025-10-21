import { db } from "../lib/db";
import { deriveEvents, eventsToTasks } from "@/lib/rules";

// Create a deal and generate tasks from answers via the rules engine
export async function createDeal(answers){
  const now = new Date().toISOString();
  const deal = {
    id: crypto.randomUUID(),
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
    saleBike: {
      id: crypto.randomUUID(),
      make: answers.make,
      model: answers.model,
      reg: answers.reg
    },
    partExchangeBike: answers.hasPartExchange ? { id: crypto.randomUUID() } : undefined,
    isUsed: !!answers.isUsed,
    hasPartExchange: !!answers.hasPartExchange,
    hasOutstandingFinance: !!answers.hasOutstandingFinance
  };

  db.saveDeal(deal);

  const events = deriveEvents(answers);
  const tasks = eventsToTasks(events).map(t => ({ ...t, dealId: deal.id }));
  db.upsertTasks(tasks);

  return { deal, tasks };
}

// Tasks API
export async function listTasks(){ return db.listTasks(); }
export async function setTaskStatus(id, status){ return db.updateTask(id, { status }); }

// Deals API (for upcoming pages)
export async function listDeals(){ return db.listDeals(); }
export async function getDeal(id){ return db.getDeal(id); }
export async function updateDealStatus(id, status){ return db.updateDeal(id, { status }); }
