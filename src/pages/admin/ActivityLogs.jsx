import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { listActivityLogs } from "../../services/adminService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActivityLogs({ limit: 200 }).then(({ data }) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoading label="Memuat log aktivitas..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Activity Logs</h1>
      <p className="mt-1 text-sm text-ink-500">Riwayat aktivitas penting di platform (200 terbaru).</p>

      {logs.length === 0 ? (
        <div className="mt-6"><EmptyState icon={ClipboardList} title="Belum ada log aktivitas" /></div>
      ) : (
        <div className="mt-6 divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-ink-800">{log.action}</p>
                {log.description && <p className="text-xs text-ink-500">{log.description}</p>}
              </div>
              <div className="text-right text-xs text-ink-400">
                <p>{log.user?.full_name || "System"}</p>
                <p>{new Date(log.created_at).toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
