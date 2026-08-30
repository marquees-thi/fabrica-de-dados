import React, { useState, useEffect, useRef } from "react";
import { 
  Layers, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  FileSpreadsheet, 
  FileJson, 
  ArrowRight, 
  Terminal,
  Search,
  ExternalLink,
  Phone,
  Globe,
  Sparkles,
  Zap,
  Plus,
  Send,
  Mail,
  ShieldCheck,
  Filter,
  Download,
  Copy,
  Edit3,
  HardDrive,
  FolderOpen
} from "lucide-react";
import { BackgroundJob, CompanyLead, OutputFile } from "../types";
import { TabKey } from "./TabsNav";

interface BackgroundJobsManagerProps {
  onSelectLeadForAI?: (lead: CompanyLead) => void;
  onNavigate?: (tab: TabKey) => void;
}

export const BackgroundJobsManager: React.FC<BackgroundJobsManagerProps> = ({ onSelectLeadForAI, onNavigate }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "outputs">("jobs");

  // Filter & Search in Leads Table
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "has_email" | "has_phone" | "enriched" | "no_website">("all");
  
  // Modal for lead details
  const [activeLeadModal, setActiveLeadModal] = useState<CompanyLead | null>(null);

  // Webhook sending state
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  // Smart Logs Terminal Auto-scroll (Disabled by default per user specification)
  const [autoScroll, setAutoScroll] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        
        // If a job is selected, refresh its details
        if (selectedJob) {
          fetchJobDetails(selectedJob.id);
        } else if (data.jobs && data.jobs.length > 0 && !selectedJob) {
          fetchJobDetails(data.jobs[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao listar tarefas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputs = async () => {
    try {
      const res = await fetch("/api/jobs/outputs");
      const data = await res.json();
      if (data.success) {
        setOutputs(data.outputs || []);
      }
    } catch (err) {
      console.error("Erro ao listar arquivos gerados:", err);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.success && data.job) {
        setSelectedJob(data.job);
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes da tarefa:", err);
    }
  };

  // SSE Stream setup for selected job
  useEffect(() => {
    if (!selectedJob?.id) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const sse = new EventSource(`/api/jobs/stream/${selectedJob.id}`);
      eventSourceRef.current = sse;

      sse.addEventListener("log", (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.message) {
            setSelectedJob((prev) => {
              if (!prev || prev.id !== selectedJob.id) return prev;
              return {
                ...prev,
                logs: [...prev.logs, payload.message],
              };
            });
          }
        } catch (err) {}
      });

      sse.addEventListener("progress", (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          setSelectedJob((prev) => {
            if (!prev || prev.id !== selectedJob.id) return prev;
            return {
              ...prev,
              progressPercent: payload.percent ?? prev.progressPercent,
              currentStep: payload.step ?? prev.currentStep,
            };
          });
        } catch (err) {}
      });

      sse.addEventListener("complete", (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          fetchJobDetails(selectedJob.id);
          fetchOutputs();
        } catch (err) {}
      });

      sse.onerror = () => {
        sse.close();
      };
    } catch (err) {
      console.warn("SSE connection error:", err);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedJob?.id]);

  useEffect(() => {
    fetchJobs();
    fetchOutputs();
    const interval = setInterval(() => {
      fetchJobs();
      fetchOutputs();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedJob?.logs, autoScroll]);

  const handleLogsScroll = () => {
    if (!logsContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    } else if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    }
  };

  // Delete single lead
  const handleDeleteLead = async (leadId: string) => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/leads/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedJob({
          ...selectedJob,
          leads: selectedJob.leads.filter((l) => l.id !== leadId),
          leadsCollected: data.leadsCollected,
        });
      }
    } catch (err) {
      alert("Erro ao excluir lead.");
    }
  };

  // Delete whole job
  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir esta tarefa do histórico?")) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.filter((j) => j.id !== jobId));
        if (selectedJob?.id === jobId) {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      alert("Erro ao excluir tarefa.");
    }
  };

  // Delete generated output file
  const handleDeleteOutputFile = async (filename: string) => {
    if (!confirm(`Deseja excluir permanentemente o arquivo "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/jobs/outputs/${encodeURIComponent(filename)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOutputs(outputs.filter((o) => o.filename !== filename));
      }
    } catch (err) {
      alert("Erro ao excluir arquivo.");
    }
  };

  // Export to formatted Excel (.xlsx)
  const handleExportXLSX = (job: BackgroundJob) => {
    if (job.outputXlsxFile) {
      window.location.href = `/api/jobs/download/${encodeURIComponent(job.outputXlsxFile)}`;
      return;
    }
    if (job.outputCsvFile) {
      window.location.href = `/api/jobs/download/${encodeURIComponent(job.outputCsvFile)}`;
      return;
    }
    handleExportCSV(job);
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = (job: BackgroundJob) => {
    if (job.outputCsvFile) {
      window.location.href = `/api/jobs/download/${encodeURIComponent(job.outputCsvFile)}`;
      return;
    }

    if (!job.leads || job.leads.length === 0) {
      alert("Nenhum lead disponível nesta tarefa para exportação.");
      return;
    }

    const headers = [
      "Nome da Empresa",
      "Nicho",
      "Telefone",
      "E-mail Corporativo",
      "Website",
      "Cidade",
      "Estado",
      "Bairro",
      "Endereco Completo",
      "Avaliacao Google",
      "Qtd Avaliacoes",
      "Sobre Nos",
      "Quebra Gelo (Gemini)",
      "Assunto Cold Email",
      "Corpo Cold Email",
      "Link Google Maps"
    ];

    const rows = job.leads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.category || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.website || "").replace(/"/g, '""')}"`,
      `"${(l.city || "").replace(/"/g, '""')}"`,
      `"${(l.state || "").replace(/"/g, '""')}"`,
      `"${(l.suburb || "").replace(/"/g, '""')}"`,
      `"${(l.address || "").replace(/"/g, '""')}"`,
      `"${l.rating || ""}"`,
      `"${l.reviewsCount || 0}"`,
      `"${(l.aboutUsText || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.icebreaker || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.coldEmailSubject || "").replace(/"/g, '""')}"`,
      `"${(l.coldEmailBody || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.mapsSearchUrl || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${job.niches.join("_")}_${job.cities.join("_")}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const handleExportJSON = (job: BackgroundJob) => {
    if (job.outputJsonFile) {
      window.location.href = `/api/jobs/download/${encodeURIComponent(job.outputJsonFile)}`;
      return;
    }

    if (!job.leads || job.leads.length === 0) return;
    const blob = new Blob([JSON.stringify(job.leads, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_b2b_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send to Webhook (Instantly / Lemlist / n8n / Make)
  const handleSendWebhook = async () => {
    if (!selectedJob || !selectedJob.leads || selectedJob.leads.length === 0) {
      alert("Não há leads disponíveis nesta tarefa para envio.");
      return;
    }

    try {
      setSendingWebhook(true);
      setWebhookMessage(null);
      const res = await fetch("/api/webhook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: filteredLeads,
        })
      });

      const data = await res.json();
      if (data.success) {
        setWebhookMessage(data.message || `✓ ${filteredLeads.length} leads despachados com sucesso para a esteira de cold email!`);
        setTimeout(() => setWebhookMessage(null), 5000);
      } else {
        alert("Erro no envio do webhook: " + data.error);
      }
    } catch (e: any) {
      alert("Erro ao disparar webhook: " + e.message);
    } finally {
      setSendingWebhook(false);
    }
  };

  // Filtered Leads
  const filteredLeads = (selectedJob?.leads || []).filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.category && lead.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === "has_email") return Boolean(lead.email);
    if (filterMode === "has_phone") return Boolean(lead.phone);
    if (filterMode === "enriched") return Boolean(lead.isEnriched || lead.icebreaker);
    if (filterMode === "no_website") return !lead.website;

    return true;
  });

  const runningJobs = jobs.filter((j) => j.status === "running" || j.status === "pending");
  const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled");

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-[#14161B] border border-[#22262E] p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C]"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#00FF9C]">
                MÓDULOS 2 & 4 // FILA 24/7, PYTHON & ARQUIVOS PRONTOS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#E4E7EB]">
              Central de Fila 24/7 & Higienização de Leads
            </h2>
            <p className="text-xs text-[#A0A6B1]">
              Acompanhe as extrações executadas no servidor Ubuntu, monitore logs em tempo real via SSE e baixe planilhas CSV prontas para vendas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                onClick={() => onNavigate("launchpad")}
                className="flex items-center gap-2 px-4 py-2 bg-[#00FF9C] text-[#0A0B0E] font-mono font-bold text-xs hover:bg-[#00FF9C]/90 transition-all shadow-[0_0_12px_rgba(0,255,156,0.2)]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>NOVA EXTRAÇÃO</span>
              </button>
            )}
            <button
              onClick={() => { fetchJobs(); fetchOutputs(); }}
              disabled={loading}
              className="p-2 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/50 text-[#00FF9C] transition-all"
              title="Recarregar"
            >
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Jobs vs Outputs) */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#22262E]">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3.5 py-1.5 font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "jobs"
                ? "bg-[#00FF9C] text-[#0A0B0E]"
                : "bg-[#0A0B0E] border border-[#22262E] text-[#A0A6B1] hover:text-[#E4E7EB]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>TAREFAS NO SERVIDOR ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("outputs")}
            className={`px-3.5 py-1.5 font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "outputs"
                ? "bg-[#00FF9C] text-[#0A0B0E]"
                : "bg-[#0A0B0E] border border-[#22262E] text-[#A0A6B1] hover:text-[#E4E7EB]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>ARQUIVOS PRONTOS / OUTPUTS ({outputs.length})</span>
          </button>
        </div>

        {/* Global Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 font-mono text-xs border-t border-[#22262E] mt-4">
          <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
            <div className="text-[10px] text-[#717681] uppercase">Tarefas Ativas</div>
            <div className="text-sm font-bold text-[#00FF9C] mt-0.5">{runningJobs.length} em execução</div>
          </div>
          <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
            <div className="text-[10px] text-[#717681] uppercase">Planilhas Salvas</div>
            <div className="text-sm font-bold text-[#E4E7EB] mt-0.5">{outputs.length} arquivos</div>
          </div>
          <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
            <div className="text-[10px] text-[#717681] uppercase">Total Minerado</div>
            <div className="text-sm font-bold text-[#00FF9C] mt-0.5">
              {jobs.reduce((acc, j) => acc + (j.leadsCollected || 0), 0)} empresas
            </div>
          </div>
          <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
            <div className="text-[10px] text-[#717681] uppercase">E-mails Corporativos</div>
            <div className="text-sm font-bold text-[#38BDF8] mt-0.5">
              {jobs.reduce((acc, j) => acc + (j.emailsFoundCount || 0), 0)} encontrados
            </div>
          </div>
          <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
            <div className="text-[10px] text-[#717681] uppercase">Quebra-Gelos IA</div>
            <div className="text-sm font-bold text-[#F59E0B] mt-0.5">
              {jobs.reduce((acc, j) => acc + (j.enrichedCount || 0), 0)} gerados
            </div>
          </div>
        </div>
      </div>

      {activeTab === "outputs" ? (
        /* OUTPUTS EXPLORER TAB */
        <div className="bg-[#14161B] border border-[#22262E] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#22262E] pb-3">
            <div>
              <h3 className="text-sm font-bold font-mono text-[#E4E7EB] uppercase flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#00FF9C]" />
                <span>Diretório de Saídas // /outputs (Servidor Ubuntu)</span>
              </h3>
              <p className="text-xs text-[#A0A6B1] mt-0.5">
                Arquivos gerados automaticamente pelo pipeline com codificação UTF-8 BOM e cabeçalhos higienizados.
              </p>
            </div>
            <button
              onClick={fetchOutputs}
              className="px-3 py-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/50 text-xs font-mono text-[#00FF9C] flex items-center gap-1.5"
            >
              <RotateCw className="w-3 h-3" />
              <span>ATUALIZAR ARQUIVOS</span>
            </button>
          </div>

          {outputs.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-[#717681] space-y-2">
              <HardDrive className="w-8 h-8 mx-auto text-[#717681] opacity-40" />
              <div>Nenhum arquivo CSV ou JSON gerado ainda.</div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("launchpad")}
                  className="text-[#00FF9C] hover:underline"
                >
                  Executar primeiro garimpo no servidor
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#22262E]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A0B0E] border-b border-[#22262E] text-[#717681] uppercase text-[10px]">
                    <th className="py-2.5 px-3">Nome do Arquivo</th>
                    <th className="py-2.5 px-3">Formato</th>
                    <th className="py-2.5 px-3">Nicho / Região</th>
                    <th className="py-2.5 px-3">Registros</th>
                    <th className="py-2.5 px-3">Tamanho</th>
                    <th className="py-2.5 px-3">Gerado em</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22262E]">
                  {outputs.map((out) => (
                    <tr key={out.filename} className="hover:bg-[#1C1F26]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#E4E7EB] flex items-center gap-2">
                          {out.type === "xlsx" ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          ) : out.type === "csv" ? (
                            <FileSpreadsheet className="w-4 h-4 text-[#00FF9C]" />
                          ) : (
                            <FileJson className="w-4 h-4 text-[#38BDF8]" />
                          )}
                          <span>{out.filename}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          out.type === "xlsx"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : out.type === "csv"
                            ? "bg-[#00FF9C]/10 text-[#00FF9C] border-[#00FF9C]/30"
                            : "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30"
                        }`}>
                          {out.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#A0A6B1]">
                        {out.nicho || "Empresas"} {out.cidade ? `• ${out.cidade}` : ""}
                      </td>
                      <td className="py-3 px-3 text-[#E4E7EB]">
                        {out.rowCount ? `${out.rowCount} leads` : "-"}
                      </td>
                      <td className="py-3 px-3 text-[#717681]">
                        {out.sizeFormatted}
                      </td>
                      <td className="py-3 px-3 text-[#717681]">
                        {new Date(out.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/jobs/download/${encodeURIComponent(out.filename)}`}
                            className={`px-2.5 py-1 font-bold text-xs transition-all flex items-center gap-1 ${
                              out.type === "xlsx"
                                ? "bg-emerald-500 hover:bg-emerald-400 text-[#0A0B0E] shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                : "bg-[#00FF9C] text-[#0A0B0E] hover:bg-[#00FF9C]/90 shadow-[0_0_8px_rgba(0,255,156,0.2)]"
                            }`}
                            download
                          >
                            <Download className="w-3 h-3" />
                            <span>BAIXAR</span>
                          </a>
                          <button
                            onClick={() => handleDeleteOutputFile(out.filename)}
                            className="p-1 text-[#717681] hover:text-rose-400"
                            title="Excluir arquivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* MAIN JOBS GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Job Selector List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#14161B] border border-[#22262E] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#22262E] pb-2">
                <h3 className="text-xs font-bold font-mono text-[#E4E7EB] uppercase">
                  Histórico de Tarefas no Servidor
                </h3>
                <span className="text-[10px] font-mono text-[#717681]">{jobs.length} no total</span>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-[#717681] space-y-2">
                  <div>Nenhuma tarefa iniciada ainda.</div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("launchpad")}
                      className="text-[#00FF9C] hover:underline"
                    >
                      Clique aqui para lançar a primeira extração
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {jobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    const isRunning = job.status === "running" || job.status === "pending";

                    return (
                      <div
                        key={job.id}
                        onClick={() => fetchJobDetails(job.id)}
                        className={`p-3 border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#1C1F26] border-[#00FF9C] shadow-[0_0_10px_rgba(0,255,156,0.15)]"
                            : "bg-[#0A0B0E] border-[#22262E] hover:border-[#383D47]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-mono text-xs font-bold text-[#E4E7EB] line-clamp-1">
                            {job.title}
                          </div>
                          <button
                            onClick={(e) => handleDeleteJob(job.id, e)}
                            className="text-[#717681] hover:text-rose-400 p-0.5"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status and Progress */}
                        <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between text-[10px] text-[#A0A6B1]">
                            <span className="flex items-center gap-1.5">
                              {isRunning ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse"></span>
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-[#00FF9C]" />
                              )}
                              <span className={isRunning ? "text-[#00FF9C] font-bold" : "text-[#717681]"}>
                                {isRunning ? "EM ANDAMENTO" : "CONCLUÍDO"}
                              </span>
                            </span>
                            <span className="text-[#00FF9C] font-bold">{job.progressPercent}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-[#14161B] h-1.5 border border-[#22262E] overflow-hidden">
                            <div
                              className="bg-[#00FF9C] h-full transition-all duration-300 shadow-[0_0_8px_#00FF9C]"
                              style={{ width: `${job.progressPercent}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#717681] pt-0.5">
                            <span>📦 {job.leadsCollected} leads</span>
                            <span>✉️ {job.emailsFoundCount || 0} e-mails</span>
                            <span>✨ {job.enrichedCount || 0} IA</span>
                          </div>

                          {job.outputXlsxFile ? (
                            <div className="pt-1 flex items-center gap-2">
                              <a
                                href={`/api/jobs/download/${encodeURIComponent(job.outputXlsxFile)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-bold"
                                download
                              >
                                <Download className="w-3 h-3" />
                                <span>Baixar {job.outputXlsxFile}</span>
                              </a>
                            </div>
                          ) : job.outputCsvFile ? (
                            <div className="pt-1">
                              <a
                                href={`/api/jobs/download/${encodeURIComponent(job.outputCsvFile)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-[#00FF9C] hover:underline"
                                download
                              >
                                <Download className="w-3 h-3" />
                                <span>Baixar {job.outputCsvFile}</span>
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Job Details & DataGrid (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedJob ? (
              <div className="space-y-4">
                
                {/* Job Status & Live Terminal Bar */}
                <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#22262E] pb-3">
                    <div>
                      <h3 className="text-base font-bold font-mono text-[#E4E7EB]">
                        {selectedJob.title}
                      </h3>
                      <div className="text-xs font-mono text-[#00FF9C] mt-0.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-ping"></span>
                        <span>{selectedJob.currentStep}</span>
                      </div>
                    </div>

                    {/* Actions: Export XLSX, CSV, JSON, Webhook */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleExportXLSX(selectedJob)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#0A0B0E] font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{selectedJob.outputXlsxFile ? "BAIXAR EXCEL (.XLSX)" : "GERAR EXCEL (.XLSX)"}</span>
                      </button>

                      <button
                        onClick={() => handleExportCSV(selectedJob)}
                        className="px-2.5 py-1.5 bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] hover:bg-[#00FF9C]/30 font-mono font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{selectedJob.outputCsvFile ? "CSV (UTF-8)" : "CSV"}</span>
                      </button>

                      <button
                        onClick={handleSendWebhook}
                        disabled={sendingWebhook}
                        className="px-3 py-1.5 bg-[#38BDF8]/20 border border-[#38BDF8]/50 text-[#38BDF8] hover:bg-[#38BDF8]/30 font-mono font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingWebhook ? "ENVIANDO..." : "⚡ ENVIAR PARA AUTOMAÇÃO"}</span>
                      </button>

                      <button
                        onClick={() => handleExportJSON(selectedJob)}
                        className="px-2.5 py-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#383D47] text-xs font-mono text-[#A0A6B1] transition-all"
                        title="Exportar JSON"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {webhookMessage && (
                    <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-mono flex items-center gap-2 animate-pulse">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{webhookMessage}</span>
                    </div>
                  )}

                  {/* Terminal Virtual Minimalista com Logs SSE e Smart Auto-Scroll */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#717681]">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#00FF9C]" />
                        <span>TERMINAL VIRTUAL // STREAMING EM TEMPO REAL (SSE)</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span>{selectedJob.logs.length} eventos</span>
                        <button
                          type="button"
                          onClick={() => setAutoScroll(!autoScroll)}
                          className={`text-[10px] px-2 py-0.5 border font-bold transition-all ${
                            autoScroll
                              ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C]"
                              : "bg-[#1C1F26] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                          }`}
                        >
                          Auto-scroll: {autoScroll ? "LIGADO" : "PAUSADO"}
                        </button>
                      </div>
                    </div>

                    <div
                      ref={logsContainerRef}
                      onScroll={handleLogsScroll}
                      className="bg-[#0A0B0E] border border-[#22262E] p-3 rounded-none font-mono text-xs text-[#A0A6B1] h-36 overflow-y-auto space-y-1"
                    >
                      {selectedJob.logs.map((log, idx) => {
                        const isSuccess = log.includes("✓") || log.includes("🎉") || log.includes("concluído");
                        const isWarning = log.includes("♻️") || log.includes("🛡️") || log.includes("PULADO") || log.includes("⚠️");
                        const isError = log.includes("❌") || log.includes("Erro") || log.includes("STDERR");

                        return (
                          <div
                            key={idx}
                            className={`text-[11px] ${
                              isSuccess
                                ? "text-[#00FF9C]"
                                : isWarning
                                ? "text-[#F59E0B]"
                                : isError
                                ? "text-rose-400"
                                : "text-[#A0A6B1]"
                            }`}
                          >
                            {log}
                          </div>
                        );
                      })}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                </div>

                {/* DataGrid: Leads Table (O Produto Final) */}
                <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#22262E] pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold font-mono text-[#E4E7EB] uppercase">
                        Tabela de Higienização & Abordagem B2B
                      </h3>
                      <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-2 py-0.5 border border-[#00FF9C]/30">
                        {filteredLeads.length} leads exibidos
                      </span>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#717681]" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Filtrar por nome, email..."
                          className="bg-[#0A0B0E] border border-[#22262E] pl-8 pr-3 py-1.5 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none w-44 sm:w-56"
                        />
                      </div>

                      <select
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value as any)}
                        className="bg-[#0A0B0E] border border-[#22262E] px-2.5 py-1.5 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none"
                      >
                        <option value="all">Todos os Leads</option>
                        <option value="has_email">Apenas com E-mail</option>
                        <option value="has_phone">Apenas com Telefone</option>
                        <option value="enriched">Apenas com IA Enriquecida</option>
                        <option value="no_website">Sem Website (Oportunidade)</option>
                      </select>
                    </div>
                  </div>

                  {/* Table Component */}
                  <div className="overflow-x-auto border border-[#22262E]">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#0A0B0E] border-b border-[#22262E] text-[#717681] uppercase text-[10px]">
                          <th className="py-2.5 px-3">Empresa / Nicho</th>
                          <th className="py-2.5 px-3">Contato & Telefone</th>
                          <th className="py-2.5 px-3">E-mail Corporativo</th>
                          <th className="py-2.5 px-3">Quebra-Gelo IA (Gemini Pro)</th>
                          <th className="py-2.5 px-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#22262E]">
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-[#717681] text-xs">
                              Nenhum lead encontrado com os filtros atuais.
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-[#1C1F26]/60 transition-colors group">
                              {/* Company & Category */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-[#E4E7EB]">{lead.name}</div>
                                <div className="text-[10px] text-[#A0A6B1] flex items-center gap-1.5 mt-0.5">
                                  <span>{lead.category || "Empresa Local"}</span>
                                  {lead.city && <span>• {lead.city}</span>}
                                </div>
                                {lead.website && (
                                  <a
                                    href={lead.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[#38BDF8] hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <Globe className="w-2.5 h-2.5" />
                                    <span className="truncate max-w-[180px]">{lead.website.replace(/^https?:\/\//, "")}</span>
                                  </a>
                                )}
                              </td>

                              {/* Phone & WhatsApp */}
                              <td className="py-3 px-3">
                                {lead.phone ? (
                                  <div className="space-y-1">
                                    <div className="text-[#E4E7EB] text-xs">{lead.phone}</div>
                                    <a
                                      href={`https://wa.me/${(lead.phone || "").replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-[10px] font-bold hover:bg-[#00FF9C]/20 transition-all"
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-[#717681] text-[10px]">Não informado</span>
                                )}
                              </td>

                              {/* Email */}
                              <td className="py-3 px-3">
                                {lead.email ? (
                                  <div className="space-y-1">
                                    <div className="text-[#38BDF8] text-xs font-bold flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-[#38BDF8]" />
                                      <span>{lead.email}</span>
                                    </div>
                                    {lead.emailStatus === "protected_cloudflare" && (
                                      <span className="text-[9px] text-[#F59E0B] bg-[#F59E0B]/10 px-1 border border-[#F59E0B]/30">
                                        🛡️ Cloudflare Bypass
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#717681] text-[10px]">Não localizado</span>
                                )}
                              </td>

                              {/* Gemini Icebreaker */}
                              <td className="py-3 px-3 max-w-[280px]">
                                {lead.icebreaker ? (
                                  <div className="space-y-1">
                                    <p className="text-[11px] text-[#A0A6B1] line-clamp-2 italic">
                                      "{lead.icebreaker}"
                                    </p>
                                    <span className="inline-block text-[9px] font-mono bg-[#F59E0B]/10 text-[#F59E0B] px-1 border border-[#F59E0B]/30">
                                      ✨ Gemini Pro
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[#717681] text-[10px]">Pendente</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setActiveLeadModal(lead)}
                                    className="p-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/50 text-[#00FF9C] transition-all"
                                    title="Ver Detalhes & Copiar Abordagem"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </button>
                                  {onSelectLeadForAI && (
                                    <button
                                      onClick={() => {
                                        onSelectLeadForAI(lead);
                                        if (onNavigate) onNavigate("ai_enrichment");
                                      }}
                                      className="p-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#38BDF8]/50 text-[#38BDF8] transition-all"
                                      title="Customizar no Módulo 3"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="p-1.5 text-[#717681] hover:text-rose-400 transition-colors"
                                    title="Excluir este lead"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#14161B] border border-[#22262E] p-12 text-center text-xs font-mono text-[#717681] space-y-2">
                <Layers className="w-8 h-8 mx-auto text-[#717681] opacity-50" />
                <div>Selecione uma tarefa à esquerda para visualizar seus dados higienizados e arquivos.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Lead Quick View & Icebreaker Copy */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161B] border border-[#00FF9C] p-6 max-w-xl w-full space-y-4 font-mono text-xs shadow-[0_0_24px_rgba(0,255,156,0.15)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#22262E] pb-3">
              <div>
                <span className="text-[10px] text-[#00FF9C] uppercase font-bold">Ficha do Lead B2B</span>
                <h3 className="text-base font-bold text-[#E4E7EB] mt-0.5">{activeLeadModal.name}</h3>
              </div>
              <button
                onClick={() => setActiveLeadModal(null)}
                className="text-[#717681] hover:text-[#E4E7EB] text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                <span className="text-[#717681] block text-[10px]">Nicho / Categoria:</span>
                <span className="text-[#E4E7EB] font-bold">{activeLeadModal.category || "Empresa"}</span>
              </div>
              <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                <span className="text-[#717681] block text-[10px]">Localização:</span>
                <span className="text-[#E4E7EB] font-bold">{activeLeadModal.city} - {activeLeadModal.state}</span>
              </div>
              <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                <span className="text-[#717681] block text-[10px]">Telefone / WhatsApp:</span>
                <span className="text-[#00FF9C] font-bold">{activeLeadModal.phone || "Não informado"}</span>
              </div>
              <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                <span className="text-[#717681] block text-[10px]">E-mail Corporativo:</span>
                <span className="text-[#38BDF8] font-bold">{activeLeadModal.email || "Não informado"}</span>
              </div>
            </div>

            {/* About Us text */}
            {activeLeadModal.aboutUsText && (
              <div className="space-y-1">
                <span className="text-[10px] text-[#717681] uppercase font-bold">Página "Sobre Nós" Raspada:</span>
                <div className="bg-[#0A0B0E] border border-[#22262E] p-3 text-[11px] text-[#A0A6B1] max-h-24 overflow-y-auto">
                  {activeLeadModal.aboutUsText}
                </div>
              </div>
            )}

            {/* Icebreaker Box */}
            {activeLeadModal.icebreaker && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#00FF9C] uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Quebra-Gelo B2B (Gemini Pro)</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeLeadModal.icebreaker || "");
                      alert("Quebra-gelo copiado para a área de transferência!");
                    }}
                    className="text-[10px] text-[#00FF9C] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="bg-[#0A0B0E] border border-[#00FF9C]/40 p-3 text-xs text-[#E4E7EB]">
                  {activeLeadModal.icebreaker}
                </div>
              </div>
            )}

            {/* Cold Email Body */}
            {activeLeadModal.coldEmailBody && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#38BDF8] uppercase font-bold">
                  Sugestão de Cold Email:
                </span>
                <div className="bg-[#0A0B0E] border border-[#22262E] p-3 text-xs text-[#A0A6B1] whitespace-pre-line">
                  <div className="font-bold text-[#E4E7EB] border-b border-[#22262E] pb-1 mb-2">
                    Assunto: {activeLeadModal.coldEmailSubject}
                  </div>
                  {activeLeadModal.coldEmailBody}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveLeadModal(null)}
                className="px-4 py-2 bg-[#1C1F26] border border-[#22262E] text-xs font-mono text-[#E4E7EB] hover:border-[#00FF9C]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
