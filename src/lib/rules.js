// src/lib/rules.js
// Turn "Add Deal" answers → events → tasks

/**
 * @typedef {Object} Answers
 * @property {boolean} isUsed
 * @property {boolean} hasPartExchange
 * @property {boolean} hasOutstandingFinance
 */

/** Safe UUID generator (works even if crypto.randomUUID is unavailable) */
function uuid() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();

  if (c?.getRandomValues) {
    // RFC4122 v4 from getRandomValues
    const b = new Uint8Array(16);
    c.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map(v => v.toString(16).padStart(2, '0'));
    return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10,16).join('')}`;
  }

  // Last-ditch fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = Math.random() * 16 | 0;
    const v = ch === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Derive event codes from user answers.
 * @param {Answers} answers
 * @returns {string[]} events
 */
export function deriveEvents(answers) {
  const evts = ['DEAL_CREATED'];
  if (answers?.hasPartExchange) evts.push('PX_ADDED');
  if (answers?.hasOutstandingFinance) evts.push('OUTSTANDING_FINANCE_YES');
  return evts;
}

/**
 * Convert event codes into concrete task objects.
 * @param {string[]} events
 * @returns {Array<{id:string,dealId:string,type:string,title:string,status:'todo'|'doing'|'done'}>}
 */
export function eventsToTasks(events) {
  const tasks = [];
  const add = (type, title) => tasks.push({
    id: uuid(),
    dealId: '',          // filled in when the deal is created/linked
    type,
    title,
    status: 'todo',
  });

  if (events.includes('DEAL_CREATED')) {
    add('Collect_Customer_ID', 'Collect customer ID');
  }
  if (events.includes('PX_ADDED')) {
    add('Record_PX_Details', 'Record part-exchange details');
  }
  if (events.includes('OUTSTANDING_FINANCE_YES')) {
    add('Request_Settlement_Letter', 'Request settlement letter from customer');
    add('Complete_HPI_Check', 'Complete HPI check and save report');
  }

  return tasks;
}

/**
 * Convenience: derive events and tasks in one call.
 * @param {Answers} answers
 * @returns {{ events: string[], tasks: Array<{id:string,dealId:string,type:string,title:string,status:string}> }}
 */
export function deriveTasksFromAnswers(answers) {
  const events = deriveEvents(answers);
  const tasks = eventsToTasks(events);
  return { events, tasks };
}
