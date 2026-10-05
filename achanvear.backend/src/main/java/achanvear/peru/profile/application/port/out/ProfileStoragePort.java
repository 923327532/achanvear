package achanvear.peru.profile.application.port.out;

public interface ProfileStoragePort {

    PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    );

    byte[] downloadFile(String fileKey);

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

    record UploadResponse(
            String fileKey,
            String publicFileUrl
    ) {
    }

    record PresignedDownloadResponse(
            String fileKey,
            String downloadUrl
    ) {
    }
}


