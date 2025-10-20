/**
 * @typedef {"draft"|"in_progress"|"completed"|"cancelled"} DealStatus
 * @typedef {{id:string, make?:string, model?:string, reg?:string, mileage?:number}} Bike
 * @typedef {{
 *   id:string; status:DealStatus; createdAt:string; updatedAt:string;
 *   saleBike: Bike; partExchangeBike?: Bike;
 *   isUsed:boolean; hasPartExchange:boolean; hasOutstandingFinance:boolean;
 * }} Deal
 * @typedef {{"todo"|"doing"|"done"} TaskStatus
 * @typedef {{
 *   id:string; dealId:string; type:string; title:string; status:TaskStatus; dueDate?:string;
 * }} Task
 */
export {};
