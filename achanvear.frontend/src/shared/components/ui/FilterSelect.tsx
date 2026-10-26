"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string; color?: string };

export function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  const choose = (option: Option) => {
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };
  const show = () => {
    setActive(Math.max(0, options.findIndex(option => option.value === value)));
    setOpen(true);
  };

  return (
    <div ref={root} className={`relative w-full md:w-52 md:shrink-0 ${open ? "z-30" : ""}`}>
      <button ref={trigger} type="button" aria-label={`${label}: ${selected.label}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => open ? setOpen(false) : show()}
        onKeyDown={event => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); show(); }
        }}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm font-medium text-[#1B3A6B] shadow-sm transition hover:border-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${open ? "border-teal-400 ring-4 ring-teal-50" : "border-slate-200"}`}>
        <span className="flex min-w-0 items-center gap-2.5">{selected.color && <span className={`h-2 w-2 shrink-0 rounded-full ${selected.color}`} />}<span className="truncate">{selected.label}</span></span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-teal-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div ref={list} id={id} role="listbox" aria-label={label} tabIndex={-1} aria-activedescendant={`${id}-${active}`}
        onKeyDown={event => {
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
          else if (event.key === "Tab") { setOpen(false); trigger.current?.focus(); }
          else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            setActive(index => event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
          } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(options[active]); }
          else if (event.key.length === 1) {
            const index = options.findIndex(option => option.label.toLocaleLowerCase("es").startsWith(event.key.toLocaleLowerCase("es")));
            if (index >= 0) setActive(index);
          }
        }}
        className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.14)] outline-none">
        {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-selected={value === option.value}
          onPointerMove={() => setActive(index)} onClick={() => choose(option)}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${active === index ? "bg-teal-50 text-teal-900" : "text-slate-600"} ${value === option.value ? "font-semibold" : "font-normal"}`}>
          <span className="flex items-center gap-2.5">{option.color && <span className={`h-2 w-2 shrink-0 rounded-full ${option.color}`} />}{option.label}</span>
          {value === option.value && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
        </div>)}
      </div>}
    </div>
  );
}
