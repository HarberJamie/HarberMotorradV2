// Simple key-value store over localStorage for dev/demo
const K_DEALS = "hm_deals";
const K_TASKS = "hm_tasks";

const read = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); }
  catch { return []; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const db = {
  // Deals
  listDeals() { return read(K_DEALS); },
  getDeal(id) { return read(K_DEALS).find(d => d.id === id) || null; },
  saveDeal(d) {
    const all = read(K_DEALS);
    all.push(d);
    write(K_DEALS, all);
    return d;
  },
  updateDeal(id, patch){
    const all = read(K_DEALS).map(d => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d);
    write(K_DEALS, all);
    return all.find(d => d.id === id) || null;
  },

  // Tasks
  listTasks(){ return read(K_TASKS); },
  upsertTasks(ts){
    const all = read(K_TASKS);
    const map = new Map(all.map(t => [t.id, t]));
    ts.forEach(t => map.set(t.id, t));
    const merged = Array.from(map.values());
    write(K_TASKS, merged);
    return merged;
  },
  updateTask(id, patch){
    const all = read(K_TASKS).map(t => t.id === id ? { ...t, ...patch } : t);
    write(K_TASKS, all);
    return all.find(t => t.id === id) || null;
  },
  clearAll(){
    write(K_DEALS, []);
    write(K_TASKS, []);
  }
};
