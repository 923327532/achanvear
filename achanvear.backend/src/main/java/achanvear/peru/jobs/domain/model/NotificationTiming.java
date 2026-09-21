package achanvear.peru.jobs.domain.model;

/**
 * Define cuando se notifica al candidato si paso el screening.
 * - IMMEDIATE: Apenas se evalua al candidato
 * - AFTER_2_HOURS: 2 horas despues de la evaluacion (batch)
 * - AFTER_CLOSING: Cuando se cierren las postulaciones
 */
public enum NotificationTiming {
    IMMEDIATE,
    AFTER_2_HOURS,
    AFTER_CLOSING
}
