import Link from "next/link";
import { WelcomeBrandMark } from "./WelcomeBrandMark";
import { ArrowUpRight, Fingerprint, MoveUpRight } from "lucide-react";
import { ACADEMIC_CONTACT } from "@/features/compliance/content/academicLegalContent";

export function AboutAchanvear({ full = false }: { full?: boolean }) {
  const Heading = full ? "h1" : "h2";
  return (
    <section id="nosotros" className="relative overflow-hidden bg-[#102c46] text-white">
      <span id="mision" className="absolute top-0 scroll-mt-20" />
      <div className="pointer-events-none absolute -right-32 top-0 h-[36rem] w-[36rem] rounded-full bg-teal-400/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-10 flex items-center justify-between gap-4 border-b border-white/15 pb-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-200">Achanvear / Nuestra forma de ver el trabajo</span>
          <span className="hidden text-xs text-white/45 sm:block">Hecho desde el Perú</span>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Heading className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Hay talento.<br />Falta que <span className="text-teal-300">se encuentre.</span></Heading>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300">Entre alguien que sabe hacer y alguien que necesita resolver, suele haber demasiadas puertas. Achanvear nace para abrir una: un lugar donde mostrar lo que puedes aportar y encontrar con quién hacerlo.</p>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">Nuestro nombre tiene intención. Suena a ponerse en movimiento, a buscar una oportunidad y a construirla. Esa es nuestra identidad: <span className="font-medium text-white">menos distancia entre el talento y el trabajo.</span></p>
            <div className="mt-8 flex flex-wrap items-center gap-5"><Link href={full ? "/register" : "/nosotros"} className="inline-flex items-center gap-3 rounded-full bg-teal-300 px-5 py-3 text-sm font-semibold text-[#102c46] transition hover:bg-teal-200">{full ? "Ser parte de Achanvear" : "Conoce lo que estamos construyendo"}<ArrowUpRight className="h-4 w-4" /></Link><span className="text-xs text-white/45">Proyecto académico · En evolución</span></div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.03] sm:min-h-80">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:36px_36px]" />
              <div className="absolute h-48 w-48 rounded-full border border-teal-300/30" /><div className="absolute h-64 w-64 rounded-full border border-white/10" />
              {full ? (<span className="relative text-[9rem] font-bold leading-none tracking-tighter text-white">a<span className="text-teal-300">.</span></span>) : <WelcomeBrandMark />}<MoveUpRight className="absolute right-6 top-6 h-7 w-7 text-teal-300" /><span className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.25em] text-white/45">Del «yo puedo» al «vamos a hacerlo»</span>
            </div>
            <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-300"><Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><p>Construimos una experiencia peruana. La tecnología ayuda a conectar; el criterio y la confianza siguen siendo humanos.</p></div>
          </div>
        </div>
        {full && <div className="mt-16 grid gap-8 border-t border-white/15 pt-9 md:grid-cols-3">{[
          ["Que puedas demostrarlo.", "Un perfil no debería quedarse en una lista de títulos. Buscamos dar espacio a la experiencia, al portafolio y a lo que una persona puede resolver."],
          ["Que el proceso se entienda.", "Una oportunidad merece condiciones claras. La IA puede apoyar una evaluación; no reemplaza la responsabilidad de quien contrata."],
          ["Que la confianza tenga base.", "Pedir un DNI o un RUC exige explicar su uso. Ser un proyecto académico también significa aprender a construir con responsabilidad."],
        ].map(([title, description]) => <div key={title}><h2 className="mt-3 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{description}</p></div>)}</div>}
        {full && <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6"><p className="text-sm text-slate-300">Conversemos sobre lo que estamos construyendo.</p><a href={`mailto:${ACADEMIC_CONTACT}`} className="inline-flex items-center gap-2 break-all text-sm font-medium text-teal-200 hover:text-white">{ACADEMIC_CONTACT}<ArrowUpRight className="h-4 w-4 shrink-0" /></a></div>}
      </div>
    </section>
  );
}
