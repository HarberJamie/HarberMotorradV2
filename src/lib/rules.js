// src/lib/rules.js
// Turn Add Deal answers → events → tasks

/**
 * answers = {
 *   isUsed: boolean,
 *   hasPartExchange: boolean,
 *   hasOutstandingFinance: boolean
 * }
 */

export function deriveEvents(answers){
  const evts = ["DEAL_CREATED"];
  if (answers.hasPartExchange) evts.push("PX_ADDED");
  if (answers.hasOutstandingFinance) evts.push("OUTSTANDING_FINANCE_YES");
  return evts;
}

export function eventsToTasks(events){
  const tasks = [];
  const add = (type, title)=>tasks.push({
    id: crypto.randomUUID(),
    dealId: "",                // filled in when deal is created
    type, title,
    status: "todo"
  });

  if (events.includes("DEAL_CREATED")) add("Collect_Customer_ID", "Collect customer ID");
  if (events.includes("PX_ADDED")) add("Record_PX_Details", "Record part-exchange details");
  if (events.includes("OUTSTANDING_FINANCE_YES")){
    add("Request_Settlement_Letter","Request settlement letter from customer");
    add("Complete_HPI_Check","Complete HPI check and save report");
  }
  return tasks;
}
