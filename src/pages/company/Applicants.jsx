import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { listCompanyApplicants } from "../../services/applicationsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";

export default function CompanyApplicants() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await getCompanyByUserId(user.id);
      if (!c) { setLoading(false); return; }
      const { data } = await listCompanyApplicants(c.id);
      setApplicants(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <PageLoading label="Memuat pelamar..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Semua Pelamar</h1>
      <p className="mt-1 text-sm text-ink-500">Seluruh pelamar dari semua lowongan Anda.</p>

      {applicants.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Users} title="Belum ada pelamar" /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100">
          <table className="hidden w-full text-sm sm:table">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Posisi</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{a.student?.profile?.full_name}</td>
                  <td className="px-4 py-3">
                    <Link to={`/company/jobs/${a.job?.id}`} className="text-ink-700 hover:underline">{a.job?.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{a.student?.major}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-400">{new Date(a.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-ink-100 sm:hidden">
            {applicants.map((a) => (
              <Link key={a.id} to={`/company/jobs/${a.job?.id}`} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-ink-800">{a.student?.profile?.full_name}</p>
                  <p className="text-xs text-ink-500">{a.job?.title}</p>
                </div>
                <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
