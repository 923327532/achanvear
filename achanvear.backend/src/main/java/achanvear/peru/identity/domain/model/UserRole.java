package achanvear.peru.identity.domain.model;

/**
 * Roles del sistema.
 *
 * <p>Niveles (mayor = más privilegios):
 * <ul>
 *   <li>SUPERADMIN (100) — control total; se asigna manualmente en base de datos.</li>
 *   <li>SUBADMIN (80) / ADMIN (80) — gestión administrativa.</li>
 *   <li>SUPPORT (60) — soporte operativo.</li>
 *   <li>COMPANY (30), COMPANY_COLLABORATOR (25), CANDIDATE (10), FREELANCER (10) — usuarios de plataforma.</li>
 * </ul>
 */
public enum UserRole {

    SUPERADMIN(100, true),
    SUBADMIN(80, true),
    ADMIN(80, true),
    SUPPORT(60, true),
    COMPANY(30, false),
    COMPANY_COLLABORATOR(25, false),
    CANDIDATE(10, false),
    FREELANCER(10, false);

    private final int level;
    private final boolean privileged;

    UserRole(int level, boolean privileged) {
        this.level = level;
        this.privileged = privileged;
    }

    public int level() {
        return level;
    }

    public boolean isPrivileged() {
        return privileged;
    }

    /** Roles que un usuario puede elegir en el registro público (no administrativo). */
    public boolean canBeSelfRegistered() {
        return this == FREELANCER || this == COMPANY || this == CANDIDATE;
    }
}
