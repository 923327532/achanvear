package achanvear.peru.chat.web;

import achanvear.peru.freelance.application.port.out.StoragePort;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final DataSource dataSource;
    private final StoragePort storagePort;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public ChatController(DataSource dataSource, StoragePort storagePort) {
        this.dataSource = dataSource;
        this.storagePort = storagePort;
    }

    // ─── GET /chat/conversations ───────────────────────────────────────────────
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("""
                 SELECT c.id, c.company_id, c.freelancer_id, c.updated_at,
                        u.full_name AS participant_name,
                        u.role AS participant_role,
                        (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
                        (SELECT sent_at FROM chat_messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message_at
                 FROM chat_conversations c
                 JOIN users u ON (u.id = CASE WHEN c.company_id = ? THEN c.freelancer_id ELSE c.company_id END)
                 WHERE c.company_id = ? OR c.freelancer_id = ?
                 ORDER BY c.updated_at DESC
             """)) {
            stmt.setObject(1, userId);
            stmt.setObject(2, userId);
            stmt.setObject(3, userId);

            List<ConversationResponse> conversations = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Timestamp lastMsgTs = rs.getTimestamp("last_message_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");
                    conversations.add(new ConversationResponse(
                            rs.getObject("id", UUID.class).toString(),
                            rs.getString("participant_name"),
                            rs.getString("participant_role"),
                            rs.getString("last_message") != null ? rs.getString("last_message") : "",
                            lastMsgTs != null
                                    ? lastMsgTs.toInstant().toString()
                                    : updatedTs.toInstant().toString(),
                            0 // unreadCount - simplified
                    ));
                }
            }
            return ResponseEntity.ok(ApiResponse.success(conversations, "Conversations retrieved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to get conversations: " + e.getMessage()));
        }
    }

    // ─── GET /chat/conversations/{id}/messages ─────────────────────────────────
    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable String conversationId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("""
                 SELECT m.id, m.conversation_id, m.sender_id, m.content, m.sent_at
                 FROM chat_messages m
                 JOIN chat_conversations c ON c.id = m.conversation_id
                 WHERE m.conversation_id = ? AND (c.company_id = ? OR c.freelancer_id = ?)
                 ORDER BY m.sent_at ASC
             """)) {
            stmt.setObject(1, UUID.fromString(conversationId));
            stmt.setObject(2, userId);
            stmt.setObject(3, userId);

            List<MessageResponse> messages = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    UUID messageId = rs.getObject("id", UUID.class);
                    UUID senderId = rs.getObject("sender_id", UUID.class);
                    Timestamp sentTs = rs.getTimestamp("sent_at");

                    // Obtener adjuntos de este mensaje
                    List<AttachmentResponse> attachments = getAttachmentsForMessage(messageId);

                    messages.add(new MessageResponse(
                            messageId.toString(),
                            rs.getObject("conversation_id", UUID.class).toString(),
                            rs.getString("content"),
                            sentTs.toInstant().toString(),
                            senderId.equals(userId),
                            attachments
                    ));
                }
            }
            return ResponseEntity.ok(ApiResponse.success(messages, "Messages retrieved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to get messages: " + e.getMessage()));
        }
    }

    // ─── POST /chat/messages ───────────────────────────────────────────────────
    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody SendMessageRequest request
    ) {
        UUID userId = user.getUserId();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("""
                 INSERT INTO chat_messages (id, conversation_id, sender_id, content, sent_at)
                 VALUES (?, ?, ?, ?, ?)
                 RETURNING id, conversation_id, sender_id, content, sent_at
             """)) {
            UUID messageId = UUID.randomUUID();
            Instant now = Instant.now();
            stmt.setObject(1, messageId);
            stmt.setObject(2, UUID.fromString(request.conversationId()));
            stmt.setObject(3, userId);
            stmt.setString(4, request.content());
            stmt.setTimestamp(5, Timestamp.from(now));

            // Update conversation updated_at
            try (var updateStmt = conn.prepareStatement(
                    "UPDATE chat_conversations SET updated_at = ? WHERE id = ?")) {
                updateStmt.setTimestamp(1, Timestamp.from(now));
                updateStmt.setObject(2, UUID.fromString(request.conversationId()));
                updateStmt.executeUpdate();
            }

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Timestamp sentTs = rs.getTimestamp("sent_at");
                    MessageResponse response = new MessageResponse(
                            rs.getObject("id", UUID.class).toString(),
                            rs.getObject("conversation_id", UUID.class).toString(),
                            rs.getString("content"),
                            sentTs.toInstant().toString(),
                            true,
                            List.of() // sin adjuntos en mensajes de texto
                    );
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(ApiResponse.success(response, "Message sent"));
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to send message"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to send message: " + e.getMessage()));
        }
    }

    // ─── POST /chat/messages/{messageId}/attachments ───────────────────────────
    @PostMapping("/messages/{messageId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable String messageId,
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam("file") MultipartFile file
    ) {
        // Validar tamaño máximo
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ApiResponse.failure(
                            "El archivo excede el tamaño máximo permitido de 10 MB"));
        }

        try {
            // Subir a S3
            StoragePort.UploadResponse uploadResult = storagePort.uploadFile(
                    "CHAT_ATTACHMENTS",
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );

            // Guardar en base de datos
            UUID attachmentId = UUID.randomUUID();
            Instant now = Instant.now();
            Instant expiresAt = now.plusSeconds(7 * 24 * 60 * 60); // 7 días

            try (var conn = dataSource.getConnection();
                 var stmt = conn.prepareStatement("""
                     INSERT INTO chat_attachments (id, message_id, s3_key, original_name, mime_type, file_size, uploaded_at, expires_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     RETURNING id, message_id, s3_key, original_name, mime_type, file_size, uploaded_at, expires_at
                 """)) {
                stmt.setObject(1, attachmentId);
                stmt.setObject(2, UUID.fromString(messageId));
                stmt.setString(3, uploadResult.fileKey());
                stmt.setString(4, file.getOriginalFilename());
                stmt.setString(5, file.getContentType());
                stmt.setLong(6, file.getSize());
                stmt.setTimestamp(7, Timestamp.from(now));
                stmt.setTimestamp(8, Timestamp.from(expiresAt));

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        AttachmentResponse response = new AttachmentResponse(
                                rs.getObject("id", UUID.class).toString(),
                                rs.getString("original_name"),
                                rs.getString("mime_type"),
                                rs.getLong("file_size"),
                                uploadResult.publicFileUrl(),
                                rs.getTimestamp("uploaded_at").toInstant().toString(),
                                rs.getTimestamp("expires_at").toInstant().toString()
                        );
                        return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(response, "Attachment uploaded"));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to save attachment"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to upload attachment: " + e.getMessage()));
        }
    }

    // ─── GET /chat/attachments/{attachmentId}/download ─────────────────────────
    @GetMapping("/attachments/{attachmentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DownloadAttachmentResponse>> getDownloadUrl(
            @PathVariable String attachmentId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("""
                 SELECT ca.s3_key, ca.original_name, ca.mime_type, ca.file_size, ca.expires_at,
                        cm.conversation_id
                 FROM chat_attachments ca
                 JOIN chat_messages cm ON cm.id = ca.message_id
                 JOIN chat_conversations cc ON cc.id = cm.conversation_id
                 WHERE ca.id = ? AND (cc.company_id = ? OR cc.freelancer_id = ?)
             """)) {
            stmt.setObject(1, UUID.fromString(attachmentId));
            stmt.setObject(2, user.getUserId());
            stmt.setObject(3, user.getUserId());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String s3Key = rs.getString("s3_key");
                    String originalName = rs.getString("original_name");
                    String mimeType = rs.getString("mime_type");
                    long fileSize = rs.getLong("file_size");
                    Timestamp expiresAt = rs.getTimestamp("expires_at");

                    // Verificar si el archivo ha expirado
                    if (expiresAt.toInstant().isBefore(Instant.now())) {
                        return ResponseEntity.status(HttpStatus.GONE)
                                .body(ApiResponse.failure("El archivo ha expirado"));
                    }

                    // Generar URL de descarga firmada
                    StoragePort.PresignedDownloadResponse downloadResult =
                            storagePort.generatePresignedDownloadUrl(s3Key);

                    DownloadAttachmentResponse response = new DownloadAttachmentResponse(
                            downloadResult.downloadUrl(),
                            originalName,
                            mimeType,
                            fileSize
                    );
                    return ResponseEntity.ok(ApiResponse.success(response, "Download URL generated"));
                }
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Attachment not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to get download URL: " + e.getMessage()));
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private List<AttachmentResponse> getAttachmentsForMessage(UUID messageId) {
        List<AttachmentResponse> attachments = new ArrayList<>();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("""
                 SELECT id, original_name, mime_type, file_size, s3_key, uploaded_at, expires_at
                 FROM chat_attachments
                 WHERE message_id = ?
                 ORDER BY uploaded_at ASC
             """)) {
            stmt.setObject(1, messageId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String s3Key = rs.getString("s3_key");
                    String publicUrl = "https://" + getBucket() + ".s3." + getRegion() + ".amazonaws.com/" + s3Key;
                    attachments.add(new AttachmentResponse(
                            rs.getObject("id", UUID.class).toString(),
                            rs.getString("original_name"),
                            rs.getString("mime_type"),
                            rs.getLong("file_size"),
                            publicUrl,
                            rs.getTimestamp("uploaded_at").toInstant().toString(),
                            rs.getTimestamp("expires_at").toInstant().toString()
                    ));
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the message retrieval
        }
        return attachments;
    }

    private String getBucket() {
        // Fallback - en producción se obtiene de properties
        return System.getenv().getOrDefault("AWS_S3_BUCKET_NAME", "achanvear-storage");
    }

    private String getRegion() {
        return System.getenv().getOrDefault("AWS_REGION", "us-east-1");
    }

    // ─── POST /chat/conversations ──────────────────────────────────────────────
    @PostMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> startConversation(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody StartConversationRequest request
    ) {
        UUID userId = user.getUserId();
        UUID otherUserId = UUID.fromString(request.freelancerUserId());

        try (var conn = dataSource.getConnection()) {
            // Check if conversation already exists
            try (var checkStmt = conn.prepareStatement("""
                SELECT c.id, c.company_id, c.freelancer_id, c.updated_at,
                       u.full_name AS participant_name, u.role AS participant_role
                FROM chat_conversations c
                JOIN users u ON u.id = CASE WHEN c.company_id = ? THEN c.freelancer_id ELSE c.company_id END
                WHERE (c.company_id = ? AND c.freelancer_id = ?)
                   OR (c.company_id = ? AND c.freelancer_id = ?)
            """)) {
                checkStmt.setObject(1, otherUserId);
                checkStmt.setObject(2, userId);
                checkStmt.setObject(3, otherUserId);
                checkStmt.setObject(4, otherUserId);
                checkStmt.setObject(5, userId);

                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next()) {
                        // Existing conversation
                        Timestamp updatedTs = rs.getTimestamp("updated_at");
                        ConversationResponse existing = new ConversationResponse(
                                rs.getObject("id", UUID.class).toString(),
                                rs.getString("participant_name"),
                                rs.getString("participant_role"),
                                "",
                                updatedTs.toInstant().toString(),
                                0
                        );
                        return ResponseEntity.ok(ApiResponse.success(existing, "Conversation already exists"));
                    }
                }
            }

            // Create new conversation (company is the one starting it)
            try (var insertStmt = conn.prepareStatement("""
                INSERT INTO chat_conversations (id, company_id, freelancer_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, company_id, freelancer_id, updated_at
            """)) {
                UUID convId = UUID.randomUUID();
                Instant now = Instant.now();
                insertStmt.setObject(1, convId);
                insertStmt.setObject(2, userId); // The current user is the company
                insertStmt.setObject(3, otherUserId);
                insertStmt.setTimestamp(4, Timestamp.from(now));
                insertStmt.setTimestamp(5, Timestamp.from(now));

                try (ResultSet rs = insertStmt.executeQuery()) {
                    if (rs.next()) {
                        // Get participant name
                        String participantName = "";
                        try (var nameStmt = conn.prepareStatement(
                                "SELECT full_name, role FROM users WHERE id = ?")) {
                            nameStmt.setObject(1, otherUserId);
                            try (ResultSet nameRs = nameStmt.executeQuery()) {
                                if (nameRs.next()) {
                                    participantName = nameRs.getString("full_name");
                                }
                            }
                        }

                        ConversationResponse created = new ConversationResponse(
                                rs.getObject("id", UUID.class).toString(),
                                participantName,
                                "FREELANCER",
                                "",
                                now.toString(),
                                0
                        );
                        return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(created, "Conversation started"));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to start conversation"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to start conversation: " + e.getMessage()));
        }
    }

    // ─── DELETE /chat/messages/{messageId} ─────────────────────────────────────
    @DeleteMapping("/messages/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable String messageId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement(
                     "DELETE FROM chat_messages WHERE id = ? AND sender_id = ?")) {
            stmt.setObject(1, UUID.fromString(messageId));
            stmt.setObject(2, userId);
            int deleted = stmt.executeUpdate();
            if (deleted > 0) {
                return ResponseEntity.ok(ApiResponse.success(null, "Message deleted"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Message not found or not authorized"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to delete message: " + e.getMessage()));
        }
    }

    // ─── DELETE /chat/conversations/{id} ───────────────────────────────────────

    @DeleteMapping("/conversations/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @PathVariable String conversationId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement(
                     "DELETE FROM chat_conversations WHERE id = ? AND (company_id = ? OR freelancer_id = ?)")) {
            stmt.setObject(1, UUID.fromString(conversationId));
            stmt.setObject(2, userId);
            stmt.setObject(3, userId);
            int deleted = stmt.executeUpdate();
            if (deleted > 0) {
                return ResponseEntity.ok(ApiResponse.success(null, "Conversation deleted"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Conversation not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to delete conversation: " + e.getMessage()));
        }
    }
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

record ConversationResponse(
        String id,
        String participantName,
        String participantRole,
        String lastMessage,
        String lastMessageAt,
        int unreadCount
) {}

record AttachmentResponse(
        String id,
        String originalName,
        String mimeType,
        long fileSize,
        String url,
        String uploadedAt,
        String expiresAt
) {}

record DownloadAttachmentResponse(
        String downloadUrl,
        String originalName,
        String mimeType,
        long fileSize
) {}

record MessageResponse(
        String id,
        String conversationId,
        String content,
        String sentAt,
        boolean isMine,
        List<AttachmentResponse> attachments
) {}

record SendMessageRequest(
        @jakarta.validation.constraints.NotBlank String conversationId,
        String content
) {}


record StartConversationRequest(
        @jakarta.validation.constraints.NotBlank String freelancerUserId
) {}
