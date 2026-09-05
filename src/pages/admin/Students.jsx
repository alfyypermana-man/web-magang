import React, { useEffect, useState } from "react";
import { Search, Users, Ban, Trash2 } from "lucide-react";
import { listAllStudents } from "../../services/studentsService";
import { suspendStudent, deleteStudent, logActivity } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/Modal";
import Badge from "../../components/Badge";

export default function AdminStudents() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'suspend'|'delete', student }

  useEffect(() => {
    let mounted = true;
    listAllStudents({ search }).then(({ data }) => {
      if (mounted) {
        setStudents(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [search]);

  async function handleConfirm() {
    const { type, student } = confirmAction;
    if (type === "suspend") {
      const { error } = await suspendStudent(student.id);
      if (error) { showToast("Gagal menangguhkan akun.", "error"); return; }
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, status: "suspended" } : s)));
      await logActivity({ userId: user.id, action: "Suspend Student", description: student.profile?.full_name });
      showToast("Akun siswa ditangguhkan.", "success");
    } else {
      const { error } = await deleteStudent(student.id);
      if (error) { showToast("Gagal menghapus akun.", "error"); return; }
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      await logActivity({ userId: user.id, action: "Delete Student", description: student.profile?.full_name });
      showToast("Akun siswa dihapus.", "success");
    }
    setConfirmAction(null);
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Manajemen Student</h1>
      <p className="mt-1 text-sm text-ink-500">Kelola seluruh akun siswa/mahasiswa terdaftar.</p>

      <div className="mt-4 flex max-w-md items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5">
        <Search size={16} className="text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari sekolah/universitas..." className="w-full border-0 text-sm outline-none placeholder:text-ink-300" />
      </div>

      {loading ? (
        <PageLoading label="Memuat data siswa..." />
      ) : students.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Users} title="Belum ada siswa terdaftar" /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Sekolah</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{s.profile?.full_name}</td>
                  <td className="px-4 py-3 text-ink-500">{s.school_name}</td>
                  <td className="px-4 py-3 text-ink-500">{s.major}</td>
                  <td className="px-4 py-3"><Badge variant={s.status === "suspended" ? "danger" : "success"}>{s.status || "active"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setConfirmAction({ type: "suspend", student: s })} className="btn-outline btn-sm"><Ban size={13} /></button>
                      <button onClick={() => setConfirmAction({ type: "delete", student: s })} className="btn-ghost btn-sm text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === "delete" ? "Hapus Akun Siswa" : "Tangguhkan Akun Siswa"}
        description={`Yakin ingin ${confirmAction?.type === "delete" ? "menghapus" : "menangguhkan"} akun "${confirmAction?.student?.profile?.full_name}"?`}
        danger
      />
    </div>
  );
}
