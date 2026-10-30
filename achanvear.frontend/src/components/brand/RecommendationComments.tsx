"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";

const comments = [
  { name: "Valeria", role: "Diseño", text: "Recomendaría Achanvear por reunir el portafolio y los servicios en un mismo espacio. Es una buena forma de mostrar lo que sabes hacer." },
  { name: "Diego", role: "Desarrollo web", text: "Me gusta la idea de conectar con empresas que buscan habilidades concretas. Recomendaría explorar las oportunidades de Achanvear." },
  { name: "Camila", role: "Marketing", text: "Tener un lugar para presentar mis servicios y conversar sobre cada proyecto me parece una propuesta muy útil." },
  { name: "Javier", role: "Emprendimiento", text: "Recomendaría Achanvear a quienes necesitan encontrar talento y conocer su trabajo antes de iniciar una conversación." },
  { name: "Lucía", role: "Primer empleo", text: "Me parece valioso contar con un espacio donde presentar mis habilidades mientras doy mis primeros pasos profesionales." },
  { name: "Renato", role: "Trabajo independiente", text: "Recomendaría una plataforma que permite acordar entregables y revisar las condiciones antes de comenzar un proyecto." },
  { name: "Andrea", role: "Gestión de talento", text: "Poder conocer perfiles, experiencia y portafolios desde un mismo lugar facilita el primer acercamiento con un profesional." },
  { name: "Sebastián", role: "Producción audiovisual", text: "Achanvear me parece una propuesta interesante para dar visibilidad al trabajo creativo y descubrir posibles colaboraciones." },
  { name: "Mariana", role: "Administración", text: "Recomendaría revisar Achanvear para explorar servicios profesionales y comparar qué puede aportar cada persona." },
  { name: "Gabriel", role: "Consultoría", text: "Me gusta que la propuesta acerque a quienes ofrecen una solución con quienes necesitan resolver un reto. Recomendaría conocerla." },
];

const AVATAR_COLORS = [
  ["#d5f3eb", "#c98562", "#32211c", "#12796c"],
  ["#dceafb", "#dfaa83", "#292524", "#2563eb"],
  ["#f5e1ee", "#b97958", "#432b22", "#985782"],
  ["#fce8ce", "#d99d74", "#302521", "#b76b31"],
  ["#e4e1fa", "#efbb96", "#533725", "#7761b3"],
  ["#dcefe8", "#9e6246", "#241c1a", "#32735d"],
  ["#ffe3df", "#d39772", "#39241f", "#b65c60"],
  ["#dfebf5", "#ba7b56", "#282322", "#416b8b"],
  ["#eee7d9", "#e1ac85", "#674634", "#8b7855"],
  ["#d9edf0", "#aa6d4b", "#2c201d", "#367c87"],
];

function FaceAvatar({ index }: { index: number }) {
  const [background, skin, hair, shirt] = AVATAR_COLORS[index];
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-sm sm:h-24 sm:w-24">
      <rect width="96" height="96" fill={background} />
      {index % 2 === 0 && <path d="M23 59V38C23 5 73 5 73 38V69H23Z" fill={hair} />}
      <path d="M12 96C14 63 82 63 84 96Z" fill={shirt} />
      <path d="M40 58H56V75Q48 83 40 75Z" fill={skin} />
      <ellipse cx="48" cy="41" rx="22" ry="27" fill={skin} />
      <path d={index % 3 === 0 ? "M26 38C17 9 66 0 71 34C55 32 45 23 43 21C39 32 32 34 26 38Z" : "M26 36C23 6 73 6 70 36L62 27C48 34 39 23 34 27Z"} fill={hair} />
      <path d="M34 40L40 39M56 39L62 40" stroke={hair} strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="45" r="1.8" fill="#292524" />
      <circle cx="58" cy="45" r="1.8" fill="#292524" />
      <path d="M48 46L46 53H50" fill="none" stroke="#754b3b" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M40 58Q48 67 56 58Z" fill="white" />
      {index % 4 === 1 && <g fill="none" stroke={hair} strokeWidth="1.5"><rect x="29" y="40" width="16" height="12" rx="4" /><rect x="51" y="40" width="16" height="12" rx="4" /><path d="M45 44H51" /></g>}
    </svg>
  );
}

export function RecommendationComments() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const rotating = !paused && !hovering && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setActive(current => (current + 1) % comments.length);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [rotating, active]);

  const move = (direction: number) => setActive(current => (current + direction + comments.length) % comments.length);

  return (
    <section
      className="mt-10"
      aria-labelledby="recommendation-comments-title"
      aria-roledescription="carrusel"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 id="recommendation-comments-title" className="text-xl font-semibold tracking-tight text-[#102c46]">
          Ideas que conectan con Achanvear
        </h3>
        <button type="button" onClick={() => setPaused(current => !current)} aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          {paused ? <Play aria-hidden="true" className="h-3.5 w-3.5" /> : <Pause aria-hidden="true" className="h-3.5 w-3.5" />}
          {paused ? "Reanudar" : "Pausar"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-500">
        Comentarios ilustrativos: los nombres y las opiniones son ejemplos, no testimonios de usuarios reales.
      </p>
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-live={rotating ? "off" : "polite"}>
        <div className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none" style={{ transform: `translateX(-${active * 100}%)` }}>
          {comments.map(({ name, role, text }, index) => (
            <figure key={name} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de ${comments.length}`} aria-hidden={index !== active} className="m-0 flex w-full shrink-0 flex-col items-center gap-6 px-6 py-9 text-center sm:flex-row sm:items-start sm:px-10 sm:py-12 sm:text-left">
              <FaceAvatar index={index} />
              <div className="max-w-3xl">
                <Quote aria-hidden="true" className="mx-auto mb-4 h-7 w-7 text-teal-600 sm:mx-0" />
                <blockquote className="text-base leading-8 text-slate-600 sm:text-lg">{text}</blockquote>
                <figcaption className="mt-5">
                  <span className="block text-base font-semibold text-[#102c46]">{name}</span>
                  <span className="mt-1 block text-sm text-slate-500">{role}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => move(-1)} aria-label="Comentario anterior" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-teal-600"><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
        <div className="flex flex-wrap justify-center">
          {comments.map(({ name }, index) => <button key={name} type="button" aria-label={`Ver comentario de ${name}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} className="flex h-8 w-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-teal-600"><span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${index === active ? "w-5 bg-teal-600" : "w-2 bg-slate-300"}`} /></button>)}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Comentario siguiente" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-teal-600"><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
      </div>
    </section>
  );
}
