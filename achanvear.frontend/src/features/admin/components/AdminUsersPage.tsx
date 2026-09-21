// features/admin/components/AdminUsersPage.tsx
"use client";

import { useState } from "react";
import { Loader2, Search, Power, RotateCcw, UserPlus, UserCog, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useAdminUsers,
  useChangeUserStatus,
  useChangeUserRole,
  useCreateUser,
} from "../hooks/useAdminData";
import type { AdminUser } from "../types/admin.types";

// ── Catálogo de roles ───────────────────────────────────────────────────────

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

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: "bg-violet-100 text-violet-700 ring-violet-200",
  SUBADMIN: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  ADMIN: "bg-blue-100 text-blue-700 ring-blue-200",
  SUPPORT: "bg-teal-100 text-teal-700 ring-teal-200",
  COMPANY: "bg-amber-100 text-amber-700 ring-amber-200",
  COMPANY_COLLABORATOR: "bg-orange-100 text-orange-700 ring-orange-200",
  CANDIDATE: "bg-slate-100 text-slate-600 ring-slate-200",
  FREELANCER: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const PRIVILEGE_LEVEL: Record<string, number> = {
  SUPERADMIN: 100,
  SUBADMIN: 80,
  ADMIN: 80,
  SUPPORT: 60,
  COMPANY: 30,
  COMPANY_COLLABORATOR: 25,
  CANDIDATE: 10,
  FREELANCER: 10,
};

const REGULAR_ROLES = ["COMPANY", "COMPANY_COLLABORATOR", "CANDIDATE", "FREELANCER"];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  BLOCKED: "Bloqueado",
  DISABLED: "Desactivado",
  PENDING: "Pendiente",
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  BLOCKED: "bg-red-100 text-red-700",
  DISABLED: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
};

function isSuperAdmin(role?: string) {
  return role?.toUpperCase() === "SUPERADMIN";
}

/** Roles que el actor puede asignar (mismo criterio que el backend). */
function assignableRoles(actorRole?: string): string[] {
  if (isSuperAdmin(actorRole)) {
    return ["ADMIN", "SUPPORT", "SUBADMIN", ...REGULAR_ROLES];
  }
  return [...REGULAR_ROLES];
}

/** ¿El actor puede gestionar (rol/estado) a un usuario con el rol indicado? */
function canManageUser(actorRole?: string, targetRole?: string): boolean {
  if (isSuperAdmin(actorRole)) return true;
  return (PRIVILEGE_LEVEL[targetRole ?? ""] ?? 0) < (PRIVILEGE_LEVEL[actorRole ?? ""] ?? 0);
}

