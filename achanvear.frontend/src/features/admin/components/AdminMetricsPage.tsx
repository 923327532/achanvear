// features/admin/components/AdminMetricsPage.tsx
"use client";

import { useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useAdminMetrics, useAdminUserKpis } from "../hooks/useAdminData";
import type { AdminUserKpis, UserPeriodBucket } from "../types/admin.types";

// ── Periodos disponibles ────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
  { days: 180, label: "180 días" },
  { days: 365, label: "12 meses" },
];

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: "#8B5CF6",
  SUBADMIN: "#6366F1",
  ADMIN: "#3B82F6",
  SUPPORT: "#14B8A6",
  COMPANY: "#F59E0B",
  COMPANY_COLLABORATOR: "#F97316",
  CANDIDATE: "#94A3B8",
  FREELANCER: "#10B981",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981",
  BLOCKED: "#EF4444",
  DISABLED: "#94A3B8",
  PENDING: "#F59E0B",
};

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  SUBADMIN: "Sub Admin",
  ADMIN: "Admin",
  SUPPORT: "Soporte",
  COMPANY: "Empresa",
  COMPANY_COLLABORATOR: "Colaborador",
  CANDIDATE: "Candidato",
  FREELANCER: "Freelancer",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activos",
  BLOCKED: "Bloqueados",
  DISABLED: "Desactivados",
  PENDING: "Pendientes",
};

// ── Utilidades ──────────────────────────────────────────────────────────────

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value);
}

function variationPill(variation: number) {
  const up = variation >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {variation.toFixed(1)}% vs. periodo anterior
    </span>
  );
}

// ── Página principal ────────────────────────────────────────────────────────

export function AdminMetricsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError } = useAdminUserKpis(days);
  const { data: platform } = useAdminMetrics();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Centro de usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Volumen, crecimiento y composición de la base de usuarios con comparación entre periodos.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === opt.days ? "bg-[#1B3A6B] text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid place-items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
        </div>
      )}
      {isError && <p className="text-sm text-red-500">No se pudieron cargar los KPIs de usuarios.</p>}
      {!isLoading && !isError && data && (
        <>
          <MomentumBand kpis={data} />
          <MovementChart
            data={data.usersByPeriod}
            previous={data.previousUsersByPeriod}
            granularity={data.granularity}
          />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RoleDistribution kpis={data} />
            <StatusDistribution kpis={data} />
          </div>
          <OperationalStrip metrics={platform} />
        </>
      )}
    </div>
  );
}
// ── Sparkline y banda de momento ────────────────────────────────────────────

