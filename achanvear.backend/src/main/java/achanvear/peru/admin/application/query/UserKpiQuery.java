package achanvear.peru.admin.application.query;

/**
 * Consulta de KPIs de volumen de usuarios. {@code days} define la ventana
 * del periodo a analizar (el periodo anterior equivalente se usa para comparar).
 */
public record UserKpiQuery(int days) {
}
