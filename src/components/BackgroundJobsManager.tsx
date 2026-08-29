import React, { useState, useEffect } from "react";
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
  Plus
} from "lucide-react";
import { BackgroundJob, CompanyLead } from "../types";
import { TabKey } from "./TabsNav";

interface BackgroundJobsManagerProps {
  onSelectLeadForAI?: (lead: CompanyLead) => void;
  onNavigate?: (tab: TabKey) => void;
}

export const BackgroundJobsManager: React.FC<BackgroundJobsManagerProps> = ({ onSelectLeadForAI, onNavigate }) => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState("");
  const [citiesInput, setCitiesInput] = useState("Campinas - SP\nRibeirão Preto - SP\nSantos - SP\nSão José dos Campos - SP\nSorocaba - SP");
  const [nichesInput, setNichesInput] = useState("advocacia\nclinica\nsoftware\nenergia_solar\ncontabilidade");
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        // Update selected job if active
        if (selectedJob) {
          const updated = data.jobs.find((j: BackgroundJob) => j.id === selectedJob.id);
          if (updated) {
            // Also fetch full leads if selected
            fetchJobDetails(selectedJob.id);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao listar tarefas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedJob(data.job);
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes do job:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 3 seconds for active jobs progress
    const interval = setInterval(() => {
      fetchJobs();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async () => {
    const cities = citiesInput.split("\n").map(s => s.trim()).filter(Boolean);
    const niches = nichesInput.split("\n").map(s => s.trim()).filter(Boolean);

    if (cities.length === 0 || niches.length === 0) {
      alert("Por favor insira ao menos 1 cidade e 1 nicho.");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle || `Garimpo Massivo [${cities.length} Cidades] x [${niches.length} Nichos]`,
          cities,
          niches,
          type: "batch_multi"
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewJobModal(false);
        setJobTitle("");
        fetchJobs();
        setSelectedJob(data.job);
      }
    } catch (err: any) {
      alert("Erro ao iniciar tarefa: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (selectedJob?.id === jobId) setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFinished = async () => {
    try {
      await fetch("/api/jobs/clear", { method: "POST" });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const exportJobToCSV = (job: BackgroundJob) => {
    if (!job.leads || job.leads.length === 0) {
      alert("Nenhum lead coletado nesta tarefa.");
      return;
    }

    const headers = [
      "Nome da Empresa",
      "Nicho / Categoria",
      "Telefone",
      "WhatsApp Direct Link",
      "Website",
      "Endereço Completo",
      "Bairro",
      "Cidade",
      "Estado",
      "Nota Google",
      "Total Avaliações",
      "Latitude",
      "Longitude",
      "Link Busca Maps",
    ];

    const rows = job.leads.map(lead => {
      const cleanPhone = (lead.phone || "").replace(/\D/g, "");
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : "";
      return [
        `"${(lead.name || "").replace(/"/g, '""')}"`,
        `"${(lead.category || "").replace(/"/g, '""')}"`,
        `"${lead.phone || ""}"`,
        `"${waLink}"`,
        `"${lead.website || ""}"`,
        `"${(lead.address || "").replace(/"/g, '""')}"`,
        `"${lead.suburb || ""}"`,
        `"${lead.city || ""}"`,
        `"${lead.state || ""}"`,
        lead.rating || "",
        lead.reviewsCount || 0,
        lead.lat || "",
        lead.lon || "",
        `"${lead.mapsSearchUrl || ""}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${job.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#14161B] border border-[#22262E] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00FF9C]" />
            <h2 className="text-base font-bold font-mono text-[#E4E7EB] uppercase tracking-wide">
              Fila de Execução Autônoma 24/7 (Daemon no Servidor)
            </h2>
          </div>
          <p className="text-xs text-[#A0A6B1] font-sans">
            As tarefas listadas abaixo rodam como processos em segundo plano no servidor Ubuntu. Você pode fechar o site ou desligar seu computador: o servidor continuará executando e salvará todos os leads no banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewJobModal(true)}
            className="bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold py-2 px-3.5 flex items-center gap-2 hover:bg-[#00FF9C]/90 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,156,0.2)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NOVA TAREFA EM MASSA</span>
          </button>

          <button
            onClick={fetchJobs}
            className="p-2 bg-[#1C1F26] border border-[#22262E] text-[#717681] hover:text-[#E4E7EB] transition-all cursor-pointer"
            title="Atualizar Fila"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00FF9C]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Jobs List & Job Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-[#717681] px-1">
            <span>TAREFAS REGISTRADAS ({jobs.length})</span>
            {jobs.some(j => j.status === "completed" || j.status === "cancelled") && (
              <button 
                onClick={handleClearFinished}
                className="hover:text-red-400 text-[10px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar Concluídas</span>
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="bg-[#14161B] border border-[#22262E] p-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-[#717681] mx-auto" />
              <p className="text-xs text-[#717681] font-mono">Nenhuma tarefa agendada na fila.</p>
              <button
                onClick={() => setShowNewJobModal(true)}
                className="text-xs text-[#00FF9C] hover:underline font-mono cursor-pointer"
              >
                + Iniciar primeira varredura em massa
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isRunning = job.status === "running" || job.status === "pending";
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      fetchJobDetails(job.id);
                    }}
                    className={`p-4 border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-[#1C1F26] border-[#00FF9C] shadow-[0_0_12px_rgba(0,255,156,0.1)]"
                        : "bg-[#14161B] border-[#22262E] hover:border-[#717681]"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isRunning ? (
                            <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse"></span>
                          ) : job.status === "completed" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9C]" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <h3 className="font-mono text-xs font-bold text-[#E4E7EB] line-clamp-1">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-[10px] text-[#717681] font-mono">
                          {job.cities.length} Cidades • {job.niches.length} Nichos • {job.totalCombinations} Varreduras
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider ${
                        isRunning
                          ? "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30"
                          : job.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="w-full bg-[#0A0B0E] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isRunning ? "bg-[#00FF9C]" : "bg-emerald-400"
                          }`}
                          style={{ width: `${job.progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#717681]">
                        <span className="truncate max-w-[200px]">{job.currentStep}</span>
                        <span className="text-[#E4E7EB] font-bold">{job.progressPercent}% ({job.leadsCollected} leads)</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2 border-t border-[#22262E]/60 flex items-center justify-between text-[10px] font-mono text-[#717681]">
                      <span>Iniciado: {new Date(job.createdAt).toLocaleTimeString()}</span>
                      <div className="flex items-center gap-2">
                        {isRunning && (
                          <button
                            onClick={(e) => handleCancelJob(job.id, e)}
                            className="text-amber-400 hover:underline cursor-pointer"
                          >
                            Parar
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteJob(job.id, e)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Job Inspector & Leads Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedJob ? (
            <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-5">
              
              {/* Job Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#22262E] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-1.5 py-0.5 border border-[#00FF9C]/30 uppercase">
                      ID: {selectedJob.id}
                    </span>
                    <h3 className="font-mono text-sm font-bold text-[#E4E7EB]">
                      {selectedJob.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#717681] font-mono">
                    Total Coletado: <strong className="text-[#00FF9C]">{selectedJob.leadsCollected} empresas</strong> • Progresso: {selectedJob.progressPercent}%
                  </p>
                </div>

                {/* Export / Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportJobToCSV(selectedJob)}
                    disabled={!selectedJob.leads || selectedJob.leads.length === 0}
                    className="bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold py-2 px-3 flex items-center gap-1.5 hover:bg-[#00FF9C]/90 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>BAIXAR EXCEL (.CSV)</span>
                  </button>
                </div>
              </div>

              {/* Progress & Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                  <div className="text-[9px] text-[#717681]">STATUS</div>
                  <div className="font-bold text-[#00FF9C] uppercase">{selectedJob.status}</div>
                </div>
                <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                  <div className="text-[9px] text-[#717681]">VARREDURAS</div>
                  <div className="font-bold text-[#E4E7EB]">{selectedJob.completedCombinations} / {selectedJob.totalCombinations}</div>
                </div>
                <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                  <div className="text-[9px] text-[#717681]">LEADS COLETADOS</div>
                  <div className="font-bold text-[#00FF9C]">{selectedJob.leadsCollected}</div>
                </div>
                <div className="bg-[#0A0B0E] p-2.5 border border-[#22262E]">
                  <div className="text-[9px] text-[#717681]">FINALIZADO EM</div>
                  <div className="font-bold text-[#E4E7EB]">
                    {selectedJob.finishedAt ? new Date(selectedJob.finishedAt).toLocaleTimeString() : "Em andamento..."}
                  </div>
                </div>
              </div>

              {/* Live Terminal Log */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#717681]">
                  <Terminal className="w-3.5 h-3.5 text-[#00FF9C]" />
                  <span>LOGS DO SERVIDOR EM TEMPO REAL:</span>
                </div>
                <div className="bg-[#0A0B0E] border border-[#22262E] p-3 font-mono text-[11px] text-[#A0A6B1] h-32 overflow-y-auto space-y-1">
                  {selectedJob.logs && selectedJob.logs.map((log, i) => (
                    <div key={i} className="leading-tight">
                      <span className="text-[#717681]">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview of Leads Extracted in this Job */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#717681]">
                  <span>PRÉVIA DOS LEADS ({selectedJob.leads?.length || 0})</span>
                  <span className="text-[10px]">Primeiros 20 resultados</span>
                </div>

                <div className="border border-[#22262E] overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-[#0A0B0E] text-[#717681] uppercase sticky top-0 border-b border-[#22262E]">
                      <tr>
                        <th className="p-2">Empresa</th>
                        <th className="p-2">Nicho</th>
                        <th className="p-2">Cidade/Bairro</th>
                        <th className="p-2">Telefone</th>
                        <th className="p-2">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#22262E]">
                      {(!selectedJob.leads || selectedJob.leads.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-[#717681]">
                            Coletando leads no background... Aguarde alguns instantes.
                          </td>
                        </tr>
                      ) : (
                        selectedJob.leads.slice(0, 25).map((lead, idx) => (
                          <tr key={lead.id || idx} className="hover:bg-[#1C1F26] transition-colors">
                            <td className="p-2 font-bold text-[#E4E7EB]">{lead.name}</td>
                            <td className="p-2 text-[#717681]">{lead.category}</td>
                            <td className="p-2 text-[#A0A6B1]">{lead.city || lead.suburb}</td>
                            <td className="p-2 text-[#00FF9C]">{lead.phone || "-"}</td>
                            <td className="p-2">
                              {onSelectLeadForAI && (
                                <button
                                  onClick={() => {
                                    onSelectLeadForAI(lead);
                                    if (onNavigate) onNavigate("gemini_test");
                                  }}
                                  className="text-[10px] text-[#00FF9C] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Quebra-Gelo</span>
                                </button>
                              )}
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
            <div className="bg-[#14161B] border border-[#22262E] p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#717681] mx-auto opacity-50" />
              <h3 className="font-mono text-sm font-bold text-[#E4E7EB]">Selecione uma tarefa para inspecionar</h3>
              <p className="text-xs text-[#717681] font-sans max-w-sm mx-auto">
                Clique em qualquer tarefa da lista ao lado para ver o progresso detalhado, logs em tempo real e baixar a planilha consolidada.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* New Mass Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#14161B] border border-[#00FF9C] p-6 max-w-lg w-full space-y-4 shadow-[0_0_30px_rgba(0,255,156,0.2)]">
            <div className="flex items-center justify-between border-b border-[#22262E] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00FF9C]" />
                <h3 className="font-mono font-bold text-sm text-[#E4E7EB] uppercase">
                  Agendar Nova Varredura Massiva 24/7
                </h3>
              </div>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="text-[#717681] hover:text-[#E4E7EB] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#717681] block mb-1">TÍTULO DA TAREFA (OPCIONAL):</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Prospecção Interior SP - Advogados & Clínicas"
                  className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#717681] block mb-1">CIDADES (1 POR LINHA):</label>
                  <textarea
                    rows={6}
                    value={citiesInput}
                    onChange={(e) => setCitiesInput(e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono text-xs"
                    placeholder="São Paulo - SP&#10;Campinas - SP&#10;Santos - SP"
                  />
                  <span className="text-[10px] text-[#717681]">
                    {citiesInput.split("\n").filter(Boolean).length} cidades configuradas
                  </span>
                </div>

                <div>
                  <label className="text-[#717681] block mb-1">NICHOS / TERMOS (1 POR LINHA):</label>
                  <textarea
                    rows={6}
                    value={nichesInput}
                    onChange={(e) => setNichesInput(e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono text-xs"
                    placeholder="advocacia&#10;marketing&#10;clinica"
                  />
                  <span className="text-[10px] text-[#717681]">
                    {nichesInput.split("\n").filter(Boolean).length} nichos configurados
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0B0E] border border-[#22262E] p-3 text-[11px] text-[#A0A6B1] font-sans">
                💡 <strong>Autonomia Total:</strong> Essa tarefa será executada em fila contínua no servidor. Você pode fechar esta janela após iniciar.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#22262E]">
              <button
                onClick={() => setShowNewJobModal(false)}
                className="px-4 py-2 bg-[#1C1F26] text-[#717681] hover:text-[#E4E7EB] font-mono text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateJob}
                disabled={creating}
                className="px-4 py-2 bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold hover:bg-[#00FF9C]/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{creating ? "Iniciando..." : "DISPARAR NO SERVIDOR"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
