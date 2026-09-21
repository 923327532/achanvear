package achanvear.peru.services.web;

import achanvear.peru.freelance.application.port.out.StoragePort;
import achanvear.peru.shared.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/services/storage")
public class ServiceStorageController {

    private final StoragePort storagePort;

    public ServiceStorageController(StoragePort storagePort) {
        this.storagePort = storagePort;
    }

    @PostMapping("/presigned-url")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<StoragePort.PresignedUploadResponse> getPresignedUploadUrl(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody PresignedUrlRequest request
    ) {
        String folder = switch (request.type().toUpperCase()) {
            case "IMAGES" -> "SERVICE_IMAGES";
            case "VIDEOS" -> "SERVICE_VIDEOS";
            case "PDFS" -> "SERVICE_PDFS";
            case "CERTIFICATES" -> "SERVICE_CERTIFICATES";
            default -> throw new IllegalArgumentException("Invalid file type: " + request.type());
        };

        StoragePort.PresignedUploadResponse response = storagePort.generatePresignedUploadUrl(
                folder,
                request.fileName(),
                request.contentType()
        );

        return ResponseEntity.ok(response);
    }

    public record PresignedUrlRequest(
            String type,
            String fileName,
            String contentType
    ) {}
}
