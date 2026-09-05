import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Briefcase, Building2, Users, TrendingUp, CheckCircle2,
  ArrowRight, Star, ChevronDown, Code2, Megaphone, LineChart, Palette, Wrench, Sparkles,
} from "lucide-react";
import { getFeaturedJobs, listCategories } from "../../services/jobsService";
import { getPlatformStats } from "../../services/adminService";
import { CardSkeleton } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge from "../../components/Badge";

const CATEGORY_ICONS = [Code2, Megaphone, LineChart, Palette, Wrench, Sparkles];

const FAQS = [
  {
    q: "Apakah pendaftaran di MagangKu berbayar?",
    a: "Tidak. Pendaftaran untuk siswa/mahasiswa maupun perusahaan sepenuhnya gratis.",
  },
  {
    q: "Bagaimana cara memastikan lowongan yang tampil terpercaya?",
    a: "Setiap perusahaan yang membuka lowongan harus melalui proses verifikasi oleh tim Admin sebelum mendapatkan badge Verified.",
  },
  {
    q: "Berapa lama proses seleksi biasanya berlangsung?",
    a: "Bervariasi tergantung kebijakan masing-masing perusahaan, namun Anda dapat memantau status lamaran secara real-time di dashboard.",
  },
  {
    q: "Apakah saya bisa melamar lebih dari satu lowongan?",
    a: "Bisa. Anda dapat melamar ke banyak lowongan sekaligus dan memantau seluruh status lamaran dari satu dashboard.",
  },
];

