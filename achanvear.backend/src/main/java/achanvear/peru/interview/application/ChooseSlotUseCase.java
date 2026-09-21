package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.ChooseSlotResponse;

public interface ChooseSlotUseCase {

    ChooseSlotResponse execute(ChooseSlotCommand command);
}
