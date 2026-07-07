export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface HealthCheckResponse {
  status: "ok";
  uptime: number;
  timestamp: string;
  environment: string;
}
