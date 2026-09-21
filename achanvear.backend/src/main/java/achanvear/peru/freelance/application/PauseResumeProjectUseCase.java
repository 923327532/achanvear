package achanvear.peru.freelance.application;

public interface PauseResumeProjectUseCase {

    void pauseProject(String projectId, String requesterUserId);

    void resumeProject(String projectId, String requesterUserId);

    void deleteProject(String projectId, String requesterUserId);
}