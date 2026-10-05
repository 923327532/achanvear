package achanvear.peru.payments.domain.model;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class ProjectPublishingPolicy {

    public static final int FREE_PLAN_JOB_LIMIT = 2;
    public static final int FREE_PLAN_FREELANCE_PROJECT_LIMIT = 1;
    public static final int FREE_PLAN_DAYS = 30;

    public static boolean canPublishJob(
            PlanType currentPlan,
            int jobPostsCount,
            boolean hasActiveSubscription,
            Instant companyCreatedAt
    ) {
        if (hasActiveSubscription) {
            return currentPlan.canPublishProject(jobPostsCount);
        }

        return isFreeTrialActive(companyCreatedAt) && jobPostsCount < FREE_PLAN_JOB_LIMIT;
    }

    public static boolean canPublishFreelanceProject(
            PlanType currentPlan,
            int projectCount,
            boolean hasActiveSubscription,
            Instant companyCreatedAt
    ) {
        if (hasActiveSubscription) {
            return currentPlan.canPublishProject(projectCount);
        }

        return isFreeTrialActive(companyCreatedAt) && projectCount < FREE_PLAN_FREELANCE_PROJECT_LIMIT;
    }

    public static boolean canUseRecruitmentAutomation(boolean hasActiveSubscription) {
        return hasActiveSubscription;
    }

    public static String getRecruitmentAutomationUpgradeMessage() {
        return "El plan gratuito solo permite seleccion manual. Actualiza a un plan superior para activar IA, filtros automaticos y entrevistas automatizadas.";
    }

    public static boolean canPublishProject(
            PlanType currentPlan,
            int publishedProjectsCount,
            boolean hasActiveSubscription
    ) {
        if (hasActiveSubscription) {
            return currentPlan.canPublishProject(publishedProjectsCount);
        }

        return currentPlan == PlanType.FREE && publishedProjectsCount < FREE_PLAN_FREELANCE_PROJECT_LIMIT;
    }

    public static int remainingFreeProjects(int publishedProjectsCount) {
        return Math.max(0, FREE_PLAN_FREELANCE_PROJECT_LIMIT - publishedProjectsCount);
    }

    public static int remainingFreeJobs(int jobPostsCount) {
        return Math.max(0, FREE_PLAN_JOB_LIMIT - jobPostsCount);
    }

    public static boolean isFreeTrialActive(Instant companyCreatedAt) {
        return companyCreatedAt != null
                && Instant.now().isBefore(companyCreatedAt.plus(FREE_PLAN_DAYS, ChronoUnit.DAYS));
    }

    public static String getJobUpgradeMessage(int jobPostsCount, Instant companyCreatedAt) {
        if (!isFreeTrialActive(companyCreatedAt)) {
            return "No puedes publicar otro empleo. Tu plan gratuito duraba 30 dias y ya vencio. Actualiza a un plan superior o compra un paquete de publicaciones.";
        }
        if (jobPostsCount >= FREE_PLAN_JOB_LIMIT) {
            return "No puedes publicar otro empleo. Tu plan gratuito permite 2 empleos por 30 dias. Actualiza a un plan superior o compra un paquete de publicaciones.";
        }
        return String.format(
                "Te queda(n) %d empleo(s) gratuito(s) durante los primeros 30 dias.",
                remainingFreeJobs(jobPostsCount)
        );
    }

    public static String getFreelanceProjectUpgradeMessage(int projectCount, Instant companyCreatedAt) {
        if (!isFreeTrialActive(companyCreatedAt)) {
            return "Tu plan gratuito duraba 30 dias y ya vencio. Suscribete a un plan para publicar proyectos freelance.";
        }
        if (projectCount >= FREE_PLAN_FREELANCE_PROJECT_LIMIT) {
            return "Tu plan gratuito permite 1 proyecto freelance por 30 dias. Suscribete a un plan para publicar mas proyectos.";
        }
        return String.format(
                "Te queda(n) %d proyecto(s) freelance gratuito(s) durante los primeros 30 dias.",
                remainingFreeProjects(projectCount)
        );
    }

    public static String getUpgradeMessage(int publishedProjectsCount) {
        if (publishedProjectsCount >= FREE_PLAN_FREELANCE_PROJECT_LIMIT) {
            return "Has alcanzado el limite de 1 proyecto freelance gratuito. " +
                    "Actualiza a un plan premium para publicar mas proyectos y obtener mas visibilidad.";
        }
        return String.format("Te quedan %d proyecto(s) gratuito(s).",
                remainingFreeProjects(publishedProjectsCount));
    }
}
