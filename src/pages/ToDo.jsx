import { useEffect, useState } from "react";
import { listTasks, setTaskStatus } from "../services/api";

export default function ToDo(){
  const [tasks, setTasks] = useState([]);

  async function refresh(){ setTasks(await listTasks()); }
  useEffect(()=>{ refresh(); }, []);

  async function toggle(t){
    const newStatus = t.status === "done" ? "todo" : "done";
    await setTaskStatus(t.id, newStatus);
    refresh();
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-3">To Do</h1>
      {tasks.length===0 && <p>No tasks yet.</p>}
      <ul>
        {tasks.map(t=>(
          <li key={t.id} style={{padding:"8px 0", borderBottom:"1px solid #eee"}}>
            <label style={{display:"flex", gap:8, alignItems:"center"}}>
              <input type="checkbox" checked={t.status==="done"} onChange={()=>toggle(t)} />
              <span><strong>{t.title}</strong> <em>({t.type})</em></span>
              <span style={{marginLeft:"auto", opacity:.7}}>Deal: {t.dealId.slice(0,8)}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
