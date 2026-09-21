export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const createApiError = (message: string, status?: number, code?: string) => {
  return new ApiError(message, status, code);
};
