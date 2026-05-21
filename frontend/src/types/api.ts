export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
