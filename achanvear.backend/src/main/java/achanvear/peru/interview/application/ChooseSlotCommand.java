package achanvear.peru.interview.application;

public record ChooseSlotCommand(
        String scheduleId,
        int slotIndex
) {
}
