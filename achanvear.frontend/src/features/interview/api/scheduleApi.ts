// features/interview/api/scheduleApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface SlotDto {
  index: number;
  dateTime: string;
  status: string;
}

export interface InterviewScheduleResponse {
  scheduleId: string;
  hiringProcessId: string;
  candidateId: string;
  jobId: string;
  interviewType: string;
  proposedSlots: SlotDto[];
  status: string;
}

export interface ChooseSlotResponse {
  scheduleId: string;
  interviewToken: string;
  chosenDateTime: string;
  message: string;
  interviewId: string;
}

export const scheduleApi = {
  // GET /interviews/schedule/my/{candidateId} - obtener schedules pendientes
  getMySchedules: async (candidateId: string): Promise<InterviewScheduleResponse[]> => {
    const response = await api.get<ApiResponse<InterviewScheduleResponse[]>>(`/interviews/schedule/my/${candidateId}`);
    return parseResponse(response);
  },

  // POST /interviews/schedule/{scheduleId}/choose - elegir horario
  chooseSlot: async (scheduleId: string, slotIndex: number): Promise<ChooseSlotResponse> => {
    const response = await api.post<ApiResponse<ChooseSlotResponse>>(`/interviews/schedule/${scheduleId}/choose`, { slotIndex });
    return parseResponse(response);
  },
};