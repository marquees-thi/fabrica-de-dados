import React from "react";
import { Database, Server, Cpu, Sparkles, CheckCircle2, ArrowRight, Activity, Wifi } from "lucide-react";

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="border-b-2 border-[#22262E] bg-[#0A0B0E] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          {/* Title & Pipeline Subtitle */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#14161B] border border-[#00FF9C]/40 flex items-center justify-center text-[#00FF9C] shadow-[0_0_12px_rgba(0,255,156,0.15)] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#00FF9C] uppercase font-mono">
                  Fábrica de Dados B2B v2.4
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#14161B] text-[#00FF9C] border border-[#00FF9C]/30 tracking-widest uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#717681] font-mono tracking-wider mt-0.5 uppercase">
                ESCALA BIG DATA / AUTOMAÇÃO CONTÍNUA / ENRIQUECIMENTO GEMINI PRO
              </p>
            </div>
          </div>

          {/* System Telemetry Stats Block */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] font-mono border-t md:border-t-0 pt-2 md:pt-0 border-[#22262E]">
            
            <div className="text-right">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider">HARDWARE</div>
              <div className="text-[#E4E7EB] font-bold flex items-center justify-end gap-1">
                <Cpu className="w-3 h-3 text-[#00FF9C]" />
                <span>XEON + RTX 4060</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider">UPTIME</div>
              <div className="text-[#00FF9C] font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse"></span>
                <span>342:12:09</span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider">NETWORK</div>
              <div className="text-[#E4E7EB] font-bold flex items-center justify-end gap-1">
                <Wifi className="w-3 h-3 text-[#88C0D0]" />
                <span>1.2 GBPS</span>
              </div>
            </div>

            <div className="text-right hidden lg:block">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider">STATUS PIPELINE</div>
              <div className="text-[#00FF9C] font-bold text-[10px]">
                ETAPA 1 → 2 → 3 [OK]
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

