// features/settings/components/CompanyTeamSection.tsx
"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  X,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  User,
} from "lucide-react";
import {
  useCollaborators,
  useInviteCollaborator,
  useRemoveCollaborator,
  useDeactivateCollaborator,
} from "../hooks/useCompanySettings";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import { ApiError } from "@/lib/errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError && err.message ? err.message : fallback;
}

export function CompanyTeamSection() {
  const {
    collaborators,
    isLoading: isLoadingCollaborators,
  } = useCollaborators();
  const { inviteAsync, isLoading: isInviting } = useInviteCollaborator();
  const { removeAsync } = useRemoveCollaborator();
  const { deactivateAsync } = useDeactivateCollaborator();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [credentialsEmail, setCredentialsEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ kind: "remove" | "deactivate"; id: string; name: string } | null>(null);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setError("");
    setInviteEmail("");
    setInviteName("");
  };

  const handleInviteMember = async () => {
    setError("");
    const email = inviteEmail.trim();
    const name = inviteName.trim();
    if (!email || !name) {
      setError("Completa todos los campos");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Escribe un correo válido");
      return;
    }
    try {
      const result = await inviteAsync({ email, fullName: name });
      setCredentialsEmail(email);
      closeInviteModal();
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
        setShowCredentials(true);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al invitar colaborador"));
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const current = pendingAction;
    setPendingAction(null);
    setActionError("");
    setBusyId(current.id);
    try {
      if (current.kind === "remove") {
        await removeAsync(current.id);
      } else {
        await deactivateAsync(current.id);
      }
    } catch (err: unknown) {
      setActionError(
        getErrorMessage(
          err,
          current.kind === "remove" ? "No se pudo eliminar al colaborador" : "No se pudo desactivar al colaborador"
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; className: string }> = {
      COMPANY_COLLABORATOR: {
        label: "Colaborador",
        className: "bg-blue-50 text-blue-700",
      },
      RECRUITER: {
        label: "Reclutador",
        className: "bg-blue-50 text-blue-700",
      },
      MANAGER: {
        label: "Gerente",
        className: "bg-amber-50 text-amber-700",
      },
      ADMIN: {
        label: "Administrador",
        className: "bg-purple-50 text-purple-700",
      },
    };
    const r = roles[role] || { label: role, className: "bg-gray-50 text-gray-600" };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.className}`}>
        {r.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === "ACTIVE";
    const label = isActive ? "Activo" : status === "INACTIVE" ? "Desactivado" : status;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}>
        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1B3A6B]">Gestión de Equipo</h2>
          <p className="text-sm text-gray-500 mt-1">
            Agrega colaboradores a tu empresa
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invitar Colaborador
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{actionError}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingCollaborators ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                    <p className="text-sm text-gray-500">Cargando colaboradores...</p>
                  </div>
                </td>
              </tr>
            ) : collaborators.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Aún no tienes colaboradores</p>
                    <p className="text-xs text-gray-400">Invita colaboradores para gestionar tu empresa</p>
                  </div>
                </td>
              </tr>
            ) : (
              collaborators.map((member) => {
                const isBusy = busyId === member.id;
                return (
                  <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#1B3A6B]" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{member.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{member.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(member.role)}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(member.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isBusy && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
                        {member.status === "ACTIVE" && (
                          <button
                            onClick={() => setPendingAction({ kind: "deactivate", id: member.id, name: member.fullName })}
                            disabled={isBusy}
                            className="text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
                          >
                            Desactivar
                          </button>
                        )}
                        <button
                          onClick={() => setPendingAction({ kind: "remove", id: member.id, name: member.fullName })}
                          disabled={isBusy}
                          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1B3A6B]">Invitar Colaborador</h3>
              <button onClick={closeInviteModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nombre del colaborador"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleInviteMember}
                disabled={isInviting || !inviteEmail || !inviteName}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors disabled:opacity-50"
              >
                {isInviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isInviting ? "Enviando..." : "Enviar Invitación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCredentials && tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B3A6B]">Colaborador agregado</h3>
              <button onClick={() => setShowCredentials(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Copia estas credenciales y compártelas con el colaborador. Es posible que no reciba un correo con ellas.
            </p>
            <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                <p className="text-sm font-medium text-gray-800">{credentialsEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Contraseña temporal</p>
                <p className="text-sm font-mono font-bold text-[#1B3A6B] bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block mt-1">
                  {tempPassword}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${credentialsEmail}\nContraseña: ${tempPassword}`);
                setShowCredentials(false);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#0EA5A0] transition-colors"
            >
              Copiar credenciales
            </button>
          </div>
        </div>
      )}

      {pendingAction && (
        <ConfirmModal
          title={pendingAction.kind === "remove" ? "Eliminar colaborador" : "Desactivar colaborador"}
          description={
            pendingAction.kind === "remove"
              ? `Vas a eliminar a ${pendingAction.name} de tu equipo.`
              : `Vas a desactivar a ${pendingAction.name} de tu equipo.`
          }
          confirmLabel={pendingAction.kind === "remove" ? "Eliminar" : "Desactivar"}
          cancelLabel="Volver"
          confirmClassName={pendingAction.kind === "deactivate" ? "bg-amber-500 hover:bg-amber-600" : undefined}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Colaborador agregado correctamente</span>
        </div>
      )}
    </div>
  );
}