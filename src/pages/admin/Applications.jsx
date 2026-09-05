import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { listAllApplicationsAdmin } from "../../services/adminService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllApplicationsAdmin().then(({ data }) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoading label="Memuat data lamaran..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Monitor Lamaran</h1>
      <p className="mt-1 text-sm text-ink-500">Pantau seluruh aktivitas lamaran di platform (200 terbaru).</p>

      {applications.length === 0 ? (
        <div className="mt-6"><EmptyState icon={FileText} title="Belum ada lamaran" /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Lowongan</th>
                <th className="px-4 py-3">Perusahaan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{a.student?.profile?.full_name}</td>
                  <td className="px-4 py-3 text-ink-600">{a.job?.title}</td>
                  <td className="px-4 py-3 text-ink-500">{a.job?.company?.company_name}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-400">{new Date(a.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
