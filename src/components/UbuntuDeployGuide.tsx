import React, { useState } from "react";
import { Server, Cpu, Terminal, Copy, Check, ShieldCheck, Zap, HardDrive, Clock, TerminalSquare } from "lucide-react";

export const UbuntuDeployGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Server Specs Header */}
      <div className="tech-card p-4 border-[#22262E] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="tech-card-title flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#00FF9C]" />
              PRODUÇÃO 24/7: GUIA DE DEPLOY UBUNTU LINUX (DAEMON SYSTEMD)
            </div>
            <p className="text-[11px] text-[#717681] mt-1 max-w-2xl leading-relaxed">
              Instruções de engenharia para executar a esteira de Garimpo e a Fábrica sem intervenção humana no servidor Ubuntu dedicado.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0A0B0E] border border-[#22262E] px-3 py-2 rounded-[2px] shrink-0">
            <Cpu className="w-6 h-6 text-[#00FF9C] shrink-0" />
            <div className="text-xs font-mono">
              <p className="text-[#E4E7EB] font-bold text-[11px]">HARDWARE DEDICADO</p>
              <p className="text-[#717681] text-[10px]">Intel Xeon • RTX 4060 8GB • Ubuntu 24.04</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: System Dependencies */}
      <div className="tech-card p-4 border-[#22262E] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[2px] bg-[#1C1F26] text-[#00FF9C] border border-[#00FF9C]/40 flex items-center justify-center font-mono text-[10px] font-bold">1</span>
            <h3 className="text-xs font-bold text-[#E4E7EB] uppercase">Instalação de Dependências do Sistema & Playwright</h3>
          </div>
          <button
            onClick={() => handleCopy(`sudo apt update && sudo apt install -y python3-pip python3-venv xvfb curl git
mkdir -p ~/fabrica_dados_b2b && cd ~/fabrica_dados_b2b
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install playwright requests google-genai
playwright install firefox chromium
playwright install-deps`, "sec1")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#00FF9C] border border-[#00FF9C]/40 text-[10px] font-mono transition-colors cursor-pointer"
          >
            {copiedSection === "sec1" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSection === "sec1" ? "COPIADO!" : "COPIAR BLOCO"}</span>
          </button>
        </div>

        <div className="p-3 bg-[#0A0B0E] rounded-[2px] border border-[#22262E] font-mono text-xs text-[#E4E7EB] overflow-x-auto">
          <pre><code>{`# Atualizar repositórios e instalar utilitários
sudo apt update && sudo apt install -y python3-pip python3-venv xvfb curl git

# Criar diretório do projeto e ambiente virtual
mkdir -p ~/fabrica_dados_b2b && cd ~/fabrica_dados_b2b
python3 -m venv venv
source venv/bin/activate

# Instalar bibliotecas essenciais
pip install --upgrade pip
pip install playwright requests google-genai

# Baixar navegadores e dependências de sistema do Ubuntu
playwright install firefox chromium
playwright install-deps`}</code></pre>
        </div>
      </div>

      {/* Step 2: Systemd Daemon Service */}
      <div className="tech-card p-4 border-[#22262E] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[2px] bg-[#1C1F26] text-[#00FF9C] border border-[#00FF9C]/40 flex items-center justify-center font-mono text-[10px] font-bold">2</span>
            <h3 className="text-xs font-bold text-[#E4E7EB] uppercase">Serviço Systemd para Execução Contínua 24/7 (Auto-Restart)</h3>
          </div>
          <button
            onClick={() => handleCopy(`sudo tee /etc/systemd/system/fabrica-dados.service > /dev/null <<EOF
[Unit]
Description=Fabrica de Dados B2B - Pipeline 24/7
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/fabrica_dados_b2b
ExecStart=/bin/bash /home/$USER/fabrica_dados_b2b/run_pipeline_24_7.sh
Restart=always
RestartSec=10
Environment="GEMINI_API_KEY=sua_chave_aqui"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable fabrica-dados
sudo systemctl start fabrica-dados`, "sec2")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#00FF9C] border border-[#00FF9C]/40 text-[10px] font-mono transition-colors cursor-pointer"
          >
            {copiedSection === "sec2" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSection === "sec2" ? "COPIADO!" : "COPIAR SERVICE"}</span>
          </button>
        </div>

        <div className="p-3 bg-[#0A0B0E] rounded-[2px] border border-[#22262E] font-mono text-xs text-[#E4E7EB] overflow-x-auto">
          <pre><code>{`# Criar arquivo de serviço daemon no Linux
sudo tee /etc/systemd/system/fabrica-dados.service > /dev/null <<EOF
[Unit]
Description=Fabrica de Dados B2B - Pipeline 24/7
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/fabrica_dados_b2b
ExecStart=/bin/bash /home/$USER/fabrica_dados_b2b/run_pipeline_24_7.sh
Restart=always
RestartSec=10
Environment="GEMINI_API_KEY=sua_chave_aqui"

[Install]
WantedBy=multi-user.target
EOF

# Ativar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable fabrica-dados
sudo systemctl start fabrica-dados

# Acompanhar logs em tempo real
journalctl -u fabrica-dados -f`}</code></pre>
        </div>
      </div>

      {/* Step 3: Best Practices for 24/7 High-Volume Scraping */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <div className="tech-card p-3 border-[#22262E] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#00FF9C] text-xs font-bold uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>Anti-Detecção & Delays</span>
          </div>
          <p className="text-[11px] text-[#717681] leading-relaxed">
            Mantenha delays de <strong className="text-[#E4E7EB]">1.2s a 2.0s</strong> entre rolagens. O Firefox no Playwright mantém menor taxa de bloqueio e menor consumo de heap.
          </p>
        </div>

        <div className="tech-card p-3 border-[#22262E] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#88C0D0] text-xs font-bold uppercase">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Gestão de Memória</span>
          </div>
          <p className="text-[11px] text-[#717681] leading-relaxed">
            Em execuções ininterruptas, execute um comando <code className="text-[#00FF9C] bg-[#0A0B0E] px-1 py-0.5 rounded-[2px]">pkill -f firefox</code> entre grandes lotes para liberar memória RAM.
          </p>
        </div>

        <div className="tech-card p-3 border-[#22262E] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#E4E7EB] text-xs font-bold uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Concorrência Massiva</span>
          </div>
          <p className="text-[11px] text-[#717681] leading-relaxed">
            Com seu processador Xeon e RTX 4060, a Etapa 2 roda perfeitamente com <strong className="text-[#00FF9C]">8 a 16 workers paralelos</strong> sem sobrecarga de CPU.
          </p>
        </div>

      </div>

    </div>
  );
};

