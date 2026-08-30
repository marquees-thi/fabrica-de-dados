import React from "react";
import { 
  Zap, 
  Layers, 
  Sliders, 
  PlayCircle, 
  Sparkles, 
  MapPin, 
  Code2, 
  Terminal,
  Server
} from "lucide-react";

export type TabKey = 
  | "launchpad"
  | "background_jobs" 
  | "settings"
  | "live_garimpo" 
  | "gemini_test" 
  | "grid_generator" 
  | "scripts" 
  | "tech_diagnosis";

interface TabsNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      key: "launchpad",
      label: "Lançamento Aperta-Botões",
      icon: <Zap className="w-3.5 h-3.5 text-[#00FF9C]" />,
      badge: "MÓDULO 1",
    },
    {
      key: "background_jobs",
      label: "Fila 24/7 & Leads",
      icon: <Layers className="w-3.5 h-3.5" />,
      badge: "PRODUTO FINAL",
    },
    {
      key: "settings",
      label: "Evasão & Configurações",
      icon: <Sliders className="w-3.5 h-3.5" />,
      badge: "STEALTH / IA",
    },
    {
      key: "live_garimpo",
      label: "Garimpo Live",
      icon: <PlayCircle className="w-3.5 h-3.5" />,
    },
    {
      key: "gemini_test",
      label: "IA Quebra-Gelo",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      key: "grid_generator",
      label: "Grid GPS (Big Data)",
      icon: <MapPin className="w-3.5 h-3.5" />,
    },
    {
      key: "scripts",
      label: "Scripts Python/Playwright",
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      key: "tech_diagnosis",
      label: "Diagnóstico Ubuntu",
      icon: <Terminal className="w-3.5 h-3.5" />,
    }
  ];

  return (
    <nav className="border-b border-[#22262E] bg-[#14161B]/95 backdrop-blur sticky top-[53px] z-40 overflow-x-auto no-scrollbar">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1.5 min-w-max py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`
                flex items-center gap-2 px-3 py-2 text-xs font-mono transition-all border
                ${
                  isActive
                    ? "bg-[#1C1F26] text-[#00FF9C] border-[#00FF9C]/60 shadow-[0_0_12px_rgba(0,255,156,0.15)] font-bold"
                    : "bg-[#0A0B0E]/60 text-[#A0A6B1] border-[#22262E] hover:text-[#E4E7EB] hover:border-[#383D47]"
                }
              `}
            >
              <span className={isActive ? "text-[#00FF9C]" : "text-[#717681]"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 font-mono uppercase tracking-wider ${
                    isActive
                      ? "bg-[#00FF9C]/20 text-[#00FF9C] border border-[#00FF9C]/30"
                      : "bg-[#22262E] text-[#717681]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
