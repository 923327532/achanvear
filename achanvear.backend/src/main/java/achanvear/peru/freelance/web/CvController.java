package achanvear.peru.freelance.web;

import achanvear.peru.freelance.application.CvGenerationService;
import achanvear.peru.freelance.application.dto.CvEditSectionRequest;
import achanvear.peru.freelance.application.dto.CvResponse;

import achanvear.peru.shared.security.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/freelance/cv")
@RequiredArgsConstructor
@Tag(name = "CV Generator", description = "Generación y edición de CV con IA")
public class CvController {

    private final CvGenerationService cvGenerationService;

    @PostMapping("/generate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generar CV con IA usando datos del perfil del freelancer")
    public ResponseEntity<CvResponse> generateCv(
            @CurrentUserId String userId
    ) {
        CvResponse cv = cvGenerationService.generateCv(userId);
        return ResponseEntity.ok(cv);
    }

    @PostMapping("/edit-section")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Editar una sección específica del CV con IA")
    public ResponseEntity<CvResponse> editSection(
            @CurrentUserId String userId,
            @Valid @RequestBody CvEditSectionRequest request
    ) {
        CvResponse cv = cvGenerationService.editSection(userId, request);
        return ResponseEntity.ok(cv);
    }
}
