package achanvear.peru.admin.application;

import achanvear.peru.admin.application.dto.AdminUserPageResponse;
import achanvear.peru.identity.application.query.AdminUserQuery;

public interface ListUsersUseCase {

    AdminUserPageResponse list(AdminUserQuery query);
}
