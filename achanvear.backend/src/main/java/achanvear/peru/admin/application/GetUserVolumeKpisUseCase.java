package achanvear.peru.admin.application;

import achanvear.peru.admin.application.dto.UserVolumeKpisResponse;
import achanvear.peru.admin.application.query.UserKpiQuery;

/**
 * KPIs de volumen y comportamiento de usuarios (por periodo, por estado y por rol),
 * con comparación entre periodos y variación porcentual de cada métrica.
 */
public interface GetUserVolumeKpisUseCase {

    UserVolumeKpisResponse getKpis(UserKpiQuery query);
}
