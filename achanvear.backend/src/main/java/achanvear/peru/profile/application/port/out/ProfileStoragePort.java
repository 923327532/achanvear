package achanvear.peru.profile.application.port.out;

public interface ProfileStoragePort {

    PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    );

    byte[] downloadFile(String fileKey);

    record PresignedUploadResponse(
            String fileKey,
            String uploadUrl,
            String publicFileUrl
    ) {
    }
}


