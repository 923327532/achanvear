package achanvear.peru.freelance.application.port.out;

public interface StoragePort {

    PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    );

    PresignedDownloadResponse generatePresignedDownloadUrl(String fileKey);

    UploadResponse uploadFile(
            String folder,
            String fileName,
            String contentType,
            byte[] fileContent
    );

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

    record UploadResponse(
            String fileKey,
            String publicFileUrl
    ) {
    }
}
