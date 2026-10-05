package achanvear.peru.services.web;

import achanvear.peru.freelance.application.port.out.StoragePort;
import achanvear.peru.shared.security.AuthenticatedUser;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
        String folder = resolveFolder(request.type());

        StoragePort.PresignedUploadResponse response = storagePort.generatePresignedUploadUrl(
                folder,
                request.fileName(),
                request.contentType()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<StoragePort.UploadResponse> uploadFile(
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file
    ) throws java.io.IOException {
        String folder = resolveFolder(type);
        StoragePort.UploadResponse response = storagePort.uploadFile(
                folder,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getBytes()
        );

        return ResponseEntity.ok(new StoragePort.UploadResponse(
                response.fileKey(),
                buildFileProxyUrl(response.fileKey())
        ));
    }

    @GetMapping("/file-proxy")
    public ResponseEntity<Resource> serveFile(@RequestParam String fileKey) {
        try {
            byte[] fileBytes = storagePort.downloadFile(fileKey);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(resolveContentType(fileKey)))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    private String resolveFolder(String type) {
        return switch (type.toUpperCase()) {
            case "IMAGES" -> "SERVICE_IMAGES";
            case "VIDEOS" -> "SERVICE_VIDEOS";
            case "PDFS" -> "SERVICE_PDFS";
            case "CERTIFICATES" -> "SERVICE_CERTIFICATES";
            default -> throw new IllegalArgumentException("Invalid file type: " + type);
        };
    }

    private String buildFileProxyUrl(String fileKey) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/services/storage/file-proxy")
                .queryParam("fileKey", fileKey)
                .build()
                .encode()
                .toUriString();
    }

    private String resolveContentType(String fileKey) {
        String normalized = fileKey == null ? "" : fileKey.toLowerCase();
        if (normalized.endsWith(".png")) return "image/png";
        if (normalized.endsWith(".webp")) return "image/webp";
        if (normalized.endsWith(".gif")) return "image/gif";
        if (normalized.endsWith(".mp4")) return "video/mp4";
        if (normalized.endsWith(".pdf")) return "application/pdf";
        return "image/jpeg";
    }

    public record PresignedUrlRequest(
            String type,
            String fileName,
            String contentType
    ) {}
}
