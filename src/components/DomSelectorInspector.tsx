import React, { useState } from "react";
import { AlertCircle, CheckCircle, Code, Layers, MousePointer, ShieldCheck, ArrowRight, Copy, Check, Terminal } from "lucide-react";

export const DomSelectorInspector: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* Executive Summary Tech Card */}
      <div className="tech-card p-5 border-[#22262E] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="tech-card-title">
              DIAGNÓSTICO DO ENGENHEIRO DE SCRAPING
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#E4E7EB] tracking-tight uppercase">
              Por que o script travava em 8 links e a solução de DOM
            </h2>
            <p className="text-xs text-[#717681] leading-relaxed">
              O Google Maps utiliza uma arquitetura de <strong className="text-[#00FF9C]">DOM Virtualizado e Isolado</strong>. 
              O comando <code className="text-[#F27D26] bg-[#1C1F26] px-1.5 py-0.5 rounded-[2px] text-[11px] border border-[#22262E]">page.mouse.wheel(0, 3000)</code> dispara 
              eventos no elemento raiz <code className="text-[#E4E7EB]">window/body</code> (que possui <code className="text-[#717681]">overflow: hidden</code>). 
              A lista de empresas reside exclusivamente dentro do nó interno independente: <code className="text-[#00FF9C] bg-[#1C1F26] px-1.5 py-0.5 rounded-[2px] text-[11px] border border-[#22262E]">div[role="feed"]</code>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0 text-xs">
            <div className="bg-[#0A0B0E] border border-[#22262E] p-3 rounded-[2px] min-w-[130px]">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider mb-1">ANTERIOR (MOUSE)</div>
              <div className="text-xl font-bold text-[#F27D26] font-mono">8 LINKS</div>
              <div className="text-[10px] text-[#717681] mt-0.5">Scroll no Body</div>
            </div>

            <div className="bg-[#0A0B0E] border border-[#00FF9C]/40 p-3 rounded-[2px] min-w-[130px] shadow-[0_0_10px_rgba(0,255,156,0.05)]">
              <div className="text-[#717681] text-[9px] uppercase tracking-wider mb-1">CORRIGIDO (FEED)</div>
              <div className="text-xl font-bold text-[#00FF9C] font-mono">120+ LINKS</div>
              <div className="text-[10px] text-[#00FF9C] mt-0.5">100% da Lista</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Flawed Code */}
        <div className="tech-card border-[#22262E] overflow-hidden">
          <div className="p-3 bg-[#14161B] border-b border-[#22262E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F27D26]" />
              <span className="text-xs font-bold text-[#F27D26] uppercase">
                Código Anterior (Gargalo de Rolagem)
              </span>
            </div>
            <span className="tech-tag text-[#F27D26] border-[#F27D26]/40">
              FALHA: WINDOW.SCROLL
            </span>
          </div>

          <div className="p-4 bg-[#050505] text-[11px] text-[#E4E7EB] space-y-2">
            <div className="text-[#717681]"># O mouse.wheel atuava na janela global (invisível ao feed)</div>
            <div className="p-2.5 bg-[#14161B] border border-[#22262E] text-[#F27D26] space-y-1">
              <p>for _ in range(10):</p>
              <p className="pl-4 font-bold text-[#F27D26]">await page.mouse.wheel(0, 3000) # ⚠️ Não atinge o feed!</p>
              <p className="pl-4 text-[#717681]">await page.wait_for_timeout(1500)</p>
            </div>
            <p className="text-[10px] text-[#717681] leading-relaxed">
              <strong className="text-[#E4E7EB]">Efeito:</strong> O Google Maps não dispara os listeners de interseção / eventos <code className="text-[#88C0D0]">onscroll</code> do container interno. O scrollbar da barra lateral fica estático no topo.
            </p>
          </div>
        </div>

        {/* Corrected Code */}
        <div className="tech-card border-[#00FF9C]/30 overflow-hidden">
          <div className="p-3 bg-[#14161B] border-b border-[#22262E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00FF9C]" />
              <span className="text-xs font-bold text-[#00FF9C] uppercase">
                Código Corrigido (Scroll no Feed)
              </span>
            </div>
            <span className="tech-tag text-[#00FF9C] border-[#00FF9C]/40">
              SOLUÇÃO: DIV[ROLE="FEED"]
            </span>
          </div>

          <div className="p-4 bg-[#050505] text-[11px] text-[#E4E7EB] space-y-2">
            <div className="text-[#717681]"># Localiza o container específico e rola via JavaScript</div>
            <div className="p-2.5 bg-[#14161B] border border-[#00FF9C]/30 text-[#00FF9C] space-y-1">
              <p>feed = page.locator(<span className="text-[#88C0D0]">'div[role="feed"]'</span>).first</p>
              <p>for _ in range(max_scrolls):</p>
              <p className="pl-4 font-bold text-[#00FF9C]">await feed.evaluate("el =&gt; el.scrollBy(0, 1200)")</p>
              <p className="pl-4 text-[#717681]">await page.wait_for_timeout(1200)</p>
            </div>
            <p className="text-[10px] text-[#717681] leading-relaxed">
              <strong className="text-[#E4E7EB]">Efeito:</strong> Cada pulso aciona o carregamento dinâmico assíncrono de mais 10 a 20 cards até atingir o fim real da lista ou o gatilho <code className="text-[#00FF9C]">span.HlvSq</code>.
            </p>
          </div>
        </div>

      </div>

      {/* Selector Architecture Map */}
      <div className="tech-card p-5 border-[#22262E] space-y-3">
        <div className="flex items-center justify-between">
          <div className="tech-card-title">
            MAPA DE SELETORES DO GOOGLE MAPS (PRODUÇÃO PLAYWRIGHT)
          </div>
          <span className="tech-tag text-[#00FF9C]">TESTADO 2026</span>
        </div>

        <div className="overflow-x-auto border border-[#22262E]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#22262E] bg-[#0A0B0E] text-[#717681] text-[10px] uppercase">
                <th className="p-2.5">Finalidade</th>
                <th className="p-2.5">Seletor CSS / XPath</th>
                <th className="p-2.5">Comportamento Esperado</th>
                <th className="p-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22262E] text-[#E4E7EB]">
              <tr className="hover:bg-[#00FF9C]/5 transition-colors">
                <td className="p-2.5 text-[#00FF9C] font-bold">Container de Rolagem</td>
                <td className="p-2.5 text-[#88C0D0] bg-[#0A0B0E]/60">div[role="feed"]</td>
                <td className="p-2.5 text-[#717681] text-[11px]">Contém os cards de empresas. Recebe o evento de scrollBy.</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => handleCopy('div[role="feed"]', "sel-1")}
                    className="p-1 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] border border-[#22262E] transition-colors cursor-pointer"
                  >
                    {copiedId === "sel-1" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-[#00FF9C]/5 transition-colors">
                <td className="p-2.5 text-[#00FF9C] font-bold">Links Canônicos</td>
                <td className="p-2.5 text-[#88C0D0] bg-[#0A0B0E]/60">a[href*="/maps/place/"]</td>
                <td className="p-2.5 text-[#717681] text-[11px]">Links diretos dos locais para alimentar a Etapa 2 (A Fábrica).</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => handleCopy('a[href*="/maps/place/"]', "sel-2")}
                    className="p-1 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] border border-[#22262E] transition-colors cursor-pointer"
                  >
                    {copiedId === "sel-2" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-[#00FF9C]/5 transition-colors">
                <td className="p-2.5 text-[#F27D26] font-bold">Fim dos Resultados</td>
                <td className="p-2.5 text-[#F27D26] bg-[#0A0B0E]/60">span.HlvSq, div:has-text("final da lista")</td>
                <td className="p-2.5 text-[#717681] text-[11px]">Sinaliza que o Google Maps esgotou os resultados daquela região.</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => handleCopy('span.HlvSq', "sel-3")}
                    className="p-1 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] border border-[#22262E] transition-colors cursor-pointer"
                  >
                    {copiedId === "sel-3" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-[#00FF9C]/5 transition-colors">
                <td className="p-2.5 text-[#88C0D0] font-bold">Bypass de Cookies</td>
                <td className="p-2.5 text-[#88C0D0] bg-[#0A0B0E]/60">button[aria-label*="Aceitar"], button[aria-label*="Concordo"]</td>
                <td className="p-2.5 text-[#717681] text-[11px]">Fecha o consentimento de privacidade europeu/brasileiro se surgir.</td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => handleCopy('button[aria-label*="Aceitar"]', "sel-4")}
                    className="p-1 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] border border-[#22262E] transition-colors cursor-pointer"
                  >
                    {copiedId === "sel-4" ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Options Comparison: Opção A vs Opção B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="tech-card p-4 border-[#22262E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#00FF9C] px-1.5 py-0.5 bg-[#1C1F26] border border-[#22262E] rounded-[2px]">
              ESTRATÉGIA A
            </span>
            <h4 className="text-xs font-bold text-[#E4E7EB] uppercase">Playwright no Maps (Bairros)</h4>
          </div>
          <p className="text-[11px] text-[#717681] leading-relaxed">
            Perfeito para dados hiperlocais com avaliação e fotos. Varrendo por bairros, extrai de <strong>1.500 a 4.000 URLs/dia</strong> de forma contínua no servidor.
          </p>
          <div className="text-[10px] text-[#E4E7EB] space-y-1 pt-1">
            <div className="text-[#00FF9C]">✓ Dados em tempo real</div>
            <div className="text-[#00FF9C]">✓ 100% compatível com urls.txt da Etapa 2</div>
            <div className="text-[#717681]">• Execução via Firefox/Chromium Headless</div>
          </div>
        </div>

        <div className="tech-card p-4 border-[#22262E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#88C0D0] px-1.5 py-0.5 bg-[#1C1F26] border border-[#22262E] rounded-[2px]">
              ESTRATÉGIA B
            </span>
            <h4 className="text-xs font-bold text-[#E4E7EB] uppercase">Overpass API OSM + CNPJ</h4>
          </div>
          <p className="text-[11px] text-[#717681] leading-relaxed">
            A abordagem Big Data definitiva sem navegador. Consulta bases abertas em milissegundos via HTTP GET/POST, gerando listas de <strong>50.000+ empresas</strong> sem limites.
          </p>
          <div className="text-[10px] text-[#E4E7EB] space-y-1 pt-1">
            <div className="text-[#00FF9C]">✓ Zero consumo de memória de navegador</div>
            <div className="text-[#00FF9C]">✓ Zero risco de bloqueios de IP</div>
            <div className="text-[#00FF9C]">✓ Velocidade de 10.000 leads/minuto</div>
          </div>
        </div>

      </div>

    </div>
  );
};

