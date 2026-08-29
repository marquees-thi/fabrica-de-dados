import React, { useState } from "react";
import { PYTHON_SCRIPTS } from "../data/pythonScripts";
import { PythonScript } from "../types";
import { Copy, Check, Download, Play, Terminal, Sliders, FileCode, CheckCircle2 } from "lucide-react";

export const ScriptViewer: React.FC = () => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>("maps_fix");
  const [copied, setCopied] = useState(false);

  // Customization parameters
  const [customTerm, setCustomTerm] = useState("agencias de marketing em sao paulo");
  const [headlessMode, setHeadlessMode] = useState(false);
  const [maxScrolls, setMaxScrolls] = useState(35);

  const selectedScript = PYTHON_SCRIPTS.find((s) => s.id === selectedScriptId) || PYTHON_SCRIPTS[0];

  // Apply customizations dynamically to the maps_fix code if selected
  const getRenderedCode = (script: PythonScript) => {
    if (script.id === "maps_fix") {
      let code = script.code;
      code = code.replace(
        'termo = "agencias de marketing em sao paulo"',
        `termo = "${customTerm}"`
      );
      code = code.replace(
        "headless=False",
        `headless=${headlessMode ? "True" : "False"}`
      );
      code = code.replace(
        "max_scroll_attempts: int = 40",
        `max_scroll_attempts: int = ${maxScrolls}`
      );
      return code;
    }
    return script.code;
  };

  const currentCode = getRenderedCode(selectedScript);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedScript.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Script Selector Tabs - Technical Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {PYTHON_SCRIPTS.map((script) => {
          const isSelected = script.id === selectedScriptId;
          return (
            <button
              key={script.id}
              id={`select-script-${script.id}`}
              onClick={() => setSelectedScriptId(script.id)}
              className={`p-3 rounded-[2px] text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#14161B] border-[#00FF9C] text-[#E4E7EB] shadow-[0_0_10px_rgba(0,255,156,0.1)]"
                  : "bg-[#0A0B0E] border-[#22262E] text-[#717681] hover:text-[#E4E7EB] hover:bg-[#14161B]"
              }`}
            >
              <div className="space-y-1">
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] inline-block ${
                    isSelected
                      ? "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/40"
                      : "bg-[#1C1F26] text-[#717681] border border-[#22262E]"
                  }`}
                >
                  {script.badge}
                </span>
                <p className="text-[11px] font-bold leading-snug line-clamp-1 text-[#E4E7EB]">{script.title}</p>
              </div>
              <span className="text-[10px] font-mono text-[#88C0D0] mt-2 block truncate">
                {script.fileName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Script Header & Controls */}
      <div className="tech-card p-4 border-[#22262E] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-sm font-bold text-[#00FF9C] uppercase font-mono">{selectedScript.fileName}</h3>
              <span className="tech-tag text-[#E4E7EB]">
                {selectedScript.badge}
              </span>
            </div>
            <p className="text-[11px] text-[#717681] mt-1 max-w-3xl leading-relaxed">
              {selectedScript.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#00FF9C] hover:bg-[#00FF9C]/90 text-[#0A0B0E] text-xs font-bold font-mono transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,156,0.2)]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIADO!" : "COPIAR SCRIPT"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1C1F26] hover:bg-[#22262E] text-[#E4E7EB] text-xs font-medium border border-[#22262E] transition-all cursor-pointer font-mono"
            >
              <Download className="w-3.5 h-3.5" />
              <span>BAIXAR .{selectedScript.fileName.endsWith('.sh') ? 'SH' : 'PY'}</span>
            </button>
          </div>
        </div>

        {/* Live Code Customizer (Only for maps_fix) */}
        {selectedScript.id === "maps_fix" && (
          <div className="pt-3 border-t border-[#22262E] grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0A0B0E] p-3 rounded-[2px] border border-[#22262E]">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
                TERMO DE BUSCA INICIAL:
              </label>
              <input
                type="text"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
                className="w-full bg-[#14161B] border border-[#22262E] rounded-[2px] px-2 py-1 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
                placeholder="Ex: clinicas odontologicas em curitiba"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
                MODO DE VISUALIZAÇÃO:
              </label>
              <select
                value={headlessMode ? "true" : "false"}
                onChange={(e) => setHeadlessMode(e.target.value === "true")}
                className="w-full bg-[#14161B] border border-[#22262E] rounded-[2px] px-2 py-1 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
              >
                <option value="false">headless=False (Depuração Visual)</option>
                <option value="true">headless=True (Servidor 24/7)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-[#717681] block mb-1">
                MÁXIMO DE CICLOS DE SCROLL:
              </label>
              <input
                type="number"
                value={maxScrolls}
                onChange={(e) => setMaxScrolls(Number(e.target.value))}
                min={10}
                max={100}
                className="w-full bg-[#14161B] border border-[#22262E] rounded-[2px] px-2 py-1 text-xs text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

      </div>

      {/* Code Editor Preview */}
      <div className="tech-card border-[#22262E] overflow-hidden">
        <div className="p-2.5 bg-[#14161B] border-b border-[#22262E] flex items-center justify-between text-[11px] text-[#717681]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF9C] inline-block"></span>
            <span className="text-[#E4E7EB] font-bold">
              {selectedScript.fileName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span>UTF-8</span>
            <span>|</span>
            <span className="text-[#88C0D0]">{selectedScript.fileName.endsWith('.sh') ? 'BASH SCRIPT' : 'PYTHON 3.10+ ASYNC'}</span>
          </div>
        </div>

        <div className="p-4 bg-[#050505] overflow-x-auto max-h-[550px]">
          <pre className="font-mono text-xs text-[#E4E7EB] leading-relaxed">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};