export default function Landing() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const [jobsRes, catRes, statsRes] = await Promise.all([
        getFeaturedJobs(6),
        listCategories(),
        getPlatformStats().catch(() => null),
      ]);
      if (!mounted) return;
      setJobs(jobsRes.data);
      setCategories(catRes.data);
      setStats(statsRes);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/jobs${search ? `?q=${encodeURIComponent(search)}` : ""}`);
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 20% 20%, rgba(230,160,61,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(63,181,152,0.2), transparent 40%)" }} />
        <div className="container-app relative py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-amber-300">
            <Sparkles size={13} /> Platform PKL & Magang #1 untuk Talenta Muda
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold text-paper sm:text-5xl">
            Temukan Tempat PKL & Magang Impianmu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Hubungkan siswa berbakat dengan perusahaan terbaik untuk mendapatkan pengalaman kerja nyata.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search size={18} className="text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari posisi, perusahaan, atau skill..."
                className="w-full border-0 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
            <button type="submit" className="btn-accent">
              Cari Lowongan
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/jobs" className="btn-outline border-white/20 text-paper hover:bg-white/10">
              Cari Lowongan <ArrowRight size={15} />
            </Link>
            <Link to="/register" className="btn-accent">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-ink-100 bg-white py-10">
        <div className="container-app grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Siswa Terdaftar", value: stats?.totalStudents, icon: Users },
            { label: "Perusahaan Partner", value: stats?.totalCompanies, icon: Building2 },
            { label: "Lowongan Aktif", value: stats?.activeJobs, icon: Briefcase },
            { label: "Lamaran Diterima", value: stats?.acceptedApplications, icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-600">
                <s.icon size={18} />
              </div>
              <div className="font-display text-2xl font-bold text-ink-950">{s.value ?? "—"}</div>
              <div className="text-xs text-ink-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <div className="container-app">
          <h2 className="text-center font-display text-2xl font-bold text-ink-950">Kategori Magang Populer</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-500">
            Jelajahi berbagai bidang sesuai minat dan jurusanmu.
          </p>
          {categories.length === 0 && !loading ? (
            <div className="mt-8">
              <EmptyState title="Belum ada kategori" description="Kategori magang akan tampil di sini." />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {(categories.length ? categories : Array.from({ length: 6 })).map((cat, i) => {
                const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
                return (
                  <Link
                    key={cat?.id || i}
                    to={`/jobs${cat ? `?category=${cat.id}` : ""}`}
                    className="card flex flex-col items-center gap-2 px-3 py-6 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-ink-800">{cat?.name || "Kategori"}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="bg-ink-50/50 py-16">
        <div className="container-app">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-950">Lowongan Terbaru</h2>
              <p className="mt-1 text-sm text-ink-500">Peluang PKL & magang yang baru saja dipublikasikan.</p>
            </div>
            <Link to="/jobs" className="hidden text-sm font-semibold text-ink-700 hover:underline sm:block">
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>

          {!loading && jobs.length === 0 && (
            <div className="mt-4">
              <EmptyState
                icon={Briefcase}
                title="Belum ada lowongan"
                description="Lowongan yang dipublikasikan perusahaan akan tampil di sini."
                action={
                  <Link to="/register/company" className="btn-primary btn-sm">
                    Daftarkan Perusahaan Anda
                  </Link>
                }
              />
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link to="/jobs" className="btn-outline btn-sm">
              Lihat Semua Lowongan
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <div className="container-app">
          <h2 className="text-center font-display text-2xl font-bold text-ink-950">Cara Kerja</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Buat Profil", desc: "Daftar, lengkapi profil, dan unggah CV serta portofolio terbaikmu." },
              { step: "02", title: "Temukan & Lamar", desc: "Cari lowongan sesuai jurusan dan skill, lalu ajukan lamaran dalam sekali klik." },
              { step: "03", title: "Ikuti Seleksi", desc: "Pantau status lamaran, ikuti interview, dan dapatkan pengalaman kerja nyata." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-bold text-amber-400">
                  {s.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink-950 py-16">
        <div className="container-app">
          <h2 className="text-center font-display text-2xl font-bold text-paper">Apa Kata Mereka</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { name: "Nabila R.", role: "Siswa SMK, RPL", quote: "Prosesnya cepat dan mudah dipahami, saya diterima magang di startup teknologi hanya dalam dua minggu." },
              { name: "Fajar A.", role: "Mahasiswa, Teknik Informatika", quote: "Fitur portofolio dan CV builder-nya sangat membantu saya tampil lebih profesional di mata HR." },
              { name: "HR PT Nusantara Digital", role: "Perusahaan Partner", quote: "Kami jadi lebih mudah menemukan kandidat magang yang benar-benar sesuai kebutuhan tim." },
            ].map((t) => (
              <div key={t.name} className="rounded-xl2 bg-white/5 p-6 text-ink-200">
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 text-sm font-semibold text-paper">{t.name}</div>
                <div className="text-xs text-ink-400">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-app max-w-2xl">
          <h2 className="text-center font-display text-2xl font-bold text-ink-950">Pertanyaan Umum</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-ink-900">{f.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-ink-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm text-ink-500">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container-app">
          <div className="rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 px-8 py-14 text-center">
            <h2 className="font-display text-2xl font-bold text-paper sm:text-3xl">Siap memulai perjalanan magangmu?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-300">
              Bergabung dengan ribuan siswa dan perusahaan yang sudah menggunakan MagangKu.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register/student" className="btn-accent">
                Daftar sebagai Student
              </Link>
              <Link to="/register/company" className="btn-outline border-white/20 text-paper hover:bg-white/10">
                Daftar sebagai Perusahaan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function JobCard({ job }) {
  const company = job.company || {};
  const skills = (job.job_skills || []).map((js) => js.skill?.name).filter(Boolean);
  return (
    <Link to={`/jobs/${job.id}`} className="card flex flex-col p-4 transition-shadow hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 text-ink-400">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
          ) : (
            <Building2 size={20} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-semibold text-ink-900">{job.title}</h3>
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <span className="truncate">{company.company_name || "Perusahaan"}</span>
            {company.status === "verified" && <CheckCircle2 size={12} className="shrink-0 text-teal-500" />}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-ink-500">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {job.work_type && <Badge variant="outline">{job.work_type}</Badge>}
        {job.duration && <Badge variant="outline">{job.duration}</Badge>}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((s) => (
            <Badge key={s} variant="info">
              {s}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
        <span>{job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString("id-ID")}` : "Tanpa batas waktu"}</span>
        <span className="font-medium text-ink-700">Detail →</span>
      </div>
    </Link>
  );
}