function Sparkline({ data }: { data: UserPeriodBucket[] }) {
  const width = 72;
  const height = 30;
  if (!data.length) return <div className="h-[30px] w-[72px]" />;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = width / (data.length - 1 || 1);
  const pts = data.map((d, i) => {
    const x = i * step;
    const y = height - (d.count / max) * (height - 6) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="shrink-0 opacity-90" aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#0EA5A0"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MomentumBand({ kpis }: { kpis: AdminUserKpis }) {
  const items = [
    {
      label: "Usuarios totales",
      value: formatNumber(kpis.totalUsers),
      hint: `Crecimiento del periodo: +${kpis.totalUsersGrowthPct.toFixed(1)}%`,
    },
    {
      label: "Nuevos en el periodo",
      value: formatNumber(kpis.newUsers),
      variation: kpis.newUsersVariationPct,
    },
    {
      label: "Cuentas activas",
      value: formatNumber(kpis.activeUsers),
      variation: kpis.activeUsersVariationPct,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/15 shadow-xl sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-[#122B52] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-white">{item.value}</p>
            </div>
            <Sparkline data={kpis.usersByPeriod} />
          </div>
          <div className="mt-3">
            {item.variation !== undefined ? (
              variationPill(item.variation)
            ) : (
              <span className="inline-flex rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-300">
                {item.hint}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
// ── Gráfico de movimiento de registros ──────────────────────────────────────

function formatBucketLabel(period: string, granularity: string) {
  const d = new Date(`${period}T00:00:00`);
  if (Number.isNaN(d.getTime())) return period;
  if (granularity === "MONTH") {
    return d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function MovementChart({
  data,
  previous,
  granularity,
}: {
  data: UserPeriodBucket[];
  previous: UserPeriodBucket[];
  granularity: string;
}) {
  const width = 880;
  const height = 250;
  const padX = 10;
  const padTop = 14;
  const padBottom = 26;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const max = Math.max(1, ...data.map((d) => d.count), ...previous.map((d) => d.count));
  const n = Math.max(data.length, 1);
  const step = innerW / n;
  const barW = Math.min(step * 0.55, 26);

  const toY = (c: number) => padTop + innerH - (c / max) * innerH;

  const prevPts = previous.map((d, i) => {
    const x = padX + step * i + step / 2;
    return [x, toY(d.count)];
  });
  const prevPath = prevPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  const labelCount = Math.min(n, 6);
  const labelIndexes = Array.from(
    new Set(data.map((_, i) => Math.round((i / Math.max(n - 1, 1)) * (labelCount - 1))))
  );

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => ({
    y: padTop + innerH - innerH * f,
    val: Math.round(max * f),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Movimiento de registros</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Usuarios registrados en cada periodo, comparados con el periodo anterior equivalente.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#0EA5A0]" /> Periodo actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-dashed border-[#1B3A6B]" /> Periodo anterior
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfico de registros por periodo">
        {gridLines.map((g) => (
          <g key={g.y}>
            <line x1={padX} x2={width - padX} y1={g.y} y2={g.y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth={1} />
            <text x={padX} y={g.y - 4} fontSize={9} fill="#94A3B8" textAnchor="start">{g.val}</text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = padX + step * i + (step - barW) / 2;
          const h = Math.max(0, padTop + innerH - toY(d.count));
          return (
            <rect
              key={`${d.period}-${i}`}
              x={x}
              y={toY(d.count)}
              width={barW}
              height={h}
              rx={2}
              fill="#0EA5A0"
              opacity={0.85}
            >
              <title>{`${formatBucketLabel(d.period, granularity)}: ${d.count} registrados`}</title>
            </rect>
          );
        })}

        {prevPts.length > 1 && (
          <path
            d={prevPath}
            fill="none"
            stroke="#1B3A6B"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {data.map((d, i) => {
          if (!labelIndexes.includes(i)) return null;
          const x = padX + step * i + step / 2;
          return (
            <text key={`${d.period}-label`} x={x} y={height - 8} fontSize={9.5} fill="#64748B" textAnchor="middle">
              {formatBucketLabel(d.period, granularity)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
// ── Distribuciones y actividad operativa ────────────────────────────────────

import type { AdminMetrics } from "../types/admin.types";

function RoleDistribution({ kpis }: { kpis: AdminUserKpis }) {
  const entries = Object.entries(kpis.usersByRole).filter(([, c]) => c > 0);
  const total = entries.reduce((acc, [, c]) => acc + c, 0);
  const max = Math.max(1, ...entries.map(([, c]) => c));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">Composición por rol</h2>
      <p className="mt-0.5 text-xs text-slate-500">Distribución actual de la base de usuarios.</p>
      <div className="mt-5 space-y-3">
        {entries.length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
        {entries.map(([role, count]) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={role}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{ROLE_LABELS[role] ?? role}</span>
                <span className="tabular-nums text-slate-500">
                  {formatNumber(count)} <span className="text-slate-400">· {pct}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, backgroundColor: ROLE_COLORS[role] ?? "#94A3B8" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDistribution({ kpis }: { kpis: AdminUserKpis }) {
  const entries = Object.entries(kpis.usersByStatus).filter(([, c]) => c > 0);
  const total = entries.reduce((acc, [, c]) => acc + c, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">Estado de cuentas</h2>
      <p className="mt-0.5 text-xs text-slate-500">Snapshot del estado actual de los usuarios.</p>
      <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
        {entries.map(([status, count]) => (
          <div
            key={status}
            style={{
              width: `${total ? (count / total) * 100 : 0}%`,
              backgroundColor: STATUS_COLORS[status] ?? "#94A3B8",
            }}
            title={`${STATUS_LABELS[status] ?? status}: ${formatNumber(count)}`}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {entries.map(([status, count]) => (
          <div
            key={status}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] ?? "#94A3B8" }} />
              {STATUS_LABELS[status] ?? status}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-800">{formatNumber(count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationalStrip({ metrics }: { metrics: AdminMetrics | undefined }) {
  if (!metrics) return null;
  const items = [
    { label: "Empresas", value: metrics.totalCompanies },
    { label: "Profesionales", value: metrics.totalFreelancers },
    { label: "Postulaciones", value: metrics.totalApplications },
    { label: "Entrevistas iniciadas", value: metrics.interviewsStarted },
    { label: "Entrevistas completadas", value: metrics.interviewsCompleted },
    { label: "Uso del sistema de IA", value: metrics.aiSystemUsage },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">Actividad operativa de la plataforma</h2>
      <p className="mt-0.5 text-xs text-slate-500">Métricas operativas globales del sistema.</p>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#1B3A6B]">{formatNumber(item.value)}</p>
            <p className="mt-1 text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



