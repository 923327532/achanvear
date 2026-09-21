package achanvear.peru.admin.application;

public interface ChangeUserStatusUseCase {

    void changeStatus(String adminUserId, String userId, String newStatus);
}
