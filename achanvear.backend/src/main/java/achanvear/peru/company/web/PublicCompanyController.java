package achanvear.peru.company.web;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.*;

@RestController
@RequestMapping("/companies/public")
@PreAuthorize("isAuthenticated()")
public class PublicCompanyController {
    private final JdbcTemplate jdbc;
    public PublicCompanyController(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @GetMapping("/{id}")
    public ApiResponse<Map<String,Object>> get(@PathVariable UUID id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal achanvear.peru.shared.security.AuthenticatedUser viewer) {
        var rows = jdbc.queryForList("""
            SELECT c.id, c.owner_user_id AS "ownerUserId", c.business_name AS "businessName",
                   c.trade_name AS "tradeName", c.industry, c.specialty, c.company_size AS "companySize",
                   c.logo_url AS "logoUrl", c.biography, c.status,
                   CASE WHEN COALESCE(c.show_contact_info,true) THEN u.email END AS email,
                   CASE WHEN COALESCE(c.show_contact_info,true) THEN u.phone END AS phone
            FROM companies c JOIN users u ON u.id=c.owner_user_id WHERE c.id = ? OR c.owner_user_id = ?
            """, id, id);
        if (rows.isEmpty()) throw new achanvear.peru.shared.domain.exception.ResourceNotFoundException("Company not found");
        if (viewer != null) jdbc.update("""
            INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
            SELECT owner_user_id,'REPORT','Tu perfil fue consultado','Un usuario consultó el perfil de tu empresa.',
                   'profile-view:' || id || ':' || CAST(? AS TEXT) || ':' || CURRENT_DATE
            FROM companies WHERE (id=? OR owner_user_id=?) AND visibility_notifications=true AND owner_user_id<>?
            ON CONFLICT DO NOTHING
            """,viewer.getUserId(),id,id,viewer.getUserId());
        return ApiResponse.success(rows.get(0), "Public company profile retrieved");
    }
}
