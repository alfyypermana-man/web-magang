import React, { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Building2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getStudentByUserId } from "../../services/studentsService";
import { listConversationsForStudent, listThread, sendMessage, markThreadRead } from "../../services/messagesService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function StudentMessages() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: student } = await getStudentByUserId(user.id);
      if (!student) { setLoading(false); return; }
      setStudentId(student.id);
      const { data } = await listConversationsForStudent(student.id);
      const grouped = groupByCompany(data);
      setConversations(grouped);
      if (grouped[0]) setActiveCompanyId(grouped[0].company_id);
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!studentId || !activeCompanyId) return;
    listThread(studentId, activeCompanyId).then(({ data }) => {
      setThread(data);
      markThreadRead(studentId, activeCompanyId, "student");
    });
  }, [studentId, activeCompanyId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeCompanyId) return;
    setSending(true);
    const { data, error } = await sendMessage({
      studentId, companyId: activeCompanyId, senderRole: "student", senderId: user.id, content: text.trim(),
    });
    setSending(false);
    if (!error && data) {
      setThread((prev) => [...prev, data]);
      setText("");
    }
  }

  if (loading) return <PageLoading label="Memuat pesan..." />;

  const active = conversations.find((c) => c.company_id === activeCompanyId);

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
                key={c.company_id}
                onClick={() => setActiveCompanyId(c.company_id)}
                className={`flex w-full items-center gap-3 border-b border-ink-50 px-4 py-3 text-left ${activeCompanyId === c.company_id ? "bg-ink-50" : "hover:bg-ink-50/50"}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-ink-400">
                  {c.company?.logo_url ? <img src={c.company.logo_url} className="h-full w-full object-cover" alt="" /> : <Building2 size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{c.company?.company_name}</p>
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
            <EmptyState icon={MessageSquare} title="Belum ada pesan" description="Pesan dari perusahaan akan muncul di sini." />
          </div>
        ) : (
          <>
            <div className="border-b border-ink-100 p-4 text-sm font-semibold text-ink-800">{active.company?.company_name}</div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.map((m) => (
                <div key={m.id} className={`flex ${m.sender_role === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_role === "student" ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-800"}`}>
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

function groupByCompany(messages) {
  const map = new Map();
  for (const m of messages) {
    if (!map.has(m.company_id)) {
      map.set(m.company_id, { company_id: m.company_id, company: m.company, lastMessage: m.content });
    }
  }
  return Array.from(map.values());
}
