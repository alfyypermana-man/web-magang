import React, { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { listConversationsForCompany, listThread, sendMessage, markThreadRead } from "../../services/messagesService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function CompanyMessages() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: c } = await getCompanyByUserId(user.id);
      if (!c) { setLoading(false); return; }
      setCompanyId(c.id);
      const { data } = await listConversationsForCompany(c.id);
      const grouped = groupByStudent(data);
      setConversations(grouped);
      if (grouped[0]) setActiveStudentId(grouped[0].student_id);
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!companyId || !activeStudentId) return;
    listThread(activeStudentId, companyId).then(({ data }) => {
      setThread(data);
      markThreadRead(activeStudentId, companyId, "company");
    });
  }, [companyId, activeStudentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeStudentId) return;
    setSending(true);
    const { data, error } = await sendMessage({
      studentId: activeStudentId, companyId, senderRole: "company", senderId: user.id, content: text.trim(),
    });
    setSending(false);
    if (!error && data) {
      setThread((prev) => [...prev, data]);
      setText("");
    }
  }

  if (loading) return <PageLoading label="Memuat pesan..." />;

  const active = conversations.find((c) => c.student_id === activeStudentId);

  return (
    <div className="card grid h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
      <aside className="hidden flex-col border-r border-ink-100 md:flex">
        <div className="border-b border-ink-100 p-4 text-sm font-semibold text-ink-800">Percakapan</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-xs text-ink-400">Belum ada percakapan.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.student_id}
                onClick={() => setActiveStudentId(c.student_id)}
                className={`flex w-full items-center gap-3 border-b border-ink-50 px-4 py-3 text-left ${activeStudentId === c.student_id ? "bg-ink-50" : "hover:bg-ink-50/50"}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-xs font-bold text-ink-400">
                  {c.student?.profile?.avatar_url ? <img src={c.student.profile.avatar_url} className="h-full w-full object-cover" alt="" /> : (c.student?.profile?.full_name || "U").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{c.student?.profile?.full_name}</p>
                  <p className="truncate text-xs text-ink-400">{c.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex flex-col">
        {!active ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={MessageSquare} title="Belum ada pesan" description="Pesan dari kandidat akan muncul di sini." />
          </div>
        ) : (
          <>
            <div className="border-b border-ink-100 p-4 text-sm font-semibold text-ink-800">{active.student?.profile?.full_name}</div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.map((m) => (
                <div key={m.id} className={`flex ${m.sender_role === "company" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_role === "company" ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-800"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-ink-100 p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan..." className="input flex-1" />
              <button type="submit" disabled={sending} className="btn-primary btn-sm shrink-0"><Send size={15} /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function groupByStudent(messages) {
  const map = new Map();
  for (const m of messages) {
    if (!map.has(m.student_id)) {
      map.set(m.student_id, { student_id: m.student_id, student: m.student, lastMessage: m.content });
    }
  }
  return Array.from(map.values());
}
