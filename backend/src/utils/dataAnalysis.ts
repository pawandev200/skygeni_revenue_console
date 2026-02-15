import { loadJSON } from "../utils/dataLoader";
import {
  Deal,
  Target,
  Rep,
  Activity,
  Account,
} from "../types";

const db = {
  deals: loadJSON<Deal>("deals.json"),
  targets: loadJSON<Target>("targets.json"),
  reps: loadJSON<Rep>("reps.json"),
  activities: loadJSON<Activity>("activities.json"),
  accounts: loadJSON<Account>("accounts.json"),
};

console.log("deals size:", db.deals.length);
// console.log("target size:", db.targets.length);
// console.log("reps size:", db.reps.length);
// console.log("activities size:", db.activities.length);
// console.log("accounts size:", db.accounts.length);

let c = 0; 
for(const key in db.activities) {
  c++; 
}
console.log("activities count via for-in:", c);

let nullcnt = 0;
let cwnullcnt = 0; 
let cwnullAmCnt = 0;
for(let i=0; i<db.deals.length; i++) {
  if(db.deals[i].amount === null) nullcnt++;
  if(db.deals[i].stage === "Closed Won" && db.deals[i].closed_at === null) cwnullcnt++;
  if(db.deals[i].stage === "Closed Won" && db.deals[i].amount === null) cwnullAmCnt++;
}
console.log("deals with null amount:", nullcnt);
console.log("closed won deals with null closed_at:", cwnullcnt);
console.log("closed won deals with null amount:", cwnullAmCnt);