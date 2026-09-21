package achanvear.peru.interview.application.port.out;

import achanvear.peru.interview.application.query.AdminInterviewQuery;
import achanvear.peru.interview.domain.model.Interview;
import org.springframework.data.domain.Page;

/**
 * Puerto de consulta de entrevistas para el panel administrativo.
 * El módulo admin depende de esta interfaz, no de repositorios del módulo interview.
 */
public interface InterviewAdminQueryPort {

    Page<Interview> findForAdmin(AdminInterviewQuery query);

    long count();

    long countByStatus(String status);

    long countByInterviewType(String type);

    long countApproved();

    long countRejected();

    long countWithPythonSession();

    long countTotalViolations();
}
