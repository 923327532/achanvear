package achanvear.peru.compliance.application.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record ConsentPageResponse(
        List<ConsentRecordResponse> items,
        long totalItems,
        int totalPages,
        int page,
        int size
) {

    public static ConsentPageResponse from(Page<ConsentRecordResponse> page) {
        return new ConsentPageResponse(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }
}
