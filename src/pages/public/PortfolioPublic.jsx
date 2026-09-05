import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Phone, Github, ExternalLink, Share2, Download } from "lucide-react";
import { getPortfolioByUsername } from "../../services/portfolioService";
import { PageLoading } from "../../components/Loading";
import ErrorState from "../../components/ErrorState";
import Badge from "../../components/Badge";
import { useToast } from "../../contexts/ToastContext";

export default function PortfolioPublic() {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    getPortfolioByUsername(username).then(({ data, error }) => {
      if (!mounted) return;
      setPortfolio(data);
      setError(error);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [username]);

  if (loading) return <PageLoading label="Memuat portfolio..." />;
  if (error || !portfolio) return <div className="container-app py-16"><ErrorState title="Portfolio tidak ditemukan" description="Portfolio ini belum dipublikasikan atau tidak ada." /></div>;

  const student = portfolio.student || {};
  const profile = student.profile || {};
  const url = typeof window !== "undefined" ? window.location.href : "";

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `Portfolio ${profile.full_name}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link portfolio disalin ke clipboard.", "success");
    }
  }

  return (
    <div className="bg-ink-50/40 py-10">
      <div className="container-app max-w-3xl">
        <div className="card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-ink-900 to-ink-700" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-ink-100 text-2xl font-bold text-ink-500">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  (profile.full_name || "U").charAt(0)
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleShare} className="btn-outline btn-sm"><Share2 size={14} /> Bagikan</button>
                <button onClick={() => window.print()} className="btn-outline btn-sm"><Download size={14} /> Simpan PDF</button>
              </div>
            </div>

            <h1 className="mt-3 font-display text-xl font-bold text-ink-950">{profile.full_name}</h1>
            <p className="text-sm text-ink-500">{student.school_name} · {student.major}</p>

            {portfolio.about && <p className="mt-4 text-sm leading-relaxed text-ink-600">{portfolio.about}</p>}

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink-500">
              {student.whatsapp && <span className="inline-flex items-center gap-1.5"><Phone size={14} /> {student.whatsapp}</span>}
              {portfolio.contact_email && <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {portfolio.contact_email}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_200px]">
          <div className="space-y-6">
            {portfolio.skills_text && (
              <SectionCard title="Skills">
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills_text.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <Badge key={s} variant="info">{s}</Badge>
                  ))}
                </div>
              </SectionCard>
            )}

            {(portfolio.projects || []).length > 0 && (
              <SectionCard title="Projects">
                <div className="space-y-4">
                  {portfolio.projects.map((p) => (
                    <div key={p.id} className="rounded-xl border border-ink-100 p-4">
                      {p.screenshot_url && <img src={p.screenshot_url} alt={p.name} className="mb-3 h-40 w-full rounded-lg object-cover" />}
                      <h4 className="font-semibold text-ink-900">{p.name}</h4>
                      <p className="mt-1 text-sm text-ink-500">{p.description}</p>
                      {p.technologies && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.technologies.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                            <Badge key={t} variant="outline">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex gap-3 text-xs">
                        {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-ink-700 hover:underline"><Github size={13} /> GitHub</a>}
                        {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-ink-700 hover:underline"><ExternalLink size={13} /> Live Demo</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {portfolio.experience_text && (
              <SectionCard title="Experience"><p className="whitespace-pre-line text-sm text-ink-600">{portfolio.experience_text}</p></SectionCard>
            )}
            {portfolio.education_text && (
              <SectionCard title="Education"><p className="whitespace-pre-line text-sm text-ink-600">{portfolio.education_text}</p></SectionCard>
            )}
            {portfolio.certificates_text && (
              <SectionCard title="Certificates"><p className="whitespace-pre-line text-sm text-ink-600">{portfolio.certificates_text}</p></SectionCard>
            )}
          </div>

          <div className="card flex flex-col items-center gap-3 p-5 print:hidden">
            <p className="text-center text-xs text-ink-500">Scan untuk membuka portfolio ini</p>
            <QRCodeSVG value={url} size={140} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-display text-base font-semibold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}
