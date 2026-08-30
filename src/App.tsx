import React, { useState } from "react";
import { Header } from "./components/Header";
import { TabsNav, TabKey } from "./components/TabsNav";
import { OneClickLaunchpad } from "./components/OneClickLaunchpad";
import { BackgroundJobsManager } from "./components/BackgroundJobsManager";
import { SettingsEvasionPanel } from "./components/SettingsEvasionPanel";
import { LiveGarimpoTester } from "./components/LiveGarimpoTester";
import { GeminiEnricherTester } from "./components/GeminiEnricherTester";
import { GeoGridGenerator } from "./components/GeoGridGenerator";
import { ScriptViewer } from "./components/ScriptViewer";
import { SystemTechPanel } from "./components/SystemTechPanel";
import { CompanyLead } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("launchpad");
  const [leadForGemini, setLeadForGemini] = useState<CompanyLead | null>(null);

  const handleSendToGemini = (company: CompanyLead) => {
    setLeadForGemini(company);
    setActiveTab("gemini_test");
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E4E7EB] flex flex-col font-mono selection:bg-[#00FF9C]/20 selection:text-[#00FF9C]">
      
      {/* Top Header */}
      <Header activeTab={activeTab} />

      {/* Main Navigation Bar */}
      <TabsNav activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {activeTab === "launchpad" && (
          <OneClickLaunchpad onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === "background_jobs" && (
          <BackgroundJobsManager 
            onSelectLeadForAI={handleSendToGemini}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "settings" && (
          <SettingsEvasionPanel />
        )}

        {activeTab === "live_garimpo" && (
          <LiveGarimpoTester 
            onSendToGemini={handleSendToGemini} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        )}

        {activeTab === "gemini_test" && (
          <GeminiEnricherTester prefilledCompany={leadForGemini} />
        )}

        {activeTab === "grid_generator" && <GeoGridGenerator />}

        {activeTab === "scripts" && <ScriptViewer />}

        {activeTab === "tech_diagnosis" && <SystemTechPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#22262E] bg-[#14161B] py-2.5 text-[10px] text-[#717681] font-mono">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] shadow-[0_0_6px_#00FF9C]"></span>
            <span className="text-[#E4E7EB] uppercase tracking-wider">FÁBRICA DE DADOS B2B // SERVIDOR AUTÔNOMO 24/7</span>
          </div>
          <div className="flex items-center gap-4 text-[#717681]">
            <span>PERSISTÊNCIA EM DISCO</span>
            <span>•</span>
            <span>STEALTH MODE & PROXIES</span>
            <span>•</span>
            <span>FILTRO ANTI-DUPLICIDADE</span>
            <span>•</span>
            <span>GEMINI PRO IA</span>
            <span>•</span>
            <span>WEBHOOK & EXCEL CSV</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
