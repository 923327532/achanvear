package achanvear.peru.payments.domain.model;

public class ProjectPublishingPolicy {

    public static final int FREE_PLAN_PROJECT_LIMIT = 2;

    public static boolean canPublishProject(PlanType currentPlan, int publishedProjectsCount, boolean hasActiveSubscription) {
        // Si tiene suscripción activa pagada, usa los límites del plan
        if (hasActiveSubscription) {
            return currentPlan.canPublishProject(publishedProjectsCount);
        }

        // Plan gratuito: máximo 2 proyectos
        if (currentPlan == PlanType.FREE) {
            return publishedProjectsCount < FREE_PLAN_PROJECT_LIMIT;
        }

        return false;
    }

    public static int remainingFreeProjects(int publishedProjectsCount) {
        return Math.max(0, FREE_PLAN_PROJECT_LIMIT - publishedProjectsCount);
    }

    public static String getUpgradeMessage(int publishedProjectsCount) {
        if (publishedProjectsCount >= FREE_PLAN_PROJECT_LIMIT) {
            return "Has alcanzado el límite de 2 proyectos gratuitos. " +
                   "Actualiza a un plan premium para publicar más proyectos y obtener: " +
                   "más visibilidad, invitaciones directas a freelancers, y publicaciones destacadas.";
        }
        return String.format("Te quedan %d proyecto(s) gratuito(s).",
                remainingFreeProjects(publishedProjectsCount));
    }
}
