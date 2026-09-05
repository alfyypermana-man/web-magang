import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { listNotifications, markAllAsRead, markAsRead } from "../../services/notificationsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listNotifications(user.id).then(({ data }) => {
      if (mounted) {
        setNotifications(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [user]);

  async function handleMarkAll() {
    await markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleClick(n) {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
  }

  if (loading) return <PageLoading label="Memuat notifikasi..." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950">Notifikasi</h1>
          <p className="mt-1 text-sm text-ink-500">Update terbaru seputar lamaran dan interview Anda.</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAll} className="btn-outline btn-sm"><CheckCheck size={14} /> Tandai semua dibaca</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Bell} title="Belum ada notifikasi" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                n.is_read ? "border-ink-100 bg-white" : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-amber-500"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-800">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-ink-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-ink-400">{new Date(n.created_at).toLocaleString("id-ID")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
