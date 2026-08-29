import React, { useState, useMemo } from "react";
import { 
  Compass, 
  Play, 
  Layers, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  FileSpreadsheet, 
  FileJson, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Phone, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  PlusCircle,
  ListPlus,
  Building,
  Radio
} from "lucide-react";
import { CompanyLead } from "../types";
import { BRAZIL_CITIES } from "../data/brazilCities";
import { TabKey } from "./TabsNav";

interface LiveGarimpoTesterProps {
  onSendToGemini?: (company: CompanyLead) => void;
  onNavigate?: (tab: TabKey) => void;
}

type SearchMode = "manual" | "preset" | "bulk";
type SortField = "name" | "category" | "city" | "suburb" | "rating" | "reviewsCount" | "hasPhone" | "hasWebsite";
type SortOrder = "asc" | "desc";
type FilterChip = "all" | "has_phone" | "has_website" | "no_website" | "high_rating";

export const LiveGarimpoTester: React.FC<LiveGarimpoTesterProps> = ({ onSendToGemini, onNavigate }) => {
  // Mode selection
  const [searchMode, setSearchMode] = useState<SearchMode>("manual");

  // Mode 1: Manual Input
  const [manualCity, setManualCity] = useState("Campinas");
  const [manualState, setManualState] = useState("SP");
  const [manualNiche, setManualNiche] = useState("Agência de Marketing Digital");

  // Mode 2: Preset Selection
  const [selectedCity, setSelectedCity] = useState<string>("São Paulo");
  const [selectedState, setSelectedState] = useState<string>("SP");
  const [selectedNiche, setSelectedNiche] = useState<string>("marketing");

  // Mode 3: Bulk Input
  const [bulkCities, setBulkCities] = useState("Campinas - SP\nRibeirão Preto - SP\nSantos - SP\nSão José dos Campos - SP");
  const [bulkNiches, setBulkNiches] = useState("advocacia\nclinica\nsoftware\nenergia_solar");

  // General parameters
  const [limit, setLimit] = useState(40);
  const [loading, setLoading] = useState(false);
  const [schedulingJob, setSchedulingJob] = useState(false);
  const [leads, setLeads] = useState<CompanyLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChip, setFilterChip] = useState<FilterChip>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [copiedUrls, setCopiedUrls] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCityPresetChange = (cityName: string) => {
    setSelectedCity(cityName);
    const found = BRAZIL_CITIES.find((c) => c.name === cityName);
    if (found) {
      setSelectedState(found.state);
    }
  };

  const handleGarimpar = async () => {
    setLoading(true);
    let targetCity = "São Paulo";
    let targetState = "SP";
    let targetNicho = "marketing";

    if (searchMode === "manual") {
      targetCity = manualCity.trim() || "São Paulo";
      targetState = manualState.trim() || "SP";
      targetNicho = manualNiche.trim() || "Empresas";
    } else if (searchMode === "preset") {
      targetCity = selectedCity;
      targetState = selectedState;
      targetNicho = selectedNiche;
    } else if (searchMode === "bulk") {
      const firstCity = bulkCities.split("\n")[0] || "São Paulo - SP";
      const firstNiche = bulkNiches.split("\n")[0] || "marketing";
      targetCity = firstCity.split("-")[0].trim();
      targetState = firstCity.split("-")[1]?.trim() || "SP";
      targetNicho = firstNiche.trim();
    }

    try {
      const res = await fetch("/api/osm-garimpar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cidade: targetCity,
          estado: targetState,
          nicho: targetNicho,
          limit,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        setLeads(data.companies);
        showNotification(`✓ ${data.companies.length} empresas garimpadas com sucesso em ${targetCity}!`);
      } else {
        showNotification("Erro ao garimpar dados.");
      }
    } catch (err: any) {
      console.error(err);
      showNotification("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBackgroundJob = async () => {
    try {
      setSchedulingJob(true);
      let cities: string[] = [];
      let niches: string[] = [];

      if (searchMode === "bulk") {
        cities = bulkCities.split("\n").map(s => s.trim()).filter(Boolean);
        niches = bulkNiches.split("\n").map(s => s.trim()).filter(Boolean);
      } else if (searchMode === "manual") {
        cities = [`${manualCity} - ${manualState}`];
        niches = [manualNiche];
      } else {
        cities = [`${selectedCity} - ${selectedState}`];
        niches = [selectedNiche];
      }

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Garimpo [${cities.length} Cidades] x [${niches.length} Nichos]`,
          cities,
          niches,
          type: "batch_multi",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`✓ Tarefa registrada! O servidor continuará rodando 24/7.`);
        if (onNavigate) {
          setTimeout(() => onNavigate("background_jobs"), 1000);
        }
      }
    } catch (err: any) {
      alert("Erro ao agendar job: " + err.message);
    } finally {
      setSchedulingJob(false);
    }
  };

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const processedLeads = useMemo(() => {
    let list = [...leads];

    // Filter Chips
    if (filterChip === "has_phone") {
      list = list.filter(l => Boolean(l.phone));
    } else if (filterChip === "has_website") {
      list = list.filter(l => Boolean(l.website));
    } else if (filterChip === "no_website") {
      list = list.filter(l => !l.website);
    } else if (filterChip === "high_rating") {
      list = list.filter(l => (Number(l.rating) || 0) >= 4.5);
    }

    // Free text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(l => 
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.suburb && l.suburb.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.website && l.website.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any = a[sortField] ?? "";
      let bVal: any = b[sortField] ?? "";

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [leads, filterChip, searchTerm, sortField, sortOrder]);

  // Export Spreadsheet (.CSV Excel UTF-8)
  const exportToSpreadsheet = () => {
    if (processedLeads.length === 0) {
      alert("Nenhum lead para exportar.");
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

    const rows = processedLeads.map(lead => {
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
    a.download = `planilha_leads_${searchMode}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyUrlsTxt = () => {
    const urls = processedLeads.map(l => l.mapsSearchUrl).join("\n");
    navigator.clipboard.writeText(urls);
    setCopiedUrls(true);
    setTimeout(() => setCopiedUrls(false), 2000);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold px-4 py-3 shadow-[0_0_20px_rgba(0,255,156,0.4)] flex items-center gap-2">
          <span>{notification}</span>
        </div>
      )}

      {/* Control Console */}
      <div className="bg-[#14161B] border border-[#22262E] p-4 sm:p-5 space-y-4">
        
        {/* Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#22262E] pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSearchMode("manual")}
              className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
                searchMode === "manual"
                  ? "bg-[#00FF9C] text-[#0A0B0E]"
                  : "bg-[#0A0B0E] text-[#717681] hover:text-[#E4E7EB] border border-[#22262E]"
              }`}
            >
              1. DIGITAÇÃO MANUAL LIVRE
            </button>
            <button
              onClick={() => setSearchMode("preset")}
              className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
                searchMode === "preset"
                  ? "bg-[#00FF9C] text-[#0A0B0E]"
                  : "bg-[#0A0B0E] text-[#717681] hover:text-[#E4E7EB] border border-[#22262E]"
              }`}
            >
              2. CAPITAIS PREDEFINIDAS
            </button>
            <button
              onClick={() => setSearchMode("bulk")}
              className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
                searchMode === "bulk"
                  ? "bg-[#00FF9C] text-[#0A0B0E]"
                  : "bg-[#0A0B0E] text-[#717681] hover:text-[#E4E7EB] border border-[#22262E]"
              }`}
            >
              3. LOTE MASSIVO (MULTI-CIDADES)
            </button>
          </div>

          <span className="text-[10px] text-[#00FF9C] border border-[#00FF9C]/30 px-2 py-0.5 uppercase">
            OSM Geodesic Scraper // Zero Bloqueios
          </span>
        </div>

        {/* Mode 1: Manual */}
        {searchMode === "manual" && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-4">
              <label className="text-[#717681] block mb-1">DIGITE A CIDADE:</label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder="Ex: Campinas, Sorocaba, Blumenau"
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#717681] block mb-1">ESTADO (UF):</label>
              <input
                type="text"
                value={manualState}
                onChange={(e) => setManualState(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SP"
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden uppercase text-center font-mono"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-[#717681] block mb-1">NICHO / PALAVRA-CHAVE:</label>
              <input
                type="text"
                value={manualNiche}
                onChange={(e) => setManualNiche(e.target.value)}
                placeholder="Ex: Clínicas, Advocacia, Energia Solar"
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#717681] block mb-1">LIMITE:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              >
                <option value={25}>25 Leads</option>
                <option value={50}>50 Leads</option>
                <option value={100}>100 Leads</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode 2: Preset */}
        {searchMode === "preset" && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-5">
              <label className="text-[#717681] block mb-1">CIDADE PREDEFINIDA:</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityPresetChange(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              >
                {BRAZIL_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="text-[#717681] block mb-1">NICHO / CATEGORIA:</label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              >
                <option value="marketing">Agências de Marketing & Publicidade</option>
                <option value="software">Empresas de Software, SaaS & TI</option>
                <option value="advocacia">Escritórios de Advocacia</option>
                <option value="contabilidade">Escritórios de Contabilidade</option>
                <option value="clinica">Clínicas Médicas & Odontologia</option>
                <option value="energia_solar">Energia Solar & Engenharia</option>
                <option value="imobiliaria">Imobiliárias & Corretores</option>
                <option value="restaurante">Restaurantes & Gastronomia</option>
                <option value="academia">Academias & Fitness</option>
                <option value="ecommerce">E-commerce & Lojas</option>
                <option value="geral">Empresas & Negócios Gerais</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#717681] block mb-1">LIMITE:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              >
                <option value={30}>30 Leads</option>
                <option value={50}>50 Leads</option>
                <option value={100}>100 Leads</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode 3: Bulk */}
        {searchMode === "bulk" && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#717681] block mb-1">LISTA DE CIDADES (1 POR LINHA):</label>
                <textarea
                  rows={4}
                  value={bulkCities}
                  onChange={(e) => setBulkCities(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
                  placeholder="Campinas - SP&#10;Santos - SP&#10;Ribeirão Preto - SP"
                />
              </div>
              <div>
                <label className="text-[#717681] block mb-1">LISTA DE NICHOS (1 POR LINHA):</label>
                <textarea
                  rows={4}
                  value={bulkNiches}
                  onChange={(e) => setBulkNiches(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
                  placeholder="advocacia&#10;clinica&#10;software"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#22262E]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleGarimpar}
              disabled={loading}
              className="bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold py-2.5 px-4 flex items-center gap-2 hover:bg-[#00FF9C]/90 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,156,0.2)]"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "GARIMPANDO LEADS..." : "GARIMPAR AGORA"}</span>
            </button>

            <button
              onClick={handleScheduleBackgroundJob}
              disabled={schedulingJob}
              className="bg-[#1C1F26] text-[#00FF9C] border border-[#00FF9C]/40 font-mono text-xs font-bold py-2.5 px-4 flex items-center gap-2 hover:bg-[#00FF9C]/10 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{schedulingJob ? "Agendando..." : "AGENDAR NA FILA 24/7"}</span>
            </button>
          </div>

          {leads.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportToSpreadsheet}
                className="bg-[#14161B] text-[#E4E7EB] border border-[#22262E] hover:border-[#00FF9C] font-mono text-xs py-2 px-3 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Baixar planilha formatada para Excel / Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#00FF9C]" />
                <span>BAIXAR PLANILHA (.CSV)</span>
              </button>

              <button
                onClick={copyUrlsTxt}
                className="bg-[#14161B] text-[#717681] border border-[#22262E] hover:text-[#E4E7EB] font-mono text-xs py-2 px-2.5 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrls ? "COPIADO!" : "URLS.TXT"}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Results Section */}
      {leads.length > 0 && (
        <div className="bg-[#14161B] border border-[#22262E] p-4 space-y-4">
          
          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#717681] text-[11px] mr-1">FILTRAR:</span>
              
              <button
                onClick={() => setFilterChip("all")}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                  filterChip === "all"
                    ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C]"
                    : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                }`}
              >
                Todos ({leads.length})
              </button>

              <button
                onClick={() => setFilterChip("has_phone")}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                  filterChip === "has_phone"
                    ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C]"
                    : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                }`}
              >
                Com Telefone ({leads.filter(l => Boolean(l.phone)).length})
              </button>

              <button
                onClick={() => setFilterChip("has_website")}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                  filterChip === "has_website"
                    ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C]"
                    : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                }`}
              >
                Com Site ({leads.filter(l => Boolean(l.website)).length})
              </button>

              <button
                onClick={() => setFilterChip("no_website")}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                  filterChip === "no_website"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                }`}
                title="Empresas sem site próprio - Ideais para vender desenvolvimento e tráfego"
              >
                🎯 Sem Site ({leads.filter(l => !l.website).length})
              </button>

              <button
                onClick={() => setFilterChip("high_rating")}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                  filterChip === "high_rating"
                    ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C]"
                    : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB]"
                }`}
              >
                ★ 4.5+ ({leads.filter(l => Number(l.rating) >= 4.5).length})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#717681]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome, bairro..."
                className="w-full bg-[#0A0B0E] border border-[#22262E] pl-8 pr-3 py-1.5 text-xs text-[#E4E7EB] placeholder-[#717681] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>

          </div>

          {/* Interactive Data Table with Sorting */}
          <div className="border border-[#22262E] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0B0E] text-[#717681] uppercase border-b border-[#22262E]">
                <tr>
                  <th 
                    onClick={() => handleSort("name")}
                    className="p-3 cursor-pointer hover:text-[#E4E7EB] select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Empresa</span>
                      {sortField === "name" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#00FF9C]" /> : <ArrowDown className="w-3 h-3 text-[#00FF9C]" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort("category")}
                    className="p-3 cursor-pointer hover:text-[#E4E7EB] select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Nicho / Categoria</span>
                      {sortField === "category" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#00FF9C]" /> : <ArrowDown className="w-3 h-3 text-[#00FF9C]" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort("suburb")}
                    className="p-3 cursor-pointer hover:text-[#E4E7EB] select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Bairro / Endereço</span>
                      {sortField === "suburb" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#00FF9C]" /> : <ArrowDown className="w-3 h-3 text-[#00FF9C]" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort("rating")}
                    className="p-3 cursor-pointer hover:text-[#E4E7EB] select-none text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Avaliação</span>
                      {sortField === "rating" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#00FF9C]" /> : <ArrowDown className="w-3 h-3 text-[#00FF9C]" />)}
                    </div>
                  </th>

                  <th className="p-3">Contato & Website</th>

                  <th className="p-3 text-right">Ação IA</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#22262E]">
                {processedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#717681]">
                      Nenhuma empresa corresponde aos critérios de busca ou filtros.
                    </td>
                  </tr>
                ) : (
                  processedLeads.map((lead) => {
                    const cleanPhone = (lead.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

                    return (
                      <tr key={lead.id} className="hover:bg-[#1C1F26] transition-colors">
                        
                        {/* Company Name */}
                        <td className="p-3 font-bold text-[#E4E7EB]">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span>{lead.name}</span>
                              <a
                                href={lead.mapsSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#717681] hover:text-[#00FF9C]"
                                title="Ver no Google Maps"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-[10px] text-[#717681] font-normal">
                              GPS: {lead.lat}, {lead.lon}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3 text-[#A0A6B1]">
                          <span className="bg-[#0A0B0E] px-2 py-0.5 border border-[#22262E] text-[11px]">
                            {lead.category}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="p-3 text-[#A0A6B1] max-w-xs truncate">
                          <div className="space-y-0.5">
                            <div className="text-[#E4E7EB] font-bold text-[11px]">{lead.suburb || "Região Central"}</div>
                            <div className="text-[10px] text-[#717681] truncate">{lead.address}</div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-[#0A0B0E] px-2 py-0.5 border border-[#22262E]">
                            <span className="text-amber-400">★</span>
                            <span className="font-bold text-[#E4E7EB]">{lead.rating}</span>
                            <span className="text-[10px] text-[#717681]">({lead.reviewsCount})</span>
                          </div>
                        </td>

                        {/* Contact & Website */}
                        <td className="p-3">
                          <div className="space-y-1">
                            {lead.phone ? (
                              <div className="flex items-center gap-1.5 text-[#00FF9C]">
                                <Phone className="w-3 h-3" />
                                <span className="font-bold">{lead.phone}</span>
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 px-1 hover:bg-[#00FF9C] hover:text-[#0A0B0E] transition-all"
                                  >
                                    WA
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#717681] text-[10px] flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Sem telefone
                              </span>
                            )}

                            {lead.website ? (
                              <div className="flex items-center gap-1.5 text-[#717681] hover:text-[#E4E7EB] max-w-[180px] truncate">
                                <Globe className="w-3 h-3 text-[#00FF9C]" />
                                <a href={lead.website} target="_blank" rel="noreferrer" className="underline truncate text-[10px]">
                                  {lead.website.replace(/^https?:\/\//, "")}
                                </a>
                              </div>
                            ) : (
                              <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20">
                                Sem website
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action IA */}
                        <td className="p-3 text-right">
                          {onSendToGemini && (
                            <button
                              onClick={() => {
                                onSendToGemini(lead);
                                if (onNavigate) onNavigate("gemini_test");
                              }}
                              className="bg-[#1C1F26] text-[#00FF9C] border border-[#00FF9C]/40 hover:bg-[#00FF9C] hover:text-[#0A0B0E] font-mono text-[11px] font-bold py-1.5 px-2.5 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,156,0.15)]"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>QUEBRA-GELO IA</span>
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="flex items-center justify-between text-xs text-[#717681] pt-1">
            <span>Mostrando {processedLeads.length} de {leads.length} empresas</span>
            <span>Clique nos cabeçalhos da tabela para ordenar</span>
          </div>

        </div>
      )}

    </div>
  );
};
