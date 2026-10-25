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
    public ApiResponse<Map<String,Object>> get(@PathVariable UUID id) {
        var rows = jdbc.queryForList("""
            SELECT id, owner_user_id AS "ownerUserId", business_name AS "businessName",
                   trade_name AS "tradeName", industry, specialty, company_size AS "companySize",
                   logo_url AS "logoUrl", biography, status
            FROM companies WHERE id = ? OR owner_user_id = ?
            """, id, id);
        if (rows.isEmpty()) throw new achanvear.peru.shared.domain.exception.ResourceNotFoundException("Company not found");
        return ApiResponse.success(rows.get(0), "Public company profile retrieved");
    }
}
