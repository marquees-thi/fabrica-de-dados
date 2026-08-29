import React from "react";
import { 
  Laptop, 
  PlayCircle, 
  Layers, 
  Sparkles, 
  MapPin, 
  Code2, 
  Terminal,
  Server
} from "lucide-react";

export type TabKey = 
  | "overview" 
  | "live_garimpo" 
  | "background_jobs" 
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
      key: "overview",
      label: "Central & Manual",
      icon: <Laptop className="w-3.5 h-3.5" />,
      badge: "INÍCIO",
    },
    {
      key: "live_garimpo",
      label: "Garimpo de Leads",
      icon: <PlayCircle className="w-3.5 h-3.5" />,
      badge: "LIVE",
    },
    {
      key: "background_jobs",
      label: "Fila 24/7 no Servidor",
      icon: <Layers className="w-3.5 h-3.5" />,
      badge: "AUTÔNOMO",
    },
    {
      key: "gemini_test",
      label: "IA Quebra-Gelo",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      badge: "GEMINI 3.7",
    },
    {
      key: "grid_generator",
      label: "Grid GPS (Big Data)",
      icon: <MapPin className="w-3.5 h-3.5" />,
      badge: "MULTI-BAIRRO",
    },
    {
      key: "scripts",
      label: "Scripts Python",
      icon: <Code2 className="w-3.5 h-3.5" />,
      badge: "TERMINAL",
    },
    {
      key: "tech_diagnosis",
      label: "Diagnóstico & Ubuntu",
      icon: <Server className="w-3.5 h-3.5" />,
      badge: "DAEMON",
    },
  ];

  return (
    <div className="border-b border-[#22262E] bg-[#0A0B0E]/90 sticky top-[65px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 scrollbar-none font-mono">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-btn-${tab.key}`}
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#14161B] text-[#00FF9C] border-b-2 border-[#00FF9C] border-t border-x border-[#22262E] shadow-[0_2px_8px_rgba(0,255,156,0.1)]"
                    : "text-[#717681] hover:text-[#E4E7EB] hover:bg-[#14161B]/60 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-[#00FF9C]" : "text-[#717681]"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded-[2px] ${
                      isActive
                        ? "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/40"
                        : "bg-[#1C1F26] text-[#717681] border border-[#22262E]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
