
export interface ApiResponseDto<TData> {
  readonly success: boolean;
  readonly data?: TData;
  readonly message?: string;
}