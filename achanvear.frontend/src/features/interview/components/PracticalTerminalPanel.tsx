"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Play, Terminal, TextCursorInput } from "lucide-react";

type Props = {
  output: string;
  input: string;
  onInputChange: (value: string) => void;
  onRun: () => void;
  previewHtml?: string;
  success?: boolean;
  stdout?: string;
  stderr?: string;
};

export function PracticalTerminalPanel({ output, input, onInputChange, onRun, previewHtml, success, stdout, stderr }: Props) {
  const [height, setHeight] = useState(220);
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [tab, setTab] = useState<"terminal" | "preview">("terminal");
  const drag = useRef<{ y: number; height: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (output) setCollapsed(false);
  }, [output]);

  useEffect(() => {
    if (content.current) content.current.scrollTop = content.current.scrollHeight;
  }, [output, collapsed, maximized, height, showInput]);

  function resize(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const maximum = Math.max(120, (panel.current?.parentElement?.clientHeight ?? 600) - 160);
    setHeight(Math.max(120, Math.min(maximum, drag.current.height + drag.current.y - event.clientY)));
  }

  function stopResize(event: PointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div ref={panel} className="relative flex shrink-0 flex-col border-t border-[#353535] bg-[#181818] text-[#cccccc]"
      style={{ height: collapsed ? 36 : maximized ? "70%" : height, maxHeight: "75%" }}>
      {!collapsed && <div role="separator" aria-label="Ajustar altura de la terminal" aria-orientation="horizontal"
        aria-valuenow={height} tabIndex={0}
        className="absolute -top-1 z-10 h-2 w-full cursor-row-resize touch-none hover:bg-[#007acc]/50 focus:bg-[#007acc]/50 focus:outline-none"
        onPointerDown={event => {
          setMaximized(false);
          drag.current = { y: event.clientY, height: panel.current?.clientHeight ?? height };
          event.currentTarget.setPointerCapture(event.pointerId);
        }} onPointerMove={resize} onPointerUp={stopResize} onPointerCancel={stopResize}
        onKeyDown={event => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            setMaximized(false);
            const maximum = Math.max(120, (panel.current?.parentElement?.clientHeight ?? 600) - 160);
            setHeight(value => Math.max(120, Math.min(maximum, value + (event.key === "ArrowUp" ? 24 : -24))));
          }
        }} />}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/5 px-3">
        <div role="tablist" aria-label="Panel de ejecucion" className="flex h-full items-center gap-5 text-[11px] uppercase tracking-wide">
          <button role="tab" aria-selected={tab === "terminal"} aria-controls="practical-terminal-content"
            onClick={() => { setTab("terminal"); setCollapsed(false); }}
            className={`flex h-full items-center gap-2 border-b ${tab === "terminal" ? "border-[#007acc] text-white" : "border-transparent text-[#969696]"}`}>
            <Terminal size={13} /> Terminal
          </button>
          {previewHtml && <button role="tab" aria-selected={tab === "preview"} aria-controls="practical-terminal-content"
            className={`h-full border-b ${tab === "preview" ? "border-[#007acc] text-white" : "border-transparent"}`}
            onClick={() => { setTab("preview"); setCollapsed(false); }}>Vista previa</button>}
        </div>
        <div className="flex items-center gap-1">
          {success !== undefined && <span className={`mr-2 text-[10px] ${success ? "text-emerald-400" : "text-red-400"}`}>{success ? "Finalizado" : "Error"}</span>}
          <button title="Entrada del programa" aria-label="Entrada del programa" aria-pressed={showInput}
            className="rounded p-1.5 hover:bg-white/10" onClick={() => { setShowInput(value => !value); setTab("terminal"); setCollapsed(false); }}><TextCursorInput size={14} /></button>
          <button title="Ejecutar codigo" aria-label="Ejecutar codigo desde terminal" className="rounded p-1.5 text-emerald-400 hover:bg-white/10" onClick={onRun}><Play size={14} /></button>
          <button aria-label={maximized ? "Restaurar panel" : "Maximizar panel"} className="rounded p-1.5 hover:bg-white/10"
            onClick={() => { setMaximized(value => !value); setCollapsed(false); }}>{maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
          <button aria-label={collapsed ? "Mostrar panel" : "Ocultar panel"} className="rounded p-1.5 hover:bg-white/10"
            onClick={() => setCollapsed(value => !value)}>{collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
        </div>
      </div>
      {!collapsed && <div id="practical-terminal-content" role="tabpanel" className="flex min-h-0 flex-1 flex-col">
        {tab === "preview" && previewHtml ? <iframe title="Vista previa" sandbox="allow-scripts" srcDoc={previewHtml} className="min-h-0 flex-1 bg-white" /> : <>
          <pre ref={content} aria-label="Salida de terminal" className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-5 selection:bg-[#264f78]">
            {output.startsWith("Ejecucion correcta") || output.startsWith("Ejecucion con errores")
              ? [stdout, stderr].filter(Boolean).join("\n") || "El programa termino sin salida."
              : output || "Listo para ejecutar. La salida del programa aparecera aqui."}
          </pre>
          {showInput && <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <label className="mb-1 block text-[10px] text-[#969696]" htmlFor="practical-terminal-input">Entrada enviada al ejecutar · Ctrl+Enter para ejecutar</label>
            <div className="flex items-start gap-2 font-mono text-xs">
              <span className="pt-1 text-[#569cd6]">❯</span>
              <textarea id="practical-terminal-input" aria-label="Entrada de terminal" rows={2} value={input}
                onChange={event => onInputChange(event.target.value)}
                onKeyDown={event => { if (event.key === "Enter" && event.ctrlKey) { event.preventDefault(); onRun(); } }}
                placeholder="Escribe los datos que lee tu programa" className="w-full resize-none bg-transparent py-1 text-[#d4d4d4] outline-none placeholder:text-[#6a6a6a]" />
            </div>
          </div>}
        </>}
      </div>}
    </div>
  );
}