// ── Página principal ────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { user } = useAuth();
  const actorRole = user?.role?.toUpperCase();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    size: 10,
  });

  const changeStatusMutation = useChangeUserStatus();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = async (target: AdminUser, newStatus: string) => {
    try {
      setActionError(null);
      await changeStatusMutation.mutateAsync({ userId: target.id, newStatus });
    } catch (err: any) {
      setActionError(err?.message ?? "No se pudo actualizar el estado del usuario");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión de cuentas, roles y estados. El backend valida cada operación según tu nivel de privilegio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar por correo o nombre..."
              className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1B3A6B]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0EA5A0]"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      {isError && <p className="mb-4 text-sm text-red-500">No se pudieron cargar los usuarios.</p>}
      {actionError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{actionError}</p>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre / Razón social</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1B3A6B]" />
                </td>
              </tr>
            ) : (
              data?.items.map((item) => {
                const manageable = canManageUser(actorRole, item.role);
                const isSelf = item.id === user?.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${ROLE_BADGE[item.role] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                        {ROLE_LABELS[item.role] ?? item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {manageable && !isSelf ? (
                          <>
                            <button
                              onClick={() => setRoleTarget(item)}
                              title="Cambiar rol"
                              className="rounded-lg p-2 text-[#1B3A6B] hover:bg-blue-50"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            {item.status !== "ACTIVE" ? (
                              <button
                                onClick={() => handleStatusChange(item, "ACTIVE")}
                                disabled={changeStatusMutation.isPending}
                                title="Activar"
                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(item, "DISABLED")}
                                disabled={changeStatusMutation.isPending}
                                title="Suspender"
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-300" title="Sin permiso para gestionar este usuario">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Página {data.page + 1} de {data.totalPages} · {data.totalItems} usuarios</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {showCreate && <CreateUserModal actorRole={actorRole} onClose={() => setShowCreate(false)} />}
      {roleTarget && (
        <RoleChangeModal
          actorRole={actorRole}
          target={roleTarget}
          onClose={() => setRoleTarget(null)}
        />
      )}
    </div>
  );
}
// ── Utilidades de UI ───────────────────────────────────────────────────────

import type { ChangeEvent, FormEvent, ReactNode } from "react";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3A6B]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function RoleOption({ role, selected, onSelect }: { role: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {ROLE_LABELS[role] ?? role}
    </button>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1B3A6B]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
// ── Modal: crear usuario ────────────────────────────────────────────────────

function CreateUserModal({ actorRole, onClose }: { actorRole?: string; onClose: () => void }) {
  const createUser = useCreateUser();
  const canPickRole = isSuperAdmin(actorRole);
  const roles = assignableRoles(actorRole);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dni: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [role, setRole] = useState(canPickRole ? "ADMIN" : "CANDIDATE");
  const [error, setError] = useState<string | null>(null);

  const privileged = roles.filter((r) => (PRIVILEGE_LEVEL[r] ?? 0) >= 60);
  const regular = roles.filter((r) => (PRIVILEGE_LEVEL[r] ?? 0) < 60);
  const selectedLabel = ROLE_LABELS[role] ?? role;

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Completa el nombre y el correo");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await createUser.mutateAsync({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        dni: form.dni.trim() || undefined,
        phone: form.phone.trim() || undefined,
        password: form.password,
        role,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo crear el usuario");
    }
  };

  return (
    <ModalShell
      title="Nuevo usuario"
      subtitle="El usuario se crea de inmediato con el rol seleccionado."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input value={form.fullName} onChange={set("fullName")} placeholder="Nombre y apellidos" className={inputCls} />
          </Field>
          <Field label="Correo electrónico">
            <input type="email" value={form.email} onChange={set("email")} placeholder="correo@empresa.com" className={inputCls} />
          </Field>
          <Field label="DNI (opcional)">
            <input value={form.dni} onChange={set("dni")} placeholder="8 dígitos" maxLength={8} className={inputCls} />
          </Field>
          <Field label="Teléfono (opcional)">
            <input value={form.phone} onChange={set("phone")} placeholder="9 a 15 dígitos" className={inputCls} />
          </Field>
          <Field label="Contraseña inicial">
            <input type="password" value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" className={inputCls} />
          </Field>
          <Field label="Confirmar contraseña">
            <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repite la contraseña" className={inputCls} />
          </Field>
        </div>

        {/* Selector de rol: visible únicamente para SUPERADMIN */}
        {canPickRole ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Rol a asignar</p>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Administración y soporte</p>
                <div className="flex flex-wrap gap-2">
                  {privileged.map((r) => (
                    <RoleOption key={r} role={r} selected={role === r} onSelect={() => setRole(r)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Roles de plataforma</p>
                <div className="flex flex-wrap gap-2">
                  {regular.map((r) => (
                    <RoleOption key={r} role={r} selected={role === r} onSelect={() => setRole(r)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Se creará con el rol <strong>{selectedLabel}</strong>. Tu nivel de privilegio no permite asignar roles
            administrativos ni de soporte.
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Confirmación clara del rol que se asignará */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#1B3A6B] px-4 py-3">
          <p className="text-sm text-white/90">
            Se creará con el rol <span className="font-bold text-white">{selectedLabel}</span>
          </p>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="rounded-xl bg-[#0EA5A0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
          >
            {createUser.isPending ? "Creando..." : `Crear con rol ${selectedLabel}`}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
// ── Modal: cambiar rol ──────────────────────────────────────────────────────

function RoleChangeModal({
  actorRole,
  target,
  onClose,
}: {
  actorRole?: string;
  target: AdminUser;
  onClose: () => void;
}) {
  const changeRole = useChangeUserRole();
  const roles = assignableRoles(actorRole);
  const [role, setRole] = useState(target.role);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = ROLE_LABELS[role] ?? role;
  const currentLabel = ROLE_LABELS[target.role] ?? target.role;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (role === target.role) {
      onClose();
      return;
    }
    try {
      await changeRole.mutateAsync({ userId: target.id, newRole: role });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo cambiar el rol");
    }
  };

  return (
    <ModalShell
      title="Cambiar rol"
      subtitle={`${target.fullName ?? target.email} · rol actual: ${currentLabel}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nuevo rol</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
            {roles.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-500">
          Solo se muestran roles que tu nivel de privilegio puede asignar. El cambio aplica de inmediato en la
          autorización del sistema.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#1B3A6B] px-4 py-3">
          <p className="text-sm text-white/90">
            El usuario quedará con el rol <span className="font-bold text-white">{selectedLabel}</span>
          </p>
          <button
            type="submit"
            disabled={changeRole.isPending}
            className="rounded-xl bg-[#0EA5A0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
          >
            {changeRole.isPending ? "Guardando..." : "Guardar rol"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}




