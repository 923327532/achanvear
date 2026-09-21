package achanvear.peru.freelance.infrastructure.external;

public interface StoragePort {

    PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    );

    PresignedDownloadResponse generatePresignedDownloadUrl(String fileKey);

    record PresignedUploadResponse(
            String fileKey,
            String uploadUrl,
            String publicFileUrl
    ) {
    }

    record PresignedDownloadResponse(
            String fileKey,
            String downloadUrl
    ) {
    }
}
