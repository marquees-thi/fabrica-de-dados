import React, { useState } from "react";
import { BRAZIL_CITIES } from "../data/brazilCities";
import { GridResponse } from "../types";
import { MapPin, Layers, Play, Copy, Check, Download, ExternalLink, Calculator, Compass, Crosshair } from "lucide-react";

export const GeoGridGenerator: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState("São Paulo");
  const [keyword, setKeyword] = useState("agencia de marketing");
  const [radiusKm, setRadiusKm] = useState(12);
  const [gridStepKm, setGridStepKm] = useState(2.5);

  const [gridData, setGridData] = useState<GridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentCityObj = BRAZIL_CITIES.find((c) => c.name === selectedCity) || BRAZIL_CITIES[0];

  const handleGenerateGrid = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerLat: currentCityObj.lat,
          centerLon: currentCityObj.lon,
          radiusKm,
          gridStepKm,
          keyword: `${keyword} ${selectedCity} ${currentCityObj.state}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGridData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getGridUrlsTxt = () => {
    if (!gridData) return "";
    return gridData.tiles.map((t) => t.url).join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getGridUrlsTxt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getGridUrlsTxt();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grid_urls_${selectedCity.toLowerCase().replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Intro Header */}
      <div className="tech-card p-4 border-[#22262E] space-y-2">
        <div className="tech-card-title flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-[#00FF9C]" />
          ARQUITETURA GEOGRÁFICA BIG DATA: MATRIZ DE TILES GPS
        </div>
        <p className="text-[11px] text-[#717681] leading-relaxed">
          Como o Google Maps restringe a ~120 cards por viewport de busca, cobrimos grandes metrópoles gerando uma <strong className="text-[#00FF9C]">malha geométrica de coordenadas discretas</strong> (Tiles de 15z). Cada micro-coordenada abre um quadrante único, garantindo extração massiva contínua sem repetições.
        </p>
      </div>

      {/* Grid Controls */}
      <div className="tech-card p-4 border-[#22262E] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
              METRÓPOLE ALVO:
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-[#22262E] rounded-[2px] px-2.5 py-1.5 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
            >
              {BRAZIL_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
              NICHO / PALAVRA-CHAVE:
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-[#22262E] rounded-[2px] px-2.5 py-1.5 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
              placeholder="Ex: clinicas odontologicas"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
              RAIO DE COBERTURA (KM):
            </label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              min={4}
              max={40}
              className="w-full bg-[#0A0B0E] border border-[#22262E] rounded-[2px] px-2.5 py-1.5 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
              ESPAÇAMENTO DO GRID (KM):
            </label>
            <select
              value={gridStepKm}
              onChange={(e) => setGridStepKm(Number(e.target.value))}
              className="w-full bg-[#0A0B0E] border border-[#22262E] rounded-[2px] px-2.5 py-1.5 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
            >
              <option value={1.5}>1.5 Km (Ultra denso - Centros urbanos)</option>
              <option value={2.5}>2.5 Km (Recomendado - Bairros e Capitais)</option>
              <option value={4.0}>4.0 Km (Cidades do Interior / Espalhado)</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerateGrid}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#00FF9C] hover:bg-[#00FF9C]/90 text-[#0A0B0E] text-xs font-bold rounded-[2px] shadow-[0_0_10px_rgba(0,255,156,0.2)] transition-all cursor-pointer font-mono"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CALCULAR MATRIZ DE TILES GPS</span>
          </button>
        </div>
      </div>

      {/* Grid Output Stats */}
      {gridData && (
        <div className="space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="tech-card p-3 border-[#22262E]">
              <span className="text-[9px] uppercase tracking-wider text-[#717681]">SUB-QUADRANTES (TILES)</span>
              <p className="text-xl font-bold font-mono text-[#00FF9C] mt-0.5">{gridData.totalTiles} MICRO-BUSCAS</p>
            </div>

            <div className="tech-card p-3 border-[#22262E]">
              <span className="text-[9px] uppercase tracking-wider text-[#717681]">RENDIMENTO ESTIMADO</span>
              <p className="text-xl font-bold font-mono text-[#E4E7EB] mt-0.5">~{gridData.estimatedPotentialUrls.toLocaleString()} URLS</p>
            </div>

            <div className="tech-card p-3 border-[#22262E]">
              <span className="text-[9px] uppercase tracking-wider text-[#717681]">ÁREA DE COBERTURA</span>
              <p className="text-xl font-bold font-mono text-[#88C0D0] mt-0.5">~{Math.round(Math.PI * radiusKm * radiusKm)} KM²</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-[2px] bg-[#14161B] border border-[#00FF9C]/40">
            <div>
              <p className="text-xs font-bold text-[#E4E7EB] uppercase">URLs de Varredura por Grid Prontas</p>
              <p className="text-[10px] text-[#717681] font-mono">
                Cada URL alimenta o script Playwright apontando diretamente para as coordenadas calculadas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#00FF9C] hover:bg-[#00FF9C]/90 text-[#0A0B0E] text-xs font-bold font-mono transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "COPIADO!" : "COPIAR GRID"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] text-xs font-medium border border-[#22262E] transition-all cursor-pointer font-mono"
              >
                <Download className="w-3 h-3" />
                <span>BAIXAR .TXT</span>
              </button>
            </div>
          </div>

          {/* Tiles List Preview */}
          <div className="tech-card border-[#22262E] overflow-hidden">
            <div className="max-h-[320px] overflow-y-auto p-3 space-y-1.5 font-mono text-xs">
              {gridData.tiles.map((tile, i) => (
                <div key={tile.id} className="flex items-center justify-between p-2 rounded-[2px] bg-[#0A0B0E] border border-[#22262E] hover:border-[#00FF9C]/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[#717681] text-[10px]">#{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[#00FF9C] text-[11px]">LAT: {tile.lat} | LON: {tile.lon}</span>
                    <span className="text-[#717681] text-[10px]">({tile.distanceKm} km do centro)</span>
                  </div>
                  <a
                    href={tile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#88C0D0] hover:text-[#00FF9C] flex items-center gap-1 text-[10px]"
                  >
                    <span>ABRIR PONTO GPS</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

