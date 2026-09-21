package achanvear.peru.jobs.application;

public interface DeleteJobUseCase {

    void execute(String jobPostId, String requesterCompanyId, boolean superAdmin);
}
