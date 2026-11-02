import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert, Key, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState<any[]>([]);
  const [reward, setReward] = useState(100);
  const [maxUses, setMaxUses] = useState(10);
  const [adminTag, setAdminTag] = useState("");
  
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData || "";

  const callApi = async (action: string, payload: any = {}) => {
    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, action, ...payload }),
    });
    return res.json();
  };

  const loadPromos = async () => {
    if (!initData) return;
    const data = await callApi("get_promos");
    if (Array.isArray(data)) setPromos(data);
  };

  useEffect(() => { loadPromos(); }, []);

  const handleCreate = async () => {
    await callApi("create_promo", { reward, maxUses });
    loadPromos();
  };

  const handleMakeAdmin = async () => {
    await callApi("make_admin", { target: adminTag });
    alert("Права выданы!");
  };

  return (
    <div className="space-y-4 pt-3 pb-10">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate({ to: "/profile" })} className="p-2 bg-card rounded-full">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><ShieldAlert size={20} className="text-gold"/> Админ-панель</h1>
      </div>

      <div className="bg-card p-4 rounded-2xl space-y-3 border border-border">
        <h2 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2"><Key size={14}/> Создать промокод</h2>
        <div className="flex gap-2">
          <input type="number" value={reward} onChange={(e) => setReward(+e.target.value)} className="bg-surface p-2.5 rounded-xl w-1/2 text-sm" placeholder="Награда"/>
          <input type="number" value={maxUses} onChange={(e) => setMaxUses(+e.target.value)} className="bg-surface p-2.5 rounded-xl w-1/2 text-sm" placeholder="Активаций"/>
        </div>
        <button onClick={handleCreate} className="bg-electric text-black w-full py-2.5 rounded-xl font-bold text-sm">Сгенерировать</button>
      </div>

      <div className="bg-card p-4 rounded-2xl space-y-3 border border-border">
        <h2 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2"><UserPlus size={14}/> Выдать админку</h2>
        <div className="flex gap-2">
          <input type="text" value={adminTag} onChange={(e) => setAdminTag(e.target.value)} className="bg-surface p-2.5 rounded-xl w-full text-sm" placeholder="@username"/>
          <button onClick={handleMakeAdmin} className="bg-gold text-black px-4 rounded-xl font-bold text-sm">Выдать</button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-2xl space-y-3 border border-border">
        <h2 className="font-bold text-sm text-muted-foreground uppercase">Список кодов</h2>
        {promos.map((p) => (
          <div key={p.code} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
            <div>
              <div className="font-mono font-bold text-base text-electric">{p.code}</div>
              <div className="text-xs text-muted-foreground">+{p.reward} · {p.usedBy.length}/{p.maxUses}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}