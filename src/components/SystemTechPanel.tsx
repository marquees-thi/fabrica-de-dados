import React, { useState } from "react";
import { 
  Terminal, 
  Server, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  ShieldAlert,
  FileCode,
  HardDrive
} from "lucide-react";

export const SystemTechPanel: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const systemdScript = `[Unit]
Description=Fabrica de Dados B2B - Node Server 24/7
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/b2b-lead-factory
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target`;

  const cronExample = `# Executar varredura a cada 6 horas automaticamente
0 */6 * * * /usr/bin/python3 /home/ubuntu/b2b-lead-factory/scripts/etapa1_garimpeiro.py >> /var/log/garimpo.log 2>&1`;

  return (
    <div className="space-y-6 font-mono">
      
      {/* Header */}
      <div className="bg-[#14161B] border border-[#22262E] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#00FF9C]" />
            <h2 className="text-base font-bold text-[#E4E7EB] uppercase tracking-wide">
              Painel Técnico & Registro de Arquitetura
            </h2>
          </div>
          <p className="text-xs text-[#A0A6B1] font-sans">
            Documentação técnica de engenharia reversa do DOM do Google Maps, mitigação de anti-bot e configuração do serviço daemon 24/7 no Ubuntu Server.
          </p>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DOM Diagnosis & Selectors */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00FF9C] border-b border-[#22262E] pb-2">
            <Code2 className="w-4 h-4" />
            <span>ENGENHARIA REVERSA: SELETORES DOM GOOGLE MAPS</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-[#0A0B0E] p-3 border border-[#22262E] space-y-1">
              <span className="text-[#00FF9C] font-bold">1. Container de Resultados da Busca:</span>
              <p className="text-[#717681]">
                Seletor primário: <code className="text-[#E4E7EB]">div[role="feed"]</code> ou <code className="text-[#E4E7EB]">div[aria-label*="Resultados"]</code>
              </p>
              <p className="text-[11px] text-[#A0A6B1] font-sans">
                O Google Maps utiliza virtual scrolling. Para extrair todos os resultados, o script deve enviar scrolls para o container <code className="text-[#00FF9C]">div[role="feed"]</code>.
              </p>
            </div>

            <div className="bg-[#0A0B0E] p-3 border border-[#22262E] space-y-1">
              <span className="text-[#00FF9C] font-bold">2. Links dos Cards Individuais:</span>
              <p className="text-[#717681]">
                Seletor: <code className="text-[#E4E7EB]">a[href*="/maps/place/"]</code>
              </p>
              <p className="text-[11px] text-[#A0A6B1] font-sans">
                Contém a URL permanente da empresa com coordenadas e Place ID.
              </p>
            </div>

            <div className="bg-[#0A0B0E] p-3 border border-[#22262E] space-y-1">
              <span className="text-[#00FF9C] font-bold">3. Telefone e Website dentro da Empresa:</span>
              <p className="text-[#717681]">
                Telefone: <code className="text-[#E4E7EB]">button[data-item-id*="phone:tel:"]</code>
              </p>
              <p className="text-[#717681]">
                Website: <code className="text-[#E4E7EB]">a[data-item-id="authority"]</code>
              </p>
            </div>
          </div>
        </div>

        {/* Ubuntu Daemon 24/7 Setup */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E4E7EB]">
              <Server className="w-4 h-4 text-[#00FF9C]" />
              <span>CONFIGURAÇÃO SYSTEMD UBUNTU (24/7)</span>
            </div>
            <button
              onClick={() => handleCopy(systemdScript, "systemd")}
              className="px-2 py-0.5 bg-[#0A0B0E] border border-[#22262E] hover:border-[#00FF9C] text-[10px] text-[#00FF9C] flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === "systemd" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === "systemd" ? "COPIADO" : "COPIAR .SERVICE"}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-[11px] text-[#A0A6B1] font-sans">
              Para manter o servidor rodando mesmo se o SSH cair ou a máquina reiniciar:
            </p>

            <pre className="bg-[#0A0B0E] border border-[#22262E] p-3 text-[10px] text-[#00FF9C] overflow-x-auto">
              {systemdScript}
            </pre>

            <div className="bg-[#0A0B0E] p-3 border border-[#22262E] space-y-1 text-[11px]">
              <span className="text-[#E4E7EB] font-bold">Comandos de ativação:</span>
              <p className="text-[#717681]"><code className="text-[#00FF9C]">sudo systemctl enable fabrica-dados</code></p>
              <p className="text-[#717681]"><code className="text-[#00FF9C]">sudo systemctl start fabrica-dados</code></p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
