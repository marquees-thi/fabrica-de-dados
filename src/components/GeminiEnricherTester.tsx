import React, { useState, useEffect } from "react";
import { CompanyLead, IcebreakerResult } from "../types";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Mail, 
  Target, 
  ArrowRight, 
  Loader2, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Building,
  Phone,
  Globe
} from "lucide-react";

interface GeminiEnricherTesterProps {
  prefilledCompany?: CompanyLead | null;
}

export const GeminiEnricherTester: React.FC<GeminiEnricherTesterProps> = ({ prefilledCompany }) => {
  const [companyName, setCompanyName] = useState("Agência Vanguarda Digital");
  const [category, setCategory] = useState("Agência de Marketing & Tráfego");
  const [address, setAddress] = useState("Av. Paulista, 1000 - Bela Vista, São Paulo - SP");
  const [website, setWebsite] = useState("https://vanguardadigital.com.br");
  const [phone, setPhone] = useState("+55 11 98765-4321");
  const [rating, setRating] = useState("4.9 estrelas (48 avaliações no Google)");
  const [sellerProduct, setSellerProduct] = useState("Serviços de Marketing Digital, Tráfego Pago e Otimização Comercial");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IcebreakerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (prefilledCompany) {
      setCompanyName(prefilledCompany.name || "");
      setCategory(prefilledCompany.category || "Empresa Local");
      setAddress(prefilledCompany.address || prefilledCompany.suburb || "São Paulo, SP");
      setWebsite(prefilledCompany.website || "");
      setPhone(prefilledCompany.phone || "");
      setRating(prefilledCompany.rating ? `${prefilledCompany.rating} estrelas (${prefilledCompany.reviewsCount || 0} avaliações)` : "Perfil novo em expansão");
    }
  }, [prefilledCompany]);

  const handleGenerateIcebreaker = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/icebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: companyName,
            category,
            address,
            website,
            phone,
            rating,
          },
          sellerProduct,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao gerar enriquecimento com IA");
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao conectar com a API de IA.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, type: "wa" | "email") => {
    navigator.clipboard.writeText(text);
    if (type === "wa") {
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const cleanPhone = phone.replace(/\D/g, "");
  const waDirectUrl = cleanPhone && result?.whatsappMessage 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(result.whatsappMessage)}`
    : "";

  return (
    <div className="space-y-5 font-mono">
      
      {/* Header Banner */}
      <div className="bg-[#14161B] border border-[#22262E] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00FF9C]" />
            <h2 className="text-base font-bold text-[#E4E7EB] uppercase tracking-wide">
              Motor de Enriquecimento & Quebra-Gelo B2B (Gemini AI Engine)
            </h2>
          </div>
          <p className="text-xs text-[#A0A6B1] font-sans">
            Transforme listas de empresas brutas em mensagens comerciais hiper-personalizadas de alta resposta para WhatsApp e Cold Email.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 px-2 py-1 uppercase font-bold">
            ⚡ ALTA TAXA DE CONVERSÃO // ZERO BLOQUEIO
          </span>
        </div>
      </div>

      {/* Main Grid: Inputs + Output Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Target Company & Offer Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-2 text-xs">
            <span className="text-[#00FF9C] font-bold">DADOS DO PROSPECT (LEAD):</span>
            {prefilledCompany && (
              <span className="text-[10px] text-[#717681] bg-[#0A0B0E] px-2 py-0.5 border border-[#22262E]">
                Importado do Garimpo
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#717681] block mb-1">NOME DA EMPRESA:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#717681] block mb-1">NICHO / CATEGORIA:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="text-[#717681] block mb-1">TELEFONE / WHATSAPP:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[#717681] block mb-1">CIDADE / ENDEREÇO:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-[#717681] block mb-1">WEBSITE ATUAL:</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-[#717681] block mb-1">REPUTAÇÃO / GOOGLE MAPS:</label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono"
              />
            </div>

            <div className="pt-2 border-t border-[#22262E]">
              <label className="text-[#00FF9C] font-bold block mb-1">O QUE SUA EMPRESA ESTÁ VENDENDO (OFERTA):</label>
              <textarea
                rows={2}
                value={sellerProduct}
                onChange={(e) => setSellerProduct(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-[#E4E7EB] focus:border-[#00FF9C] outline-hidden font-mono text-xs"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerateIcebreaker}
              disabled={loading}
              className="w-full bg-[#00FF9C] text-[#0A0B0E] font-bold py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-[#00FF9C]/90 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,156,0.25)] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSANDO COM IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GERAR ABORDAGEM PERSONALIZADA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              
              {/* Telemetry / Model Badge */}
              <div className="bg-[#14161B] border border-[#22262E] p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00FF9C]" />
                  <span className="text-[#717681]">MOTOR UTILIZADO:</span>
                  <span className="text-[#00FF9C] font-bold">
                    {result.modelUsed || "gemini-3.7-flash"}
                  </span>
                </div>
                <span className="text-[10px] text-[#717681]">
                  ÂNGULO: {result.recommendedAngle || "Crescimento Comercial"}
                </span>
              </div>

              {/* WhatsApp Message Card */}
              <div className="bg-[#14161B] border border-[#00FF9C]/30 p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#22262E] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00FF9C]">
                    <MessageSquare className="w-4 h-4" />
                    <span>ABORDAGEM PARA WHATSAPP (1-CLICK DIRECT):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(result.whatsappMessage, "wa")}
                      className="px-2.5 py-1 bg-[#0A0B0E] border border-[#22262E] hover:border-[#00FF9C] text-xs text-[#E4E7EB] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedWhatsapp ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWhatsapp ? "COPIADO!" : "COPIAR"}</span>
                    </button>

                    {waDirectUrl && (
                      <a
                        href={waDirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#00FF9C] text-[#0A0B0E] text-xs font-bold flex items-center gap-1 hover:bg-[#00FF9C]/90 transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>ABRIR WHATSAPP</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-[#0A0B0E] border border-[#22262E] p-3.5 text-xs text-[#E4E7EB] font-mono whitespace-pre-wrap leading-relaxed">
                  {result.whatsappMessage}
                </div>
              </div>

              {/* Cold Email Card */}
              <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#22262E] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E4E7EB]">
                    <Mail className="w-4 h-4 text-[#88C0D0]" />
                    <span>ABORDAGEM COLD EMAIL:</span>
                  </div>
                  <button
                    onClick={() => copyText(`${result.coldEmail?.subject}\n\n${result.coldEmail?.body}`, "email")}
                    className="px-2.5 py-1 bg-[#0A0B0E] border border-[#22262E] hover:border-[#00FF9C] text-xs text-[#E4E7EB] flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-[#00FF9C]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? "COPIADO!" : "COPIAR EMAIL"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#0A0B0E] border border-[#22262E] p-2.5">
                    <span className="text-[#717681] block text-[10px]">ASSUNTO:</span>
                    <span className="font-bold text-[#E4E7EB]">{result.coldEmail?.subject}</span>
                  </div>

                  <div className="bg-[#0A0B0E] border border-[#22262E] p-3.5 text-[#A0A6B1] whitespace-pre-wrap leading-relaxed">
                    {result.coldEmail?.body}
                  </div>
                </div>
              </div>

              {/* Personalized Hook Card */}
              <div className="bg-[#0A0B0E] border border-[#22262E] p-3 text-xs space-y-1">
                <span className="text-[#00FF9C] text-[10px] font-bold block">🎯 GANCHO PERSONALIZADO IDENTIFICADO:</span>
                <p className="text-[#A0A6B1] text-xs">{result.personalizedHook}</p>
              </div>

            </div>
          ) : (
            <div className="bg-[#14161B] border border-[#22262E] p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-[#717681] mx-auto opacity-50" />
              <h3 className="font-mono text-sm font-bold text-[#E4E7EB]">Pronto para gerar prospecções</h3>
              <p className="text-xs text-[#717681] font-sans max-w-sm mx-auto">
                Preencha os dados ao lado ou selecione um lead da <strong>Central de Garimpo</strong> para gerar scripts de WhatsApp e e-mail sob medida.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
